import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../../src/account/account.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: {
            account: {
              findUnique: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            transaction: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('deleteAccount', () => {
    const userId = 1;
    const accountId = 1;

    it('should delete account successfully', async () => {
      const mockAccount = {
        id: accountId,
        userId,
        balance: 0n,
        user: { id: userId }
      };
      
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(0);
      (prisma.account.delete as jest.Mock).mockResolvedValue(mockAccount);

      await service.deleteAccount(userId, accountId);
      expect(prisma.account.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if balance not zero', async () => {
      const mockAccount = {
        id: accountId,
        userId,
        balance: 1000000n,
        user: { id: userId }
      };
      
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);

      await expect(service.deleteAccount(userId, accountId))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if transaction history exists', async () => {
      const mockAccount = {
        id: accountId,
        userId,
        balance: 0n,
        user: { id: userId }
      };
      
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(5);

      await expect(service.deleteAccount(userId, accountId))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for wrong owner', async () => {
      const mockAccount = {
        id: accountId,
        userId: 2,
        balance: 0n,
        user: { id: 2 }
      };
      
      (prisma.account.findUnique as jest.Mock).mockResolvedValue(mockAccount);

      await expect(service.deleteAccount(userId, accountId))
        .rejects.toThrow(ForbiddenException);
    });
  });
});