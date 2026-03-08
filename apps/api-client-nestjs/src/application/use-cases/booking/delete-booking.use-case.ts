/**
 * Delete Booking Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../../domain/ports';

@Injectable()
export class DeleteBookingUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<void> {
    return this.bookingRepository.delete(id);
  }
}
