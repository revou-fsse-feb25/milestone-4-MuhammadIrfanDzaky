import { IsInt, IsPositive, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferResponseDto {
    @IsInt()
    @IsPositive()
    transferId: number;

    @IsInt()
    @IsPositive()
    fromAccountId: number;

    @IsInt()
    @IsPositive()
    toAccountId: number;

    @IsPositive()
    @Type(() => BigInt)
    amount: bigint;

    @IsString()
    status: string;

    @IsDate()
    @Type(() => Date)
    createdAt: Date;
}