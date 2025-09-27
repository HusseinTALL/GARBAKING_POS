<!--
  Kitchen Display System (KDS) App - Main Application Component
  Provides a fullscreen kitchen display interface for managing incoming orders
  with real-time updates and optimized layout for kitchen displays
-->

<template>
  <div id="app" class="h-screen w-screen overflow-hidden bg-gray-900">
    <!-- Connection status indicator -->
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 w-full bg-red-600 text-white py-2 px-4 z-50 text-center text-sm"
    >
      <div class="flex items-center justify-center">
        <WifiOff class="mr-2 w-4 h-4" />
        <span>Connection Lost - Orders may not update in real-time</span>
      </div>
    </div>

    <!-- Main KDS Application -->
    <KitchenDisplaySystem />

    <!-- Sound notifications -->
    <audio ref="newOrderSound" preload="auto">
      <source src="/sounds/new-order.mp3" type="audio/mpeg">
      <source src="/sounds/new-order.wav" type="audio/wav">
    </audio>

    <audio ref="orderCompleteSound" preload="auto">
      <source src="/sounds/order-complete.mp3" type="audio/mpeg">
      <source src="/sounds/order-complete.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WifiOff } from 'lucide-vue-next'
import KitchenDisplaySystem from './components/KitchenDisplaySystem.vue'

// Network status
const isOnline = ref(navigator.onLine)

// Audio elements
const newOrderSound = ref<HTMLAudioElement>()
const orderCompleteSound = ref<HTMLAudioElement>()

// Network event handlers
const handleOnline = () => {
  isOnline.value = true
}

const handleOffline = () => {
  isOnline.value = false
}

// Global audio controls
const playNewOrderSound = () => {
  if (newOrderSound.value) {
    newOrderSound.value.play().catch(console.warn)
  }
}

const playOrderCompleteSound = () => {
  if (orderCompleteSound.value) {
    orderCompleteSound.value.play().catch(console.warn)
  }
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Make audio controls globally available
  window.playNewOrderSound = playNewOrderSound
  window.playOrderCompleteSound = playOrderCompleteSound
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>