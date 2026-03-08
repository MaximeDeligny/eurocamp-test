/**
 * Type definitions for the Eurocamp API
 */

export interface User {
  id?: string
  name: string
  email: string
}

export interface Parc {
  id?: string
  name: string
  description: string
}

export interface Booking {
  id?: string
  user: string
  parc: string
  bookingdate: string
  comments?: string
}

export interface ApiResponse<T> {
  data: T[]
}

export interface ApiError {
  message: string
  status?: number
}
