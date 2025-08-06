import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { 
    ApiTags, 
    ApiOperation, 
    ApiBearerAuth,
    ApiResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiBody
} from '@nestjs/swagger';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('profile')
    @ApiOperation({ 
        summary: 'Get user profile',
        description: 'Retrieves authenticated user profile'
    })
    @ApiOkResponse({ 
        type: UserProfileResponseDto,
        description: 'User profile retrieved successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'User not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    async getProfile(@Req() req: RequestWithUser) {
        return this.userService.getProfile(req.user.id);
    }

    @Patch('profile')
    @ApiOperation({ 
        summary: 'Update user profile',
        description: 'Updates authenticated user profile information'
    })
    @ApiBody({ 
        type: UpdateUserDto,
        description: 'User profile update data' 
    })
    @ApiOkResponse({ 
        type: UserProfileResponseDto,
        description: 'Profile updated successfully' 
    })
    @ApiNotFoundResponse({ 
        description: 'User not found' 
    })
    @ApiForbiddenResponse({ 
        description: 'Access denied' 
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid request data' 
    })
    async updateProfile(
        @Req() req: RequestWithUser,
        @Body() dto: UpdateUserDto
    ) {
        return this.userService.updateProfile(req.user.id, dto);
    }
}