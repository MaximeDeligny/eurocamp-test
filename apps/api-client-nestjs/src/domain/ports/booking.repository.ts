/**
 * Port - Booking Repository Interface
 * Defines contract for booking data access without implementation details
 */
import { Booking } from '../entities';

export interface IBookingRepository {
  findAll(): Promise<Booking[]>;
  findById(id: string): Promise<Booking>;
  create(booking: Omit<Booking, 'id'>): Promise<Booking>;
  delete(id: string): Promise<void>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
