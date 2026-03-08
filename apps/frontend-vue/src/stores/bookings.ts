/**
 * Bookings Store with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import type { Booking, ApiError } from '../types'

export const useBookingsStore = defineStore('bookings', () => {
  // State
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const bookingCount = computed(() => bookings.value.length)

  // Actions
  async function fetchBookings() {
    loading.value = true
    error.value = null
    try {
      bookings.value = await apiService.getAllBookings()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch bookings'
      console.error('Error fetching bookings:', err)
    } finally {
      loading.value = false
    }
  }

  async function createBooking(booking: Omit<Booking, 'id'>) {
    loading.value = true
    error.value = null
    try {
      const newBooking = await apiService.createBooking(booking)
      bookings.value.push(newBooking)
      return newBooking
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create booking'
      console.error('Error creating booking:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBooking(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiService.deleteBooking(id)
      bookings.value = bookings.value.filter(b => b.id !== id)
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete booking'
      console.error('Error deleting booking:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    bookings,
    loading,
    error,
    bookingCount,
    fetchBookings,
    createBooking,
    deleteBooking,
  }
})
