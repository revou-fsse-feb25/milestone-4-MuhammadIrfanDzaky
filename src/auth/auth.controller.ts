import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Register new user' })
    @ApiBody({ type: RegisterDto })
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}