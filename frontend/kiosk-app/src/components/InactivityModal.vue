<!--
  InactivityModal: Modal that appears when user is inactive
  Features: Countdown timer, auto-reset, continue option
-->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center px-8"
        @click.self="handleContinue"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12 text-center animate-scaleIn">
          <!-- Warning Icon -->
          <div class="mb-8 flex justify-center">
            <div class="w-24 h-24 bg-warning-500/10 rounded-full flex items-center justify-center">
              <svg class="w-14 h-14 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-4xl font-brand font-semibold text-neutral-900 mb-4">
            {{ t('inactivity.title') }}
          </h2>

          <!-- Message -->
          <p class="text-xl text-neutral-600 mb-8">
            {{ t('inactivity.message') }}
          </p>

          <!-- Countdown Circle -->
          <div class="mb-8 flex justify-center">
            <div class="relative w-32 h-32">
              <!-- Background circle -->
              <svg class="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  class="text-neutral-200"
                />
                <!-- Progress circle -->
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  class="text-brand-500 transition-all duration-1000"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                  stroke-linecap="round"
                />
              </svg>
              <!-- Countdown number -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-5xl font-brand font-semibold text-neutral-900">
                  {{ countdown }}
                </div>
              </div>
            </div>
          </div>

          <!-- Seconds text -->
          <p class="text-lg text-neutral-600 mb-8">
            {{ t('inactivity.seconds') }}
          </p>

          <!-- Actions -->
          <div class="flex gap-4 justify-center">
            <KioskButton
              variant="secondary"
              size="lg"
              @click="handleReset"
            >
              <template #icon>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </template>
              {{ t('inactivity.startOver') }}
            </KioskButton>

            <KioskButton
              variant="primary"
              size="lg"
              @click="handleContinue"
            >
              <template #icon>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </template>
              {{ t('inactivity.continue') }}
            </KioskButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import KioskButton from './KioskButton.vue'

interface Props {
  show: boolean
  duration?: number // Duration in seconds before auto-reset
}

const props = withDefaults(defineProps<Props>(), {
  duration: 30,
})

const emit = defineEmits<{
  continue: []
  reset: []
  timeout: []
}>()

const { t } = useI18n({ inheritLocale: true, useScope: 'global' })

const countdown = ref(props.duration)
let countdownInterval: number | null = null

// Circle calculations
const circumference = 2 * Math.PI * 56 // r = 56
const dashOffset = computed(() => {
  const progress = countdown.value / props.duration
  return circumference * (1 - progress)
})

// Start countdown when modal shows
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      startCountdown()
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    } else {
      stopCountdown()
    }
  }
)

const startCountdown = () => {
  countdown.value = props.duration
  stopCountdown()

  countdownInterval = window.setInterval(() => {
    countdown.value--

    // Vibrate on last 3 seconds
    if (countdown.value <= 3 && countdown.value > 0) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }

    if (countdown.value <= 0) {
      stopCountdown()
      emit('timeout')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

const handleContinue = () => {
  stopCountdown()
  emit('continue')
}

const handleReset = () => {
  stopCountdown()
  emit('reset')
}

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative {
  transform: scale(0.9);
  opacity: 0;
}

.modal-leave-to .relative {
  transform: scale(0.9);
  opacity: 0;
}
</style>
