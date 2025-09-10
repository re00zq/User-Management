import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersQueryService } from './services/users-query.service';
import { UsersCommandService } from './services/users-command.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role';

@ApiTags('Users')
@ApiBearerAuth() // Indicates that all endpoints in this controller require a JWT bearer token.
@UseGuards(AuthGuard('jwt'), RolesGuard) // Protect all routes in this controller.
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryService: UsersQueryService,
    private readonly usersCommandService: UsersCommandService,
  ) {}

  // NOTE: User creation is handled by POST /auth/register.
  // A dedicated POST /users endpoint could be created for admin-only use if needed.

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page.',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter users by their active status.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search for users by username or email.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'username', 'email'],
    description: 'Field to sort by.',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order.',
  })
  @ApiResponse({ status: 200, description: 'A paginated list of users.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryUserDto: QueryUserDto,
  ) {
    return this.usersQueryService.findAll(queryUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: 200, description: 'The user object.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersQueryService.findOneById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: "Update a user's information" })
  @ApiResponse({ status: 200, description: 'The updated user object.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 409,
    description: 'Username or email already in use by another account.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersCommandService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  @ApiResponse({ status: 200, description: 'The user with updated status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersCommandService.updateStatus(id, updateUserStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersCommandService.remove(id);
  }
}
