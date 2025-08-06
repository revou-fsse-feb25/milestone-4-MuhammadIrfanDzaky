import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiBearerAuth,
    ApiBody,
    ApiResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiQuery
} from '@nestjs/swagger';
import { DepositResponseDto } from './dto/deposit-response.dto';
import { WithdrawResponseDto } from './dto/withdraw-response.dto';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { TransactionHistoryResponseDto } from './dto/transaction-history-response.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('deposit')
    @Roles('CUSTOMER')
    @ApiOperation({ 
        summary: 'Deposit money',
        description: 'Deposits money into an account'
    })
    @ApiBody({ 
        type: DepositDto,
        description: 'Deposit details' 
    })
    @ApiCreatedResponse({ 
        type: DepositResponseDto,
        description: 'Deposit successful' 
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
    deposit(
        @Req() req: RequestWithUser,
        @Body() dto: DepositDto,
    ) {
        return this.transactionService.deposit(
        req.user.id,
        dto,
        );
    }

    @Post('withdraw')
    @Roles('CUSTOMER')
    @ApiOperation({ 
        summary: 'Withdraw money',
        description: 'Withdraws money from an account'
    })
    @ApiBody({ 
        type: WithdrawDto,
        description: 'Withdrawal details' 
    })
    @ApiCreatedResponse({ 
        type: WithdrawResponseDto,
        description: 'Withdrawal successful' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied or insufficient funds' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    withdraw(
        @Req() req: RequestWithUser,
        @Body() dto: WithdrawDto,
    ) {
        return this.transactionService.withdraw(
        req.user.id,
        dto,
        );
    }

    @Post('transfer')
    @Roles('CUSTOMER')
    @ApiOperation({ 
        summary: 'Transfer money',
        description: 'Transfers money between accounts'
    })
    @ApiBody({ 
        type: TransferDto,
        description: 'Transfer details' 
    })
    @ApiCreatedResponse({ 
        type: TransferResponseDto,
        description: 'Transfer successful' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied, insufficient funds, or same account transfer' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    transfer(
        @Req() req: RequestWithUser,
        @Body() dto: TransferDto,
    ) {
        return this.transactionService.transfer(
        req.user.id,
        dto,
        );
    }

    @Get('history')
    @Roles('CUSTOMER')
    @ApiOperation({ 
        summary: 'Get transaction history',
        description: 'Retrieves transaction history for an account'
    })
    @ApiQuery({ 
        name: 'accountId', 
        description: 'Account ID', 
        type: Number 
    })
    @ApiOkResponse({ 
        type: [TransactionHistoryResponseDto],
        description: 'Transaction history retrieved successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'Account not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    getHistory(
        @Req() req: RequestWithUser,
        @Query('accountId', ParseIntPipe) accountId: number,
    ) {
        return this.transactionService.getHistory(
        req.user.id,
        accountId,
        );
    }
}