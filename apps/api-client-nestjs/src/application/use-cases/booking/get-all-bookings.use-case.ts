/**
 * Get All Bookings Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../../domain/ports';
import { Booking } from '../../../domain/entities';

@Injectable()
export class GetAllBookingsUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository) {}

  async execute(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }
}
