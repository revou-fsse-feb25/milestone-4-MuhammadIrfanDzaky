import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { CurrencyUtil } from '../../common/utils/currency.utils';

export class AccountResponseDto {
    @ApiProperty({ example: 1, description: 'Account ID' })
    id: number;

    @ApiProperty({ example: 'REVO123456', description: 'Account number' })
    accountNumber: string;

    @ApiProperty({ 
        enum: AccountType, 
        example: AccountType.SAVINGS, 
        description: 'Account type' 
    })
    type: AccountType;

    @ApiProperty({ 
        example: '1000000', 
        description: 'Account balance in IDR, raw value as bigint' 
    })
    balanceRaw: string;

    @ApiProperty({ 
        example: 'Rp 1.000.000,00', 
        description: 'Formatted account balance in IDR' 
    })
    get balance(): string {
        return CurrencyUtil.formatIDR(BigInt(this.balanceRaw || '0'));
    }

    @ApiProperty({ example: '2025-08-06T00:00:00.000Z', description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ example: '2025-08-06T00:00:00.000Z', description: 'Account last updated date' })
    updatedAt: Date;
}