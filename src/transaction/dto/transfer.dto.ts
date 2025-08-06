import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferDto {
    @IsInt()
    @IsPositive()
    fromAccountId: number;

    @IsInt()
    @IsPositive()
    toAccountId: number;

    @IsPositive()
    @Type(() => BigInt)
    amount: bigint;
}