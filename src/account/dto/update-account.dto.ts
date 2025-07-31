import { IsEnum, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client';

export class UpdateAccountDto {
    @IsOptional()
    @IsEnum(AccountType)
    type?: AccountType;
}