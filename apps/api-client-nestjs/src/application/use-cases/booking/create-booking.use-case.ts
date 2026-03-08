/**
 * Create Booking Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../../domain/ports';
import { Booking } from '../../../domain/entities';

@Injectable()
export class CreateBookingUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository) {}

  async execute(booking: Omit<Booking, 'id'>): Promise<Booking> {
    return this.bookingRepository.create(booking);
  }
}
