<!--
  Main PWA Customer Ordering App for Garbaking
  Clean, modern iOS-style food delivery interface with router-based navigation
-->

<template>
  <div id="app" class="min-h-screen bg-white">
    <!-- Offline indicator -->
    <div v-if="!isOnline" class="bg-primary-500 text-white text-center py-3 px-4 text-sm font-medium shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Offline Mode
      </div>
    </div>

    <!-- Router view with transitions -->
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Network status monitoring
const isOnline = ref(navigator.onLine)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Initialize app
onMounted(() => {
  // Set up network monitoring
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
/* Route transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
