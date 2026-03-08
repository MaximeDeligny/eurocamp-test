/**
 * Users Store with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import type { User, ApiError } from '../types'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userCount = computed(() => users.value.length)

  // Actions
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      users.value = await apiService.getAllUsers()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  async function createUser(user: Omit<User, 'id'>) {
    loading.value = true
    error.value = null
    try {
      const newUser = await apiService.createUser(user)
      users.value.push(newUser)
      return newUser
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create user'
      console.error('Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiService.deleteUser(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete user'
      console.error('Error deleting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    userCount,
    fetchUsers,
    createUser,
    deleteUser,
  }
})
