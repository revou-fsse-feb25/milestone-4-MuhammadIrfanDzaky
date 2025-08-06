import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class WithdrawDto {
    @IsInt()
    @IsPositive()
    accountId: number;

    @IsPositive()
    @Type(() => BigInt)
    amount: bigint;
}