import { Injectable } from "@nestjs/common";
import { DepositDto } from "./dto/deposit.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) {}

    async deposit(dto: DepositDto) {
        const amount = BigInt(dto.amount);
    
        await this.prisma.account.update({
            where: { id: dto.accountId },
            data: { balance: { increment: amount } }
        });
        
        return this.prisma.transaction.create({
            data: {
            amount,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            toAccountId: dto.accountId,
            }
        });
    }
}