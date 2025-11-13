<!--
  ForgotPassword.vue
  Password reset screen - allows user to request a verification code via email
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
    <!-- Decorative patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-20 w-32 h-32 border-2 border-orange-500 rounded-full"></div>
      <div class="absolute bottom-32 right-20 w-40 h-40 border-2 border-orange-400 rounded-lg rotate-45"></div>
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
        <!-- Success State -->
        <div v-if="codeSent" class="text-center">
          <!-- Success Icon -->
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 class="text-3xl font-bold text-white mb-4">Check Your Email</h1>
          <p class="text-gray-400 mb-2">
            We've sent a verification code to:
          </p>
          <p class="text-orange-500 font-semibold mb-8">{{ formData.email }}</p>
          <p class="text-gray-400 text-sm mb-8">
            Please check your inbox and enter the code on the next screen.
          </p>

          <button
            @click="navigateToVerification"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/30"
          >
            CONTINUE TO VERIFICATION
          </button>

          <button
            @click="codeSent = false"
            class="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Use a different email
          </button>
        </div>

        <!-- Form State -->
        <div v-else>
          <!-- Title -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Forgot Password</h1>
            <p class="text-gray-400">Please sign in to your existing account</p>
          </div>

          <!-- Illustration -->
          <div class="flex justify-center mb-8">
            <div class="w-32 h-32 bg-orange-500/10 rounded-full flex items-center justify-center">
              <svg class="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <p class="text-gray-400 text-center mb-6">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>

          <!-- Forgot Password Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">EMAIL</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="example@gmail.com"
                required
                autofocus
                class="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                :class="{ 'border-red-500': emailError }"
                @blur="validateEmailField"
                @input="emailError = ''"
              />
              <p v-if="emailError" class="mt-1 text-sm text-red-400">{{ emailError }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p class="text-sm text-red-400">{{ authStore.error }}</p>
            </div>

            <!-- Send Code Button -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span v-if="!authStore.loading">SEND CODE</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending code...
              </span>
            </button>
          </form>

          <!-- Back to Login -->
          <div class="text-center mt-6">
            <router-link to="/login" class="text-gray-400 hover:text-white transition-colors inline-flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail as isEmailValid } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const codeSent = ref(false)

const formData = reactive({
  email: ''
})

const emailError = ref('')

const validateEmailField = () => {
  if (!formData.email) {
    emailError.value = 'Email is required'
    return false
  }
  if (!isEmailValid(formData.email)) {
    emailError.value = 'Please enter a valid email'
    return false
  }
  emailError.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validateEmailField()) return

  try {
    await authStore.forgotPassword(formData.email)
    codeSent.value = true
  } catch (error: any) {
    console.error('Forgot password error:', error)
    // Error is handled by the store
  }
}

const navigateToVerification = () => {
  router.push({
    name: 'Verification',
    query: { email: formData.email, type: 'reset' }
  })
}
</script>
