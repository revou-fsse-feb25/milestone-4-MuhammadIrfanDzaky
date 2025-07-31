import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountService {
    constructor(private prisma: PrismaService) {}

    async createAccount(userId: number, dto: CreateAccountDto) {
        // Generate unique account number (contoh sederhana)
        const accountNumber = `REVO${Date.now().toString().slice(-6)}`;
        
        return this.prisma.account.create({
        data: {
            accountNumber,
            type: dto.type as AccountType,
            userId,
            balance: 0n, // Saldo awal 0
        },
        });
    }

    async getUserAccounts(userId: number) {
        return this.prisma.account.findMany({
        where: { userId },
        });
    }

    async getAccountById(userId: number, accountId: number) {
        const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        });

        if (!account) throw new ForbiddenException('Account not found');
        if (account.userId !== userId) {
        throw new ForbiddenException('You can only access your own accounts');
        }

        return account;
    }

    async updateAccount(
        userId: number,
        accountId: number,
        dto: UpdateAccountDto
    ) {
        // Verifikasi kepemilikan
        await this.getAccountById(userId, accountId);

        return this.prisma.account.update({
        where: { id: accountId },
        data: {
            type: dto.type as AccountType,
        },
        });
    }

    async deleteAccount(userId: number, accountId: number) {
        // Verifikasi kepemilikan
        const account = await this.getAccountById(userId, accountId);

        // Cek saldo sebelum hapus
        if (account.balance !== 0n) {
        throw new ForbiddenException('Account balance must be zero to delete');
        }

        return this.prisma.account.delete({
        where: { id: accountId },
        });
    }

    // ADMIN-ONLY METHODS
    async getAllAccounts() {
        return this.prisma.account.findMany({
        include: {
            user: {
            select: {
                id: true,
                email: true,
                name: true,
            },
            },
        },
        });
    }
}