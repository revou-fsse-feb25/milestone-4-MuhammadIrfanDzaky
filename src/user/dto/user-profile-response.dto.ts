import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
    @ApiProperty({ example: 1, description: 'User ID' })
    id: number;

    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'John Doe', description: 'User name' })
    name: string;
}