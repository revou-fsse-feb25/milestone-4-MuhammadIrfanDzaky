import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password?: string;
}