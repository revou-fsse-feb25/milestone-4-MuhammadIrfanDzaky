import {
    Controller,
    Post,
    Get,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountController {
    constructor(private accountService: AccountService) {}

    // CUSTOMER: Buat akun baru
    @Post()
    @Roles('CUSTOMER', 'ADMIN')
    createAccount(
        @Req() req: RequestWithUser,
        @Body() dto: CreateAccountDto
    ) {
        return this.accountService.createAccount(req.user.id, dto);
    }

    // CUSTOMER: Dapatkan semua akun milik sendiri
    @Get('my-accounts')
    @Roles('CUSTOMER', 'ADMIN')
    getUserAccounts(@Req() req: RequestWithUser) {
        return this.accountService.getUserAccounts(req.user.id);
    }

    // CUSTOMER: Dapatkan detail akun milik sendiri
    @Get(':id')
    @Roles('CUSTOMER', 'ADMIN')
    getAccountById(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) accountId: number
    ) {
        return this.accountService.getAccountById(req.user.id, accountId);
    }

    // CUSTOMER: Update akun milik sendiri
    @Patch(':id')
    @Roles('CUSTOMER', 'ADMIN')
    updateAccount(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) accountId: number,
        @Body() dto: UpdateAccountDto
    ) {
        return this.accountService.updateAccount(
        req.user.id,
        accountId,
        dto
        );
    }

    // CUSTOMER: Hapus akun milik sendiri (jika saldo 0)
    @Delete(':id')
    @Roles('CUSTOMER', 'ADMIN')
    deleteAccount(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) accountId: number
    ) {
        return this.accountService.deleteAccount(req.user.id, accountId);
    }

    // ADMIN-ONLY: Dapatkan semua akun (semua user)
    @Get()
    @Roles('ADMIN')
    getAllAccounts() {
        return this.accountService.getAllAccounts();
    }
}