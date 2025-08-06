import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db-check')
  async dbCheck() {
    try {
      await this.prisma.user.count();
      return { status: 'Database connected' };
    } catch (error) {
      return { 
        status: 'Database connection failed',
        error: error.message
      };
    }
  }
}