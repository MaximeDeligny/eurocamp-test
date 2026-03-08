/**
 * User Controller - Exposes user endpoints
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto';
import {
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
} from '../../application/use-cases/user';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieves all users with caching and retry logic' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  async getAllUsers() {
    return this.getAllUsersUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieves a specific user with caching and retry logic' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user', description: 'Creates a new user with retry logic and cache invalidation' })
  @ApiBody({ type: CreateUserDto, description: 'User data (id will be auto-generated)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Deletes a user with retry logic and cache invalidation' })
  @ApiParam({ name: 'id', description: 'User ID to delete', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}
