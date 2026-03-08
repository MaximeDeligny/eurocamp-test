/**
 * Get Booking By ID Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../../domain/ports';
import { Booking } from '../../../domain/entities';

@Injectable()
export class GetBookingByIdUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<Booking> {
    return this.bookingRepository.findById(id);
  }
}
