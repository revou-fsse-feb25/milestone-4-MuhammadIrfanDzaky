import { IsEnum } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
    @IsEnum(AccountType)
    type: AccountType;
}