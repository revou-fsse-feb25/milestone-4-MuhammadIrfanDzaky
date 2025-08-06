import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
    @ApiProperty({ example: 1, description: 'User ID' })
    id: number;

    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'John Doe', description: 'User name' })
    name: string;

    @ApiProperty({ example: '2023-08-05T12:00:00.000Z', description: 'Creation timestamp' })
    createdAt: Date;
}