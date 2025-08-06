import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';

export class DepositResponseDto {
    @ApiProperty({ 
        type: TransactionResponseDto,
        description: 'Transaction details' 
    })
    transaction: TransactionResponseDto;

    @ApiProperty({ 
        example: '1000000', 
        description: 'New account balance after deposit' 
    })
    newBalance: string;
}