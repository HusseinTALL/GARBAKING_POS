<!--
  IdleDetector: Monitors user inactivity and resets to welcome screen
  Uses @vueuse/core useIdle composable for idle detection
-->
<template>
  <div v-if="showWarning" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-8 text-center">
      <h2 class="text-3xl font-brand font-semibold text-neutral-900 mb-6">Still there?</h2>
      <p class="text-xl text-neutral-600 mb-8">
        Your session will reset in <span class="font-semibold text-brand-500">{{ warningCountdown }}</span> seconds
      </p>
      <KioskButton size="lg" @click="resetTimer">
        Continue Shopping
      </KioskButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useIdle } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import KioskButton from '@/components/KioskButton.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const cartStore = useCartStore()
const orderStore = useOrderStore()

// Idle detection - warning after 50 seconds, reset after 60 seconds
const { idle } = useIdle(50 * 1000) // 50 seconds
const showWarning = ref(false)
const warningCountdown = ref(10)
let warningInterval: number | null = null

watch(idle, (isIdle) => {
  if (isIdle) {
    showWarning.value = true
    warningCountdown.value = 10

    // Start countdown
    warningInterval = window.setInterval(() => {
      warningCountdown.value--
      if (warningCountdown.value <= 0) {
        resetSession()
      }
    }, 1000)
  } else {
    showWarning.value = false
    if (warningInterval) {
      clearInterval(warningInterval)
      warningInterval = null
    }
  }
})

const resetTimer = () => {
  showWarning.value = false
  if (warningInterval) {
    clearInterval(warningInterval)
    warningInterval = null
  }
}

const resetSession = () => {
  // Clear all data
  cartStore.clearCart()
  orderStore.clearOrder()
  settingsStore.resetSession()

  // Navigate to welcome screen
  router.push('/')

  // Hide warning
  showWarning.value = false
  if (warningInterval) {
    clearInterval(warningInterval)
    warningInterval = null
  }
}

onUnmounted(() => {
  if (warningInterval) {
    clearInterval(warningInterval)
  }
})
</script>
