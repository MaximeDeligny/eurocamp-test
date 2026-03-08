/**
 * API Service with error handling and retry logic using native Fetch API
 */

import type { User, Parc, Booking, ApiResponse } from '../types'

interface FetchError extends Error {
  status?: number
  response?: Response
}

class ApiService {
  private baseURL: string
  private maxRetries = 3
  private retryDelay = 1000
  private timeout = 10000

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Wrapper around fetch with timeout support
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      const fetchError = error as FetchError

      console.log(`[API] Request failed - Status: ${fetchError.status}, Attempt: ${attempt}/${this.maxRetries}`)

      // Don't retry on client errors (4xx)
      if (fetchError.status && fetchError.status >= 400 && fetchError.status < 500) {
        console.log(`[API] Not retrying - client error (${fetchError.status})`)
        throw error
      }

      // Retry on server errors (5xx) and network errors
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1)
        console.log(`[API] Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.retryRequest(fn, attempt + 1)
      }

      console.log(`[API] Max retries exceeded`)
      throw error
    }
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If response is not JSON, use statusText
      }

      const error: FetchError = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    // Handle 204 No Content or empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T
    }

    // Check if response has content
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // No JSON content, return undefined for void responses
      return undefined as T
    }

    // Try to parse JSON, return undefined if empty
    const text = await response.text()
    if (!text || text.trim() === '') {
      return undefined as T
    }

    return JSON.parse(text)
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    console.log(`[API] -> ${options.method || 'GET'} ${endpoint}`)

    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(url, options)
      console.log(`[API] <- ${response.status} ${response.statusText}`)
      return this.handleResponse<T>(response)
    })
  }

  // ========================================================================
  // USER ENDPOINTS
  // ========================================================================

  async getAllUsers(): Promise<User[]> {
    const response = await this.request<ApiResponse<User>>('/users', {
      method: 'GET',
    })
    return response.data
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'GET',
    })
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // ========================================================================
  // PARC ENDPOINTS
  // ========================================================================

  async getAllParcs(): Promise<Parc[]> {
    const response = await this.request<ApiResponse<Parc>>('/parcs', {
      method: 'GET',
    })
    return response.data
  }

  async getParcById(id: string): Promise<Parc> {
    return this.request<Parc>(`/parcs/${id}`, {
      method: 'GET',
    })
  }

  async createParc(parc: Omit<Parc, 'id'>): Promise<Parc> {
    return this.request<Parc>('/parcs', {
      method: 'POST',
      body: JSON.stringify(parc),
    })
  }

  async deleteParc(id: string): Promise<void> {
    return this.request<void>(`/parcs/${id}`, {
      method: 'DELETE',
    })
  }

  // ========================================================================
  // BOOKING ENDPOINTS
  // ========================================================================

  async getAllBookings(): Promise<Booking[]> {
    const response = await this.request<ApiResponse<Booking>>('/bookings', {
      method: 'GET',
    })
    return response.data
  }

  async getBookingById(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'GET',
    })
  }

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    })
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request<void>(`/bookings/${id}`, {
      method: 'DELETE',
    })
  }
}

// Export singleton instance
// The API is versioned with /api/1/ prefix
export const apiService = new ApiService('/api/1')
