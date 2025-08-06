import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        });
        
        if (!user) {
            throw new NotFoundException('User not found'); // Gunakan NotFoundException
        }
        return user;
    }

    async updateProfile(userId: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }});
        if (!user) throw new ForbiddenException('User not found');

        const updateData: { name?: string; email?: string; password?: string } = {};

        if (dto.name) updateData.name = dto.name;
        if (dto.email) updateData.email = dto.email;
        if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
        },
        });
    }
}