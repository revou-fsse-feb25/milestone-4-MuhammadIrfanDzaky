import { CurrencyUtil } from '../../common/utils/currency.utils';

export class AccountResponseDto {
    id: string;
    accountNumber: string;
    type: string;
    
    // Raw BigInt value
    balanceRaw: bigint;
    
    // Formatted IDR string
    get balanceFormatted(): string {
        return CurrencyUtil.formatIDR(this.balanceRaw);
    }
}