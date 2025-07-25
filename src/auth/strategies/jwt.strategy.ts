import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: { sub: string; email: string }) {
        // Konversi ke number dengan parseInt
        const userId = parseInt(payload.sub, 10);
        
        return this.prisma.user.findUnique({
        where: { id: userId },
        });
    }
}