import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ 
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
        description: 'JWT access token' 
    })
    access_token: string;

    @ApiProperty({ example: 1, description: 'User ID' })
    userId: number;
}