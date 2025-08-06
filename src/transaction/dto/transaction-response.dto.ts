import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class TransactionResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    amount: string;

    @ApiProperty()
    type: TransactionType;

    @ApiProperty()
    status: TransactionStatus;

    @ApiProperty({ required: false })
    fromAccountId?: number;

    @ApiProperty({ required: false })
    toAccountId?: number;

    @ApiProperty()
    createdAt: Date;
}