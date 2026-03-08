/**
 * Adapter - Booking HTTP Repository Implementation
 * Implements IBookingRepository using HTTP client
 */
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IBookingRepository } from '../../domain/ports';
import { Booking } from '../../domain/entities';
import { HttpClientService, ApiResponse } from '../http/http-client.service';
import { BookingApiDto } from '../http/api-types';
import { Cacheable, CacheEvict } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class BookingHttpRepository implements IBookingRepository {
  constructor(
    private readonly httpClient: HttpClientService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cacheable('bookings')
  async findAll(): Promise<Booking[]> {
    this.logger.debug('Finding all bookings', {
      context: 'BookingHttpRepository',
    });
    const response = await this.httpClient.get<ApiResponse<BookingApiDto>>('/bookings');
    return response.data.map((b) => Booking.create(b));
  }

  @Cacheable('bookings')
  async findById(id: string): Promise<Booking> {
    this.logger.debug('Finding booking by id', {
      context: 'BookingHttpRepository',
      bookingId: id,
    });
    const data = await this.httpClient.get<BookingApiDto>(`/bookings/${id}`);
    return Booking.create(data);
  }

  @CacheEvict('bookings')
  async create(booking: Omit<Booking, 'id'>): Promise<Booking> {
    this.logger.info('Creating booking', {
      context: 'BookingHttpRepository',
      user: booking.user,
    });
    const data = await this.httpClient.post<BookingApiDto>('/bookings', booking);
    return Booking.create(data);
  }

  @CacheEvict('bookings')
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting booking', {
      context: 'BookingHttpRepository',
      bookingId: id,
    });
    await this.httpClient.delete(`/bookings/${id}`);
  }
}
