<!--
  ConfirmationScreen: Order confirmation with auto-reset
  Final screen showing order number and estimated ready time
-->
<template>
  <div class="confirmation-screen h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-success-600 text-white overflow-hidden relative">
    <!-- Background glow effect -->
    <div class="absolute inset-0 bg-gradient-glow opacity-50 animate-pulse-slow pointer-events-none"></div>

    <!-- Success Animation -->
    <div class="mb-12 relative z-10">
      <div class="w-56 h-56 mx-auto bg-white border-4 border-white rounded-full flex items-center justify-center mb-8 backdrop-blur-sm animate-bounce-gentle pulse-glow" style="box-shadow: 0 0 60px rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0,0,0,0.2)">
        <svg class="w-36 h-36 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>

    <!-- Confirmation Message -->
    <div class="text-center px-12 mb-12 relative z-10">
      <h1 class="text-7xl font-brand font-extrabold mb-8 tracking-tight drop-shadow-2xl" style="text-shadow: 0 4px 20px rgba(0,0,0,0.3)">{{ t('confirmation.title') }}</h1>

      <!-- Order Number -->
      <div v-if="orderStore.currentOrder" class="mb-8">
        <p class="text-2xl mb-4 opacity-95 font-medium">{{ t('confirmation.orderNumber') }}</p>
        <div class="text-6xl font-mono font-extrabold bg-white text-brand-500 backdrop-blur-sm rounded-3xl py-10 px-20 inline-block border-4 border-white shadow-2xl pulse-glow transform hover:scale-105 transition-transform">
          {{ orderStore.currentOrder.orderNumber }}
        </div>
      </div>

      <p class="text-3xl mb-4">{{ t('confirmation.thankYou') }}</p>
      <p class="text-2xl opacity-90">{{ t('confirmation.pleaseWait') }}</p>

      <!-- Mode-specific Message -->
      <div class="mt-8 bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
        <p class="text-xl">
          {{ settingsStore.orderMode === 'dine-in'
            ? t('confirmation.dineInMessage')
            : t('confirmation.takeawayMessage')
          }}
        </p>
      </div>

      <!-- Estimated Time -->
      <div v-if="estimatedTime" class="mt-8">
        <p class="text-xl opacity-90">{{ t('confirmation.estimatedTime') }}</p>
        <p class="text-3xl font-brand font-semibold">{{ estimatedTime }} {{ t('confirmation.minutes') }}</p>
      </div>
    </div>

    <!-- Auto-reset countdown -->
    <div class="text-center">
      <p class="text-xl opacity-80">
        {{ t('confirmation.newOrder') }} in {{ countdown }}s...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/order'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const { t } = useI18n({ inheritLocale: true, useScope: 'global' })
const orderStore = useOrderStore()
const settingsStore = useSettingsStore()

const countdown = ref(10)
const estimatedTime = ref(15) // Default 15 minutes
let countdownInterval: number | null = null

onMounted(() => {
  // Start countdown to reset
  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      resetKiosk()
    }
  }, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const resetKiosk = () => {
  // Clear order and reset to welcome screen
  orderStore.clearOrder()
  settingsStore.resetSession()
  router.push('/')
}
</script>
