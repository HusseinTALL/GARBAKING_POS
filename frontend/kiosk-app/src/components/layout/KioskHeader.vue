/**
 * KioskHeader Component
 *
 * Professional reusable header component for kiosk screens with back button,
 * title, subtitle, and optional action slots. Provides consistent navigation
 * and visual hierarchy across all screens.
 */
<template>
  <header
    class="relative overflow-hidden"
    :class="[
      gradient ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white' : 'bg-white text-neutral-800',
      shadowClass
    ]"
  >
    <!-- Decorative Background Pattern (only if gradient) -->
    <div v-if="gradient" class="absolute inset-0 opacity-10 pointer-events-none">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
      <div class="absolute top-10 right-32 w-20 h-20 bg-white rounded-full" />
      <div class="absolute bottom-5 right-64 w-16 h-16 bg-white rounded-full" />
    </div>

    <!-- Header Content -->
    <div class="relative z-10 px-10 py-8 flex items-center justify-between">
      <!-- Left Section: Back Button + Title -->
      <div class="flex items-center gap-6">
        <!-- Back Button -->
        <button
          v-if="showBackButton"
          @click="handleBack"
          class="min-h-touch min-w-touch flex items-center justify-center rounded-full transition-all duration-fast hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :class="[
            gradient
              ? 'bg-white/10 hover:bg-white/20 text-white focus-visible:ring-white'
              : 'bg-brand-100 hover:bg-brand-200 text-brand-700 focus-visible:ring-brand-400'
          ]"
          :aria-label="backLabel"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Title Section -->
        <div>
          <h1 class="font-brand font-semibold mb-1" :class="gradient ? 'text-4xl' : 'text-5xl text-neutral-900'">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="text-base"
            :class="gradient ? 'text-white/80' : 'text-neutral-600'"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right Section: Actions Slot -->
      <div v-if="$slots.actions" class="flex items-center gap-4">
        <slot name="actions" />
      </div>
    </div>

    <!-- Bottom Border (only if no gradient) -->
    <div v-if="!gradient && showBorder" class="h-0.5 bg-neutral-200" />
  </header>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Component Props
 */
interface Props {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backLabel?: string
  gradient?: boolean
  showBorder?: boolean
  shadowClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  showBackButton: true,
  backLabel: 'Go back',
  gradient: true,
  showBorder: false,
  shadowClass: 'shadow-lg'
})

/**
 * Component Emits
 */
const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const instance = getCurrentInstance()
const hasBackListener = computed(() => {
  const listeners = instance?.vnode.props?.onBack
  if (!listeners) return false
  if (Array.isArray(listeners)) {
    return listeners.length > 0
  }
  return true
})

/**
 * Handle back button click
 */
const handleBack = () => {
  emit('back')
  if (!hasBackListener.value) {
    router.back()
  }
}
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
