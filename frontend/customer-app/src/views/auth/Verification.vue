<!--
  Verification.vue
  4-digit verification code input screen with auto-focus and countdown timer
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
    <!-- Decorative patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 right-20 w-32 h-32 border-2 border-orange-500 rounded-full"></div>
      <div class="absolute bottom-32 left-20 w-40 h-40 border-2 border-orange-400 rounded-lg rotate-45"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex-1 flex flex-col justify-center px-6 py-12">
      <!-- Back button -->
      <button
        @click="router.back()"
        class="absolute top-6 left-6 p-2 text-white hover:text-orange-500 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="max-w-md w-full mx-auto">
        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Verification</h1>
          <p class="text-gray-400">We have sent a code to your email</p>
          <p class="text-orange-500 font-semibold mt-2">{{ email }}</p>
        </div>

        <!-- Illustration -->
        <div class="flex justify-center mb-8">
          <div class="w-32 h-32 bg-orange-500/10 rounded-full flex items-center justify-center">
            <svg class="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Verification Form -->
        <form @submit.prevent="handleVerify" class="space-y-6">
          <!-- Code Input -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-4 text-center">CODE</label>
            <div class="flex justify-center space-x-3">
              <input
                v-for="(digit, index) in code"
                :key="index"
                :ref="el => codeInputs[index] = el as HTMLInputElement"
                v-model="code[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-16 h-16 text-center text-2xl font-bold bg-white/10 border-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                :class="{
                  'border-gray-600': !code[index],
                  'border-orange-500': code[index],
                  'border-red-500': hasError
                }"
                @input="handleInput(index, $event)"
                @keydown="handleKeyDown(index, $event)"
                @paste="handlePaste"
              />
            </div>
            <p v-if="hasError" class="mt-3 text-sm text-red-400 text-center">{{ errorMessage }}</p>
          </div>

          <!-- Resend Code -->
          <div class="text-center">
            <p class="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              v-if="canResend"
              type="button"
              @click="handleResend"
              class="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
            >
              Resend Code
            </button>
            <p v-else class="text-gray-500 text-sm">
              Resend in <span class="text-orange-500 font-semibold">{{ countdown }}s</span>
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p class="text-sm text-red-400 text-center">{{ authStore.error }}</p>
          </div>

          <!-- Verify Button -->
          <button
            type="submit"
            :disabled="!isCodeComplete || authStore.loading"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="!authStore.loading">VERIFY</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          </button>
        </form>
      </div>
    </div>

    <!-- Numeric Keyboard for Mobile (iOS style) -->
    <div v-if="showKeyboard" class="fixed bottom-0 left-0 right-0 bg-gray-200 pb-safe z-50 sm:hidden">
      <div class="grid grid-cols-3 gap-px bg-gray-300">
        <!-- Numbers 1-9 -->
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          @click="handleKeypadInput(num.toString())"
          class="bg-white active:bg-gray-100 py-4 text-2xl font-semibold text-gray-900"
        >
          {{ num }}
        </button>

        <!-- Space -->
        <div class="bg-gray-200"></div>

        <!-- Zero -->
        <button
          @click="handleKeypadInput('0')"
          class="bg-white active:bg-gray-100 py-4 text-2xl font-semibold text-gray-900"
        >
          0
        </button>

        <!-- Backspace -->
        <button
          @click="handleKeypadBackspace"
          class="bg-white active:bg-gray-100 py-4 flex items-center justify-center"
        >
          <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>

      <!-- Done Button -->
      <button
        @click="showKeyboard = false"
        class="w-full bg-orange-500 text-white py-3 text-lg font-semibold"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Get email from query params
const email = ref(route.query.email as string || '')
const verificationType = ref(route.query.type as string || 'register') // 'register' or 'reset'

// Code inputs
const code = ref(['', '', '', ''])
const codeInputs = ref<HTMLInputElement[]>([])
const hasError = ref(false)
const errorMessage = ref('')

// Countdown timer
const countdown = ref(50)
const canResend = ref(false)
let countdownInterval: NodeJS.Timeout | null = null

// Mobile keyboard
const showKeyboard = ref(false)

const isCodeComplete = computed(() => {
  return code.value.every(digit => digit !== '')
})

const fullCode = computed(() => {
  return code.value.join('')
})

const startCountdown = () => {
  countdown.value = 50
  canResend.value = false

  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canResend.value = true
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Only allow numbers
  if (value && !/^\d$/.test(value)) {
    code.value[index] = ''
    return
  }

  code.value[index] = value

  // Auto-focus next input
  if (value && index < 3) {
    codeInputs.value[index + 1]?.focus()
  }

  // Auto-submit when all 4 digits entered
  if (isCodeComplete.value) {
    handleVerify()
  }

  // Clear error
  hasError.value = false
  errorMessage.value = ''
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    codeInputs.value[index - 1]?.focus()
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    codeInputs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 3) {
    event.preventDefault()
    codeInputs.value[index + 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('')

  digits.forEach((digit, index) => {
    if (index < 4) {
      code.value[index] = digit
    }
  })

  // Focus last filled input or next empty
  const lastIndex = Math.min(digits.length, 3)
  codeInputs.value[lastIndex]?.focus()

  // Auto-submit if complete
  if (isCodeComplete.value) {
    handleVerify()
  }
}

const handleKeypadInput = (digit: string) => {
  const emptyIndex = code.value.findIndex(d => d === '')
  if (emptyIndex !== -1) {
    code.value[emptyIndex] = digit
    if (emptyIndex < 3) {
      codeInputs.value[emptyIndex + 1]?.focus()
    }
  }

  // Auto-submit when complete
  if (isCodeComplete.value) {
    handleVerify()
  }
}

const handleKeypadBackspace = () => {
  for (let i = 3; i >= 0; i--) {
    if (code.value[i]) {
      code.value[i] = ''
      codeInputs.value[i]?.focus()
      break
    }
  }
}

const handleVerify = async () => {
  if (!isCodeComplete.value) return

  try {
    await authStore.verifyCode(email.value, fullCode.value)

    // Success - navigate based on type
    if (verificationType.value === 'reset') {
      // Go to reset password screen (or home if token received)
      router.push('/home')
    } else {
      // Registration verification - go to home
      router.push('/home')
    }
  } catch (error: any) {
    console.error('Verification error:', error)
    hasError.value = true
    errorMessage.value = 'Invalid code. Please try again.'

    // Clear code
    code.value = ['', '', '', '']
    codeInputs.value[0]?.focus()
  }
}

const handleResend = async () => {
  try {
    await authStore.forgotPassword(email.value)
    startCountdown()

    // Clear code
    code.value = ['', '', '', '']
    codeInputs.value[0]?.focus()
  } catch (error) {
    console.error('Resend error:', error)
  }
}

// Detect mobile and show keyboard
const checkMobile = () => {
  showKeyboard.value = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

onMounted(() => {
  // Auto-focus first input
  codeInputs.value[0]?.focus()

  // Start countdown
  startCountdown()

  // Check if mobile
  checkMobile()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
/* Safe area for iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Prevent zoom on input focus (iOS) */
input {
  font-size: 16px;
}
</style>
