import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';

export class WithdrawResponseDto {
    @ApiProperty({ 
        type: TransactionResponseDto,
        description: 'Transaction details' 
    })
    transaction: TransactionResponseDto;

    @ApiProperty({ 
        example: '800000', 
        description: 'New account balance after withdrawal' 
    })
    newBalance: string;
}