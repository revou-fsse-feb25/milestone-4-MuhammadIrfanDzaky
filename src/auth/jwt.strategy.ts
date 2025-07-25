import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { Auth } from 'src/types/Auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConstants.secret,
        });
    }

    validate(payload: Auth) {
        try {
        const { id, username, role } = payload;
        if (!id || !username) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return { username, id, role };
        } catch (error) {
        console.log('JWT validation error:', error);
        throw new UnauthorizedException('Unauthorized');
        }
    }
}