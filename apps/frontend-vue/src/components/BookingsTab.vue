<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Bookings ({{ bookingCount }})</h2>
      <button class="btn btn-primary" @click="openCreateModal">
        + Add Booking
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && bookings.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Loading bookings...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && bookings.length === 0" class="empty-state">
      <p>No bookings found. Create your first booking!</p>
    </div>

    <!-- Bookings Table -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Parc</th>
            <th>Date</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td><code>{{ booking.id?.substring(0, 8) }}</code></td>
            <td><code>{{ booking.user.substring(0, 8) }}</code></td>
            <td><code>{{ booking.parc.substring(0, 8) }}</code></td>
            <td>{{ formatDate(booking.bookingdate) }}</td>
            <td>{{ booking.comments || '-' }}</td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                @click="handleDelete(booking.id!)"
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
          <h3 class="modal-title">Create New Booking</h3>
          <button class="modal-close" @click="showCreateModal = false">×</button>
        </div>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label class="form-label">User</label>
            <select v-model="newBooking.user" class="form-select" required>
              <option value="">Select a user</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Parc</label>
            <select v-model="newBooking.parc" class="form-select" required>
              <option value="">Select a parc</option>
              <option v-for="parc in parcs" :key="parc.id" :value="parc.id">
                {{ parc.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Booking Date</label>
            <input
              v-model="newBooking.bookingdate"
              class="form-input"
              type="date"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Comments (optional)</label>
            <textarea
              v-model="newBooking.comments"
              class="form-textarea"
              placeholder="Any special requests or notes..."
            ></textarea>
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
              {{ loading ? 'Creating...' : 'Create Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookingsStore } from '../stores/bookings'
import { useUsersStore } from '../stores/users'
import { useParcsStore } from '../stores/parcs'
import { storeToRefs } from 'pinia'

const bookingsStore = useBookingsStore()
const usersStore = useUsersStore()
const parcsStore = useParcsStore()

const { bookings, loading, error, bookingCount } = storeToRefs(bookingsStore)
const { users } = storeToRefs(usersStore)
const { parcs } = storeToRefs(parcsStore)

const showCreateModal = ref(false)
const newBooking = ref({
  user: '',
  parc: '',
  bookingdate: new Date().toISOString().split('T')[0],
  comments: '',
})

onMounted(() => {
  bookingsStore.fetchBookings()
})

function openCreateModal() {
  // Fetch users and parcs if not already loaded
  if (users.value.length === 0) {
    usersStore.fetchUsers()
  }
  if (parcs.value.length === 0) {
    parcsStore.fetchParcs()
  }
  showCreateModal.value = true
}

async function handleCreate() {
  try {
    await bookingsStore.createBooking({
      ...newBooking.value,
      bookingdate: new Date(newBooking.value.bookingdate).toISOString(),
    })
    showCreateModal.value = false
    newBooking.value = {
      user: '',
      parc: '',
      bookingdate: new Date().toISOString().split('T')[0],
      comments: '',
    }
  } catch (err) {
    // Error is handled in store
  }
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this booking?')) {
    try {
      await bookingsStore.deleteBooking(id)
    } catch (err) {
      // Error is handled in store
    }
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
