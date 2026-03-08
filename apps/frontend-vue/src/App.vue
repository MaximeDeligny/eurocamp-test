<template>
  <div id="app">
    <header class="header">
      <h1>Eurocamp Management</h1>
      <p>Manage users, parcs, and bookings</p>
    </header>

    <div class="container">
      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          Users
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'parcs' }"
          @click="activeTab = 'parcs'"
        >
          Parcs
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'bookings' }"
          @click="activeTab = 'bookings'"
        >
          Bookings
        </button>
      </div>

      <!-- Content -->
      <UsersTab v-if="activeTab === 'users'" />
      <ParcsTab v-if="activeTab === 'parcs'" />
      <BookingsTab v-if="activeTab === 'bookings'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UsersTab from './components/UsersTab.vue'
import ParcsTab from './components/ParcsTab.vue'
import BookingsTab from './components/BookingsTab.vue'

const activeTab = ref<'users' | 'parcs' | 'bookings'>('users')
</script>
