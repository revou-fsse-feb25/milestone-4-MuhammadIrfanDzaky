import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
        data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            role: 'CUSTOMER',
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
        });

        return user;
    }

    async login(dto: LoginDto) {
        // 1. Cari user dengan email yang diberikan
        const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });

        // 2. Jika user tidak ditemukan, langsung lempar error
        if (!user) {
        console.error(`User not found for email: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Verifikasi password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        
        // 4. Jika password tidak valid, lempar error
        if (!isPasswordValid) {
        console.error(`Invalid password for user: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
        }

        // 5. Jika semua valid, buat payload JWT
        // PERBAIKAN: Gunakan nullish coalescing untuk handle undefined
        const payload = {
        sub: user.id.toString(),
        email: user?.email ?? '' // Handle kemungkinan undefined
        };
        
        return {
        access_token: this.jwtService.sign(payload),
        };
    }
}