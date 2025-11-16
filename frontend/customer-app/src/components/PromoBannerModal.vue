<!--
  PromoBannerModal.vue
  Promotional banner modal with coupon code and countdown timer
-->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <!-- Modal -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="isOpen"
            @click.stop
            class="relative max-w-md w-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl shadow-2xl overflow-hidden"
          >
            <!-- Close Button -->
            <button
              @click="close"
              class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Decorative Elements -->
            <div class="absolute inset-0 opacity-20">
              <div class="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24"></div>
              <div class="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32"></div>
            </div>

            <!-- Content -->
            <div class="relative px-8 py-12 text-center">
              <!-- Icon/Emoji -->
              <div class="mb-6">
                <div class="inline-block p-4 bg-white/10 rounded-full">
                  <span class="text-6xl">🎉</span>
                </div>
              </div>

              <!-- Title -->
              <h2 class="text-3xl font-bold text-white mb-3">
                {{ promo.title }}
              </h2>

              <!-- Description -->
              <p class="text-lg text-white/90 mb-6">
                {{ promo.description }}
              </p>

              <!-- Coupon Code -->
              <div class="mb-6">
                <div class="inline-block bg-white rounded-2xl px-6 py-4 shadow-xl">
                  <div class="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                    Use Code
                  </div>
                  <div class="text-2xl font-bold text-gray-900 tracking-widest">
                    {{ promo.code }}
                  </div>
                </div>
              </div>

              <!-- Countdown Timer (if applicable) -->
              <div v-if="promo.expiresAt" class="mb-6">
                <div class="flex items-center justify-center space-x-2 text-white/90">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium">
                    Expires in: <strong>{{ timeRemaining }}</strong>
                  </span>
                </div>
              </div>

              <!-- Copy Button -->
              <button
                @click="handleCopyCode"
                class="w-full py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
              >
                <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ copied ? 'Copied!' : 'Copy Code & Shop' }}</span>
              </button>

              <!-- Terms -->
              <p class="text-xs text-white/70 mt-4">
                {{ promo.terms || 'Valid on orders above minimum amount. Terms & conditions apply.' }}
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface Promo {
  title: string
  description: string
  code: string
  expiresAt?: Date
  terms?: string
}

// Props
interface Props {
  promo: Promo
  autoShow?: boolean
  showOnce?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
  showOnce: true
})

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copy-code', code: string): void
}>()

const router = useRouter()
const isOpen = ref(false)
const copied = ref(false)
const timeRemaining = ref('')

let countdownInterval: NodeJS.Timeout | null = null

// Check if modal should be shown
onMounted(() => {
  if (props.autoShow) {
    const storageKey = `promo_shown_${props.promo.code}`
    const hasShown = localStorage.getItem(storageKey)

    if (!props.showOnce || !hasShown) {
      // Show after a short delay
      setTimeout(() => {
        isOpen.value = true
      }, 1500)

      if (props.showOnce) {
        localStorage.setItem(storageKey, 'true')
      }
    }
  }

  // Start countdown if expiration is set
  if (props.promo.expiresAt) {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const updateCountdown = () => {
  if (!props.promo.expiresAt) return

  const now = new Date().getTime()
  const expiry = new Date(props.promo.expiresAt).getTime()
  const distance = expiry - now

  if (distance < 0) {
    timeRemaining.value = 'Expired'
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    return
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  if (days > 0) {
    timeRemaining.value = `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    timeRemaining.value = `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    timeRemaining.value = `${minutes}m ${seconds}s`
  } else {
    timeRemaining.value = `${seconds}s`
  }
}

const handleBackdropClick = () => {
  close()
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.promo.code)
    copied.value = true
    emit('copy-code', props.promo.code)

    // Reset copied state after 2 seconds
    setTimeout(() => {
      copied.value = false
      // Close modal and navigate to menu
      close()
      router.push('/menu')
    }, 1500)
  } catch (err) {
    console.error('Failed to copy code:', err)
    // Fallback: show alert
    alert(`Code: ${props.promo.code}`)
    close()
  }
}

// Expose open method for manual control
const open = () => {
  isOpen.value = true
}

defineExpose({ open, close })
</script>
