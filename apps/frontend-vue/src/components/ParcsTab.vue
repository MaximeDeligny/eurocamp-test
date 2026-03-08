<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Parcs ({{ parcCount }})</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">
        + Add Parc
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && parcs.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Loading parcs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && parcs.length === 0" class="empty-state">
      <p>No parcs found. Create your first parc!</p>
    </div>

    <!-- Parcs Table -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="parc in parcs" :key="parc.id">
            <td><code>{{ parc.id?.substring(0, 8) }}</code></td>
            <td>{{ parc.name }}</td>
            <td>{{ parc.description }}</td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                @click="handleDelete(parc.id!)"
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
          <h3 class="modal-title">Create New Parc</h3>
          <button class="modal-close" @click="showCreateModal = false">×</button>
        </div>

        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input
              v-model="newParc.name"
              class="form-input"
              type="text"
              placeholder="Mountain View Parc"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="newParc.description"
              class="form-textarea"
              placeholder="A beautiful parc nestled in the mountains..."
              required
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
              {{ loading ? 'Creating...' : 'Create Parc' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useParcsStore } from '../stores/parcs'
import { storeToRefs } from 'pinia'

const parcsStore = useParcsStore()
const { parcs, loading, error, parcCount } = storeToRefs(parcsStore)

const showCreateModal = ref(false)
const newParc = ref({
  name: '',
  description: '',
})

onMounted(() => {
  parcsStore.fetchParcs()
})

async function handleCreate() {
  try {
    await parcsStore.createParc(newParc.value)
    showCreateModal.value = false
    newParc.value = { name: '', description: '' }
  } catch (err) {
    // Error is handled in store
  }
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this parc?')) {
    try {
      await parcsStore.deleteParc(id)
    } catch (err) {
      // Error is handled in store
    }
  }
}
</script>
