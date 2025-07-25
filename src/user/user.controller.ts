import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { User } from '@prisma/client';

// Perbaiki tipe kustom
export interface RequestWithUser extends Request {
    user: User;
    }

    @UseGuards(JwtAuthGuard)
    @Controller('user')
    export class UserController {
    constructor(private userService: UserService) {}

    @Get('profile')
    async getProfile(@Req() req: RequestWithUser) {
        return this.userService.getProfile(req.user.id);
    }

    @Patch('profile')
    async updateProfile(
        @Req() req: RequestWithUser,
        @Body() dto: UpdateUserDto
    ) {
        return this.userService.updateProfile(req.user.id, dto);
    }
}