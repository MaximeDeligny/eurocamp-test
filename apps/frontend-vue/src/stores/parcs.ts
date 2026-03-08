/**
 * Parcs Store with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import type { Parc, ApiError } from '../types'

export const useParcsStore = defineStore('parcs', () => {
  // State
  const parcs = ref<Parc[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const parcCount = computed(() => parcs.value.length)

  // Actions
  async function fetchParcs() {
    loading.value = true
    error.value = null
    try {
      parcs.value = await apiService.getAllParcs()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch parcs'
      console.error('Error fetching parcs:', err)
    } finally {
      loading.value = false
    }
  }

  async function createParc(parc: Omit<Parc, 'id'>) {
    loading.value = true
    error.value = null
    try {
      const newParc = await apiService.createParc(parc)
      parcs.value.push(newParc)
      return newParc
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create parc'
      console.error('Error creating parc:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteParc(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiService.deleteParc(id)
      parcs.value = parcs.value.filter(p => p.id !== id)
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete parc'
      console.error('Error deleting parc:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    parcs,
    loading,
    error,
    parcCount,
    fetchParcs,
    createParc,
    deleteParc,
  }
})
