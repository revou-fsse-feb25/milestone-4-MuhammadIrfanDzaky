import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class TransactionHistoryResponseDto {
    @ApiProperty({ example: 1, description: 'Transaction ID' })
    id: number;

    @ApiProperty({ example: '500000', description: 'Transaction amount in IDR' })
    amount: string;

    @ApiProperty({ 
        enum: TransactionType, 
        example: TransactionType.DEPOSIT, 
        description: 'Transaction type' 
    })
    type: TransactionType;

    @ApiProperty({ 
        enum: TransactionStatus, 
        example: TransactionStatus.COMPLETED, 
        description: 'Transaction status' 
    })
    status: TransactionStatus;

    @ApiProperty({ 
        example: '2023-08-05T12:00:00.000Z', 
        description: 'Transaction timestamp' 
    })
    createdAt: Date;

    @ApiProperty({ 
        required: false,
        example: 'REVO123456', 
        description: 'Source account number' 
    })
    fromAccountNumber?: string;

    @ApiProperty({ 
        required: false,
        example: 'REVO654321', 
        description: 'Destination account number' 
    })
    toAccountNumber?: string;

    @ApiProperty({ 
        required: false,
        example: 'John Doe', 
        description: 'Counterparty name' 
    })
    counterpartyName?: string;
}