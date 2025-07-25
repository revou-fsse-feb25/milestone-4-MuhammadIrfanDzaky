import { IsNumber, Min, IsPositive, IsInt } from 'class-validator';

export class DepositDto {
    @IsNumber()
    @Min(1000) // Minimum deposit 1,000 IDR
    @IsPositive()
    amount: number; // Frontend sends as number
    
    @IsInt()
    @IsPositive()
    accountId: number;
}