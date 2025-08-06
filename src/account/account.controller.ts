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
import {
    ApiBody,
    ApiTags, 
    ApiOperation, 
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiConflictResponse
} from '@nestjs/swagger';
import { AccountResponseDto } from './dto/account-response.dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountController {
    constructor(private accountService: AccountService) {}

    @Post()
    @Roles('CUSTOMER', 'ADMIN')
    @ApiOperation({ 
        summary: 'Create new account',
        description: 'Creates a new bank account for the authenticated user'
    })
    @ApiBody({ 
        type: CreateAccountDto,
        description: 'Account creation data' 
    })
    @ApiCreatedResponse({ 
        type: AccountResponseDto,
        description: 'Account created successfully' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    createAccount(
        @Req() req: RequestWithUser,
        @Body() dto: CreateAccountDto
    ) {
        return this.accountService.createAccount(req.user.id, dto);
    }

    @Get('my-accounts')
    @Roles('CUSTOMER', 'ADMIN')
    @ApiOperation({ 
        summary: 'Get user accounts',
        description: 'Retrieves all accounts belonging to the authenticated user'
    })
    @ApiOkResponse({ 
        type: [AccountResponseDto],
        description: 'Accounts retrieved successfully' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    getUserAccounts(@Req() req: RequestWithUser) {
        return this.accountService.getUserAccounts(req.user.id);
    }

    @Get(':id')
    @Roles('CUSTOMER', 'ADMIN')
    @ApiOperation({ 
        summary: 'Get account details',
        description: 'Retrieves details of a specific account'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'Account ID', 
        type: Number 
    })
    @ApiOkResponse({ 
        type: AccountResponseDto,
        description: 'Account details retrieved successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    getAccountById(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) accountId: number
    ) {
        return this.accountService.getAccountById(req.user.id, accountId);
    }

    @Patch(':id')
    @Roles('CUSTOMER', 'ADMIN')
    @ApiOperation({ 
        summary: 'Update account',
        description: 'Updates account details'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'Account ID', 
        type: Number 
    })
    @ApiBody({ 
        type: UpdateAccountDto,
        description: 'Account update data' 
    })
    @ApiOkResponse({ 
        type: AccountResponseDto,
        description: 'Account updated successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
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

    @Delete(':id')
    @Roles('CUSTOMER', 'ADMIN')
    @ApiOperation({ 
        summary: 'Delete account',
        description: 'Deletes an account (only if balance is zero and no transactions)'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'Account ID', 
        type: Number 
    })
    @ApiOkResponse({ 
        type: AccountResponseDto,
        description: 'Account deleted successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied or account not deletable' 
    })
    @ApiConflictResponse({ 
        description: 'Account has balance or transactions' 
    })
    deleteAccount(
        @Req() req: RequestWithUser,
        @Param('id', ParseIntPipe) accountId: number
    ) {
        return this.accountService.deleteAccount(req.user.id, accountId);
    }

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ 
        summary: 'Get all accounts (Admin only)',
        description: 'Retrieves all accounts in the system (admin only)'
    })
    @ApiOkResponse({ 
        type: [AccountResponseDto],
        description: 'Accounts retrieved successfully' 
    })
    @ApiForbiddenResponse({ 
        description: 'Admin access required' 
    })
    getAllAccounts() {
        return this.accountService.getAllAccounts();
    }
}