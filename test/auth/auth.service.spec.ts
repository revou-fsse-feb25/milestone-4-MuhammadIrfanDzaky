import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../../src/auth/dto/register.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwtService: JwtService;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Set environment variables for JWT
        process.env.JWT_SECRET = 'test-secret';
        
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AuthService,
            {
            provide: PrismaService,
            useValue: {
                user: {
                findUnique: jest.fn(),
                create: jest.fn(),
                },
            },
            },
            {
            provide: JwtService,
            useValue: {
                sign: jest.fn().mockImplementation((payload, options) => {
                return `mock-token-for-${payload.sub}`;
                }),
            },
            },
        ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        };

        it('should register a new user successfully', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: 1,
            email: dto.email,
            name: dto.name,
        });

        const result = await service.register(dto);

        expect(result).toEqual({
            id: 1,
            email: dto.email,
            name: dto.name,
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
        });

        it('should throw ConflictException if email exists', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            email: dto.email,
        });

        await expect(service.register(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
        };

        const mockUser = {
        id: 1,
        email: dto.email,
        password: 'hashedPassword',
        role: 'CUSTOMER',
        };

        it('should login successfully with valid credentials', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await service.login(dto);

        expect(result).toEqual({
            access_token: 'mock-token-for-1',
            userId: mockUser.id
        });
        
        // Verify JWT sign was called with correct parameters
        expect(jwtService.sign).toHaveBeenCalledWith(
            {
            sub: mockUser.id.toString(),
            email: mockUser.email,
            role: mockUser.role,
            },
            {
            secret: 'test-secret',
            expiresIn: '15m'
            }
        );
        });

        it('should throw UnauthorizedException if user not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException with invalid password', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });
    });
});