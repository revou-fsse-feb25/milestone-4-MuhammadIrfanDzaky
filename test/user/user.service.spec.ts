import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('newHashedPassword'),
}));

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            UserService,
            {
            provide: PrismaService,
            useValue: {
                user: {
                findUnique: jest.fn(),
                update: jest.fn(),
                },
            },
            },
        ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
        const userId = 1;
        const mockUser = {
            id: userId,
            email: 'test@example.com',
            name: 'Test User',
        };

        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

        const result = await service.getProfile(userId);

        expect(result).toEqual(mockUser);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
            select: { id: true, email: true, name: true },
        });
        });

        it('should throw NotFoundException if user not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
        await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateProfile', () => {
        const userId = 1;
        const dto = { name: 'Updated Name', password: 'newPassword' };

        beforeEach(() => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
        });

        it('should update user profile', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue({
            id: userId,
            email: 'test@example.com',
            name: dto.name,
        });

        const result = await service.updateProfile(userId, dto);

        expect(result).toEqual({
            id: userId,
            email: 'test@example.com',
            name: dto.name,
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
        });

        it('should update without password', async () => {
        // Reset mock counts
        (bcrypt.hash as jest.Mock).mockClear();
        
        const { password, ...dtoWithoutPass } = dto;
        (prisma.user.update as jest.Mock).mockResolvedValue({
            id: userId,
            email: 'test@example.com',
            name: dto.name,
        });

        const result = await service.updateProfile(userId, dtoWithoutPass);

        expect(result).toEqual({
            id: userId,
            email: 'test@example.com',
            name: dto.name,
        });
        expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
        await expect(service.updateProfile(userId, dto)).rejects.toThrow(
            ForbiddenException
        );
        });
    });
});