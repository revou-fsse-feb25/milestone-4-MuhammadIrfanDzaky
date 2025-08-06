import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType } from '@prisma/client';
import { MapperUtil } from '../common/utils/mapper.utils';

@Injectable()
export class AccountService {
    constructor(private prisma: PrismaService) {}

    // CREATE
    async createAccount(userId: number, dto: CreateAccountDto) {
        let accountNumber = '';
        const maxAttempts = 10;

        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            accountNumber = `REVO${Math.floor(100000 + Math.random() * 900000)}`;
            const existingAccount = await this.prisma.account.findUnique({
                where: { accountNumber },
            });
            if (!existingAccount) {
                const account = await this.prisma.account.create({
                data: {
                    accountNumber,
                    type: dto.type as AccountType,
                    userId,
                    balance: 0n,
                },
                });
                return MapperUtil.toAccountResponse(account);
            }
        }
        throw new ForbiddenException('Unable to generate unique account number after multiple attempts');
    }

    // READ (User's Accounts)
    async getUserAccounts(userId: number) {
        const accounts = await this.prisma.account.findMany({
            where: { userId },
        });
        return accounts.map(account => MapperUtil.toAccountResponse(account));
    }

    // READ (Single Account)
    async getAccountById(userId: number, accountId: number) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { user: true },
        });
        if (!account || account.user.id !== userId) {
            throw new ForbiddenException('Account not found or access denied');
        }
        return MapperUtil.toAccountResponse(account);
    }

    // UPDATE
    async updateAccount(userId: number, accountId: number, dto: UpdateAccountDto) {
        await this.getAccountById(userId, accountId);
        const account = await this.prisma.account.update({
            where: { id: accountId },
            data: {
                type: dto.type as AccountType,
            },
        });
        return MapperUtil.toAccountResponse(account);
    }

    // DELETE
    async deleteAccount(userId: number, accountId: number) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { user: true },
        });
        if (!account || account.user.id !== userId) {
            throw new ForbiddenException('Account not found or access denied');
        }
        if (account.balance !== 0n) {
            throw new ForbiddenException('Account balance must be zero to delete');
        }
        const relatedTransactions = await this.prisma.transaction.count({
            where: {
                OR: [
                { fromAccountId: accountId },
                { toAccountId: accountId },
                ],
            },
        });
        if (relatedTransactions > 0) {
            throw new ForbiddenException('Cannot delete account with transaction history');
        }
        const deletedAccount = await this.prisma.account.delete({
            where: { id: accountId },
        });
        return MapperUtil.toAccountResponse(deletedAccount);
    }

    // ADMIN-ONLY (Get All Accounts)
    async getAllAccounts() {
        const accounts = await this.prisma.account.findMany({
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
        return accounts.map(account => ({
        ...MapperUtil.toAccountResponse(account),
        user: account.user,
        }));
    }
}