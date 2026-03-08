<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Users ({{ userCount }})</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">
        + Add User
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && users.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && users.length === 0" class="empty-state">
      <p>No users found. Create your first user!</p>
    </div>

    <!-- Users Table -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><code>{{ user.id?.substring(0, 8) }}</code></td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                @click="handleDelete(user.id!)"
                :disabled="loading"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Create New User</h3>
          <button class="modal-close" @click="showCreateModal = false">×</button>
        </div>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input
              v-model="newUser.name"
              class="form-input"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="newUser.email"
              class="form-input"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn"
              @click="showCreateModal = false"
              :disabled="loading"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { storeToRefs } from 'pinia'

const usersStore = useUsersStore()
const { users, loading, error, userCount } = storeToRefs(usersStore)

const showCreateModal = ref(false)
const newUser = ref({
  name: '',
  email: '',
})

onMounted(() => {
  usersStore.fetchUsers()
})

async function handleCreate() {
  try {
    await usersStore.createUser(newUser.value)
    showCreateModal.value = false
    newUser.value = { name: '', email: '' }
  } catch (err) {
    // Error is handled in store
  }
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersStore.deleteUser(id)
    } catch (err) {
      // Error is handled in store
    }
  }
}
</script>
