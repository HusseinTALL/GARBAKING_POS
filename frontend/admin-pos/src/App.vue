<!--
  Main App component for Admin POS
  Provides the root layout and global state management
-->

<template>
  <div id="app" class="min-h-screen bg-white">
    <!-- Backend Status Indicator -->
    <BackendStatusIndicator />

    <!-- Offline indicator -->
    <div v-if="!isOnline" class="offline-banner">
      <div class="flex items-center">
        <WifiOff class="mr-2 w-4 h-4" />
        <span>Working offline - Changes will sync when connection is restored</span>
      </div>
    </div>

    <!-- Main application -->
    <router-view />

    <!-- Global notifications -->
    <Teleport to="body">
      <div
        v-if="notification"
        class="fixed top-4 right-4 z-50 max-w-md bg-white border-l-4 border-blue-500 shadow-lg rounded-lg p-4 animate-fade-in"
      >
        <div class="flex items-center">
          <CheckCircle
            v-if="notification.type === 'success'"
            class="mr-3 w-5 h-5 text-green-500"
          />
          <Bell
            v-else
            class="mr-3 w-5 h-5 text-blue-500"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
            <p v-if="notification.message" class="text-sm text-gray-500">
              {{ notification.message }}
            </p>
          </div>
          <button
            @click="clearNotification"
            class="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from './stores/notification'
import { storeToRefs } from 'pinia'
import { WifiOff, CheckCircle, Bell, X } from 'lucide-vue-next'
import BackendStatusIndicator from './components/BackendStatusIndicator.vue'

// Network status
const isOnline = ref(navigator.onLine)

// Notification store
const notificationStore = useNotificationStore()
const { notification } = storeToRefs(notificationStore)

// Network event handlers
const handleOnline = () => {
  isOnline.value = true
  notificationStore.show({
    type: 'success',
    title: 'Back online',
    message: 'Syncing data...'
  })
}

const handleOffline = () => {
  isOnline.value = false
  notificationStore.show({
    type: 'warning',
    title: 'Connection lost',
    message: 'Working in offline mode'
  })
}

const clearNotification = () => {
  notificationStore.clear()
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>