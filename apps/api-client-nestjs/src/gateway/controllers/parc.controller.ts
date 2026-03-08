/**
 * Parc Controller - Exposes parc endpoints
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
import { CreateParcDto } from '../dto';
import {
  GetAllParcsUseCase,
  GetParcByIdUseCase,
  CreateParcUseCase,
  DeleteParcUseCase,
} from '../../application/use-cases/parc';

@ApiTags('parcs')
@Controller('parcs')
export class ParcController {
  constructor(
    private readonly getAllParcsUseCase: GetAllParcsUseCase,
    private readonly getParcByIdUseCase: GetParcByIdUseCase,
    private readonly createParcUseCase: CreateParcUseCase,
    private readonly deleteParcUseCase: DeleteParcUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all parcs', description: 'Retrieves all parcs with caching and retry logic' })
  @ApiResponse({ status: 200, description: 'List of parcs retrieved successfully' })
  async getAllParcs() {
    return this.getAllParcsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parc by ID', description: 'Retrieves a specific parc with caching and retry logic' })
  @ApiParam({ name: 'id', description: 'Parc ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Parc found' })
  @ApiResponse({ status: 404, description: 'Parc not found' })
  async getParcById(@Param('id') id: string) {
    return this.getParcByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create parc', description: 'Creates a new parc with retry logic and cache invalidation' })
  @ApiBody({ type: CreateParcDto, description: 'Parc data (id will be auto-generated)' })
  @ApiResponse({ status: 201, description: 'Parc created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createParc(@Body() createParcDto: CreateParcDto) {
    return this.createParcUseCase.execute(createParcDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete parc', description: 'Deletes a parc with retry logic and cache invalidation' })
  @ApiParam({ name: 'id', description: 'Parc ID to delete' })
  @ApiResponse({ status: 204, description: 'Parc deleted successfully' })
  @ApiResponse({ status: 404, description: 'Parc not found' })
  async deleteParc(@Param('id') id: string): Promise<void> {
    return this.deleteParcUseCase.execute(id);
  }
}
