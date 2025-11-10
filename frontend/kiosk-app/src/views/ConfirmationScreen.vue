<!--
  ConfirmationScreen: Order confirmation with auto-reset
  Final screen showing order number and estimated ready time
-->
<template>
  <div class="confirmation-screen h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-success-600 text-white overflow-hidden">
    <!-- Success Animation -->
    <div class="mb-12">
      <div class="w-48 h-48 mx-auto bg-white/20 border-4 border-white/60 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm animate-bounce-gentle shadow-2xl">
        <svg class="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>

    <!-- Confirmation Message -->
    <div class="text-center px-12 mb-12">
      <h1 class="text-6xl font-brand font-semibold mb-8 tracking-tight">{{ t('confirmation.title') }}</h1>

      <!-- Order Number -->
      <div v-if="orderStore.currentOrder" class="mb-8">
        <p class="text-xl mb-4 opacity-90">{{ t('confirmation.orderNumber') }}</p>
        <div class="text-5xl font-mono font-bold bg-white/20 backdrop-blur-sm rounded-3xl py-8 px-16 inline-block border-4 border-white/70 shadow-xl">
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
