/**
 * Booking Controller - Exposes booking endpoints
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
import { CreateBookingDto } from '../dto';
import {
  GetAllBookingsUseCase,
  GetBookingByIdUseCase,
  CreateBookingUseCase,
  DeleteBookingUseCase,
} from '../../application/use-cases/booking';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly getAllBookingsUseCase: GetAllBookingsUseCase,
    private readonly getBookingByIdUseCase: GetBookingByIdUseCase,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly deleteBookingUseCase: DeleteBookingUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings', description: 'Retrieves all bookings with caching and retry logic' })
  @ApiResponse({ status: 200, description: 'List of bookings retrieved successfully' })
  async getAllBookings() {
    return this.getAllBookingsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID', description: 'Retrieves a specific booking with caching and retry logic' })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('id') id: string) {
    return this.getBookingByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create booking', description: 'Creates a new booking with retry logic and cache invalidation' })
  @ApiBody({ type: CreateBookingDto, description: 'Booking data (id will be auto-generated)' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.createBookingUseCase.execute(createBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete booking', description: 'Deletes a booking with retry logic and cache invalidation' })
  @ApiParam({ name: 'id', description: 'Booking ID to delete' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async deleteBooking(@Param('id') id: string): Promise<void> {
    return this.deleteBookingUseCase.execute(id);
  }
}
