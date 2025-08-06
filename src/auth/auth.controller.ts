import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiBody, 
    ApiResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiConflictResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse 
} from '@nestjs/swagger';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ 
        summary: 'Register new user',
        description: 'Creates a new customer account'
    })
    @ApiBody({ 
        type: RegisterDto,
        description: 'User registration details' 
    })
    @ApiCreatedResponse({ 
        type: RegisterResponseDto,
        description: 'User successfully registered' 
    })
    @ApiConflictResponse({ 
        description: 'Email already registered' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticates user and returns JWT token'
    })
    @ApiBody({ 
        type: LoginDto,
        description: 'User credentials' 
    })
    @ApiOkResponse({ 
        type: LoginResponseDto,
        description: 'Login successful' 
    })
    @ApiUnauthorizedResponse({ 
        description: 'Invalid credentials' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}