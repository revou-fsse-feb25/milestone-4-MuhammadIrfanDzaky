import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/transaction/transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { CurrencyUtil } from '../../src/common/utils/currency.utils';

jest.mock('../../src/common/utils/currency.utils', () => ({
    CurrencyUtil: {
        formatIDR: jest.fn().mockImplementation(amount => `Rp${amount}`)
    }
}));

describe('TransactionService', () => {
    let service: TransactionService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            TransactionService,
            {
            provide: PrismaService,
            useValue: {
                $transaction: jest.fn(),
                account: {
                findUnique: jest.fn(),
                update: jest.fn(),
                },
                transaction: {
                create: jest.fn(),
                },
            },
            },
            // Add explicit CurrencyUtil provider
            {
            provide: CurrencyUtil,
            useValue: {
                formatIDR: jest.fn().mockImplementation(amount => `Rp${amount}`)
            }
            }
        ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    const mockTransaction = (fn) => {
        (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
            try {
                return await cb({
                    account: {
                        findUnique: prisma.account.findUnique,
                        update: prisma.account.update,
                    },
                    transaction: {
                        create: prisma.transaction.create,
                    }
                });
            } catch (error) {
                throw error;
            }
        });
        return fn();
    };

    describe('transfer', () => {
        const userId = 1;
        const dto = {
            fromAccountId: 1,
            toAccountId: 2,
            amount: 500000n
        };

        it('should complete transfer successfully', async () => {
        const fromAccount = { id: 1, userId, balance: 1000000n };
        const toAccount = { id: 2, balance: 2000000n };

        await mockTransaction(async () => {
            (prisma.account.findUnique as jest.Mock)
            .mockResolvedValueOnce(fromAccount)
            .mockResolvedValueOnce(toAccount);

            (prisma.account.update as jest.Mock).mockResolvedValue({});
            (prisma.transaction.create as jest.Mock).mockResolvedValue({});

            await service.transfer(userId, dto);
            expect(prisma.transaction.create).toHaveBeenCalled();
        });
        });

        it('should reject transfer to same account', async () => {
        await mockTransaction(async () => {
            const sameAccountDto = { ...dto, toAccountId: dto.fromAccountId };
            await expect(service.transfer(userId, sameAccountDto))
            .rejects.toThrow(ForbiddenException);
        });
        });

        it('should reject for insufficient balance', async () => {
            const fromAccount = { id: 1, userId, balance: 100000n };
            const toAccount = { id: 2, balance: 2000000n };

            await mockTransaction(async () => {
                (prisma.account.findUnique as jest.Mock)
                    .mockResolvedValueOnce(fromAccount)
                    .mockResolvedValueOnce(toAccount);

                await expect(service.transfer(userId, dto))
                    .rejects.toThrow(ForbiddenException);
            });
        });

        it('should reject for wrong source account owner', async () => {
        const fromAccount = { id: 1, userId: 2, balance: 1000000n };
        const toAccount = { id: 2, balance: 2000000n };

        await mockTransaction(async () => {
            (prisma.account.findUnique as jest.Mock)
            .mockResolvedValueOnce(fromAccount)
            .mockResolvedValueOnce(toAccount);

            await expect(service.transfer(userId, dto))
            .rejects.toThrow(ForbiddenException);
        });
        });

        it('should reject for invalid destination account', async () => {
        const fromAccount = { id: 1, userId, balance: 1000000n };

        await mockTransaction(async () => {
            (prisma.account.findUnique as jest.Mock)
            .mockResolvedValueOnce(fromAccount)
            .mockResolvedValueOnce(null);

            await expect(service.transfer(userId, dto))
            .rejects.toThrow(ForbiddenException);
        });
        });
    });

    describe('withdraw', () => {
        const userId = 1;
        const dto = { accountId: 1, amount: 500000n };

        it('should reject for insufficient balance', async () => {
            const account = { id: 1, userId, balance: 100000n };

            await mockTransaction(async () => {
                (prisma.account.findUnique as jest.Mock).mockResolvedValue(account);
                
                await expect(service.withdraw(userId, dto))
                    .rejects.toThrow(ForbiddenException);
                
                expect(CurrencyUtil.formatIDR).toHaveBeenCalledWith(100000n);
            });
        });
    });

    describe('deposit', () => {
        const userId = 1;
        const dto = { accountId: 1, amount: 500000n };

        it('should reject for invalid account owner', async () => {
        const account = { id: 1, userId: 2, balance: 0n };

        await mockTransaction(async () => {
            (prisma.account.findUnique as jest.Mock).mockResolvedValue(account);
            
            await expect(service.deposit(userId, dto))
            .rejects.toThrow(ForbiddenException);
        });
        });
    });
});