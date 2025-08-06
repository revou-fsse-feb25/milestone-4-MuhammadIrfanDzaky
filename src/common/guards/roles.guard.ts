import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 1. Dapatkan user dari request
        const { user } = context.switchToHttp().getRequest();
        
        // 2. Validasi dasar: user harus punya role
        if (!user?.role) {
            throw new ForbiddenException('Invalid user role');
        }

        // 3. Handle endpoint tanpa dekorator @Roles
        if (!requiredRoles) {
            return user.role === Role.ADMIN;
        }

        // 4. Handle endpoint dengan dekorator @Roles
        return requiredRoles.includes(user.role);
    }
}