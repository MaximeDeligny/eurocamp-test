/**
 * API Response Types
 * Type definitions for external API responses
 */

/**
 * User data from external API
 */
export interface UserApiDto {
  id: string;
  name: string;
  email: string;
}

/**
 * Parc data from external API
 */
export interface ParcApiDto {
  id: string;
  name: string;
  description: string;
}

/**
 * Booking data from external API
 */
export interface BookingApiDto {
  id: string;
  user: string;
  parc: string;
  bookingdate: string;
}
