import { AccountResponseDto } from '../../account/dto/account-response.dto';
import { TransactionResponseDto } from '../../transaction/dto/transaction-response.dto';
import { Account, Transaction } from '@prisma/client';

export class MapperUtil {
    static toAccountResponse(account: Account): AccountResponseDto {
        return {
            id: account.id,
            accountNumber: account.accountNumber,
            type: account.type,
            balanceRaw: account.balance.toString(),
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        } as AccountResponseDto;
    }

    static toTransactionResponse(transaction: Transaction): TransactionResponseDto {
        return {
            id: transaction.id,
            amount: transaction.amount.toString(),
            type: transaction.type,
            status: transaction.status,
            fromAccountId: transaction.fromAccountId ?? undefined,
            toAccountId: transaction.toAccountId ?? undefined,
            createdAt: transaction.createdAt,
        };
    }
}