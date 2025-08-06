import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { CurrencyUtil } from '../common/utils/currency.utils';
import { MapperUtil } from '../common/utils/mapper.utils';

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) {}

    // CREATE (Deposit)
    async deposit(userId: number, dto: DepositDto) {
        const { accountId, amount } = dto;
        try {
            return await this.prisma.$transaction(async (prisma) => {
                const account = await prisma.account.findUnique({
                where: { id: accountId },
                });
                if (!account) {
                throw new NotFoundException('Account not found');
                }
                if (account.userId !== userId) {
                throw new ForbiddenException('You do not own this account');
                }
                const amountBigInt = BigInt(amount);
                const updatedAccount = await prisma.account.update({
                where: { id: accountId },
                data: { balance: account.balance + amountBigInt },
                });
                const transaction = await prisma.transaction.create({
                data: {
                    amount: amountBigInt,
                    type: TransactionType.DEPOSIT,
                    status: TransactionStatus.COMPLETED,
                    toAccountId: accountId,
                },
                });
                return {
                transaction: MapperUtil.toTransactionResponse(transaction),
                newBalance: updatedAccount.balance.toString(),
                };
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('Database error during deposit:', error.message, error.meta);
                switch (error.code) {
                case 'P2025':
                    throw new NotFoundException('Account not found');
                case 'P2002':
                    throw new ForbiddenException(
                    `Transaction conflict on field: ${error.meta?.target || 'unknown'}. Please retry`,
                    );
                default:
                    throw new InternalServerErrorException('Database operation failed');
                }
            }
            console.error('Unexpected deposit error:', error);
            throw new InternalServerErrorException('Deposit failed due to technical issues');
        }
    }

    // CREATE (Withdraw)
    async withdraw(userId: number, dto: WithdrawDto) {
        const { accountId, amount } = dto;
        try {
            return await this.prisma.$transaction(async (prisma) => {
                const account = await prisma.account.findUnique({
                    where: { id: accountId },
                });
                if (!account) {
                    throw new NotFoundException('Account not found');
                }
                if (account.userId !== userId) {
                    throw new ForbiddenException('You do not own this account');
                }
                const amountBigInt = BigInt(amount); // Ensure BigInt
                if (account.balance < amountBigInt) {
                    const formattedBalance = typeof CurrencyUtil?.formatIDR === 'function'
                    ? CurrencyUtil.formatIDR(account.balance)
                    : `Rp${account.balance.toString()}`;
                    throw new ForbiddenException(
                    `Insufficient balance. Current balance: ${formattedBalance}`
                    );
                }
                const updatedAccount = await prisma.account.update({
                    where: { id: accountId },
                    data: { balance: account.balance - amountBigInt },
                });
                const transaction = await prisma.transaction.create({
                    data: {
                    amount: amountBigInt,
                    type: TransactionType.WITHDRAWAL,
                    status: TransactionStatus.COMPLETED,
                    fromAccountId: accountId,
                    },
                });
                return {
                    transaction: {
                    ...MapperUtil.toTransactionResponse(transaction),
                    amountRaw: transaction.amount.toString(),
                    },
                    newBalance: updatedAccount.balance.toString(),
                };
            });
        } catch (error) {
            // Handle error khusus Prisma
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('Database error during withdrawal:', error.message);
                
                switch (error.code) {
                    case 'P2025':
                        throw new NotFoundException('Account not found');
                    case 'P2002':
                        throw new ForbiddenException('Transaction conflict. Please retry');
                    default:
                        throw new InternalServerErrorException('Database operation failed');
                }
            }
            
            // Handle error yang sudah kita throw sebelumnya
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            
            // Handle error tak terduga
            console.error('Unexpected withdrawal error:', error);
            throw new InternalServerErrorException('Withdrawal failed due to technical issues');
        }
    }

    // CREATE (Transfer)
    async transfer(userId: number, dto: TransferDto) {
        const { fromAccountId, toAccountId, amount } = dto;
        try {
            const transactionRecord = await this.prisma.$transaction(async (prisma) => {
                const fromAccount = await prisma.account.findUnique({
                    where: { id: fromAccountId },
                });
                if (!fromAccount) {
                    throw new ForbiddenException('Source account not found');
                }
                if (fromAccount.userId !== userId) {
                    throw new ForbiddenException('You do not own the source account');
                }
                const toAccount = await prisma.account.findUnique({
                    where: { id: toAccountId },
                });
                if (!toAccount) {
                    throw new ForbiddenException('Destination account not found');
                }
                if (fromAccountId === toAccountId) {
                    throw new ForbiddenException('Cannot transfer to the same account');
                }
                const amountBigInt = BigInt(amount); // Ensure BigInt
                if (fromAccount.balance < amountBigInt) {
                    throw new ForbiddenException('Insufficient balance');
                }
                await prisma.account.update({
                    where: { id: fromAccountId },
                    data: { balance: fromAccount.balance - amountBigInt },
                });
                await prisma.account.update({
                    where: { id: toAccountId },
                    data: { balance: toAccount.balance + amountBigInt },
                });
                const transaction = await prisma.transaction.create({
                    data: {
                    amount: amountBigInt,
                    type: TransactionType.TRANSFER,
                    status: TransactionStatus.COMPLETED,
                    fromAccountId,
                    toAccountId,
                    },
                });
                return transaction;
            });
            return {
            ...MapperUtil.toTransactionResponse(transactionRecord),
            amountRaw: transactionRecord.amount.toString(),
            };
        } catch (error) {
            // Handle error khusus Prisma
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('Database error during transfer:', error.message);
                
                switch (error.code) {
                    case 'P2025':
                        throw new ForbiddenException('Account not found. Please check account IDs');
                    case 'P2002':
                        throw new ForbiddenException('Transaction conflict. Please retry');
                    default:
                        throw new InternalServerErrorException('Database operation failed');
                }
            }
            
            // Handle error yang sudah throw sebelumnya
            if (error instanceof ForbiddenException) {
                throw error;
            }
            
            // Handle error tak terduga
            console.error('Unexpected transfer error:', error);
            throw new InternalServerErrorException('Transfer failed due to technical issues');
        }
    }

    // READ (Transaction History)
    async getHistory(userId: number, accountId: number) {
        // Validasi kepemilikan akun
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        
        if (!account || account.userId !== userId) {
            throw new ForbiddenException('Account not found or access denied');
        }

        const transactions = await this.prisma.transaction.findMany({
            where: {
                OR: [
                    { fromAccountId: accountId },
                    { toAccountId: accountId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                fromAccount: {
                    select: {
                        accountNumber: true,
                        user: { select: { name: true } },
                    },
                },
                toAccount: {
                    select: {
                        accountNumber: true,
                        user: { select: { name: true } },
                    },
                },
            },
        });

        return transactions.map(tx => ({
            ...MapperUtil.toTransactionResponse(tx),
            amount: tx.amount.toString(),
        }));
    }
}