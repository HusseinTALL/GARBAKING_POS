<!--
  Login.vue
  User login screen with email/password authentication and social login options
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
    <!-- Decorative patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-32 h-32 border-2 border-orange-500 rounded-full"></div>
      <div class="absolute bottom-20 right-10 w-40 h-40 border-2 border-orange-400 rounded-lg rotate-45"></div>
      <div class="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-orange-300 rounded-full"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex-1 flex flex-col justify-center px-6 py-12">
      <!-- Back button (optional) -->
      <button
        v-if="showBackButton"
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
          <h1 class="text-3xl font-bold text-white mb-2">Log In</h1>
          <p class="text-gray-400">Please sign in to your existing account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">EMAIL</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="example@gmail.com"
              required
              class="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              :class="{ 'border-red-500': emailError }"
              @blur="validateEmailField"
              @input="emailError = ''"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-400">{{ emailError }}</p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">PASSWORD</label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••••"
                required
                class="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                :class="{ 'border-red-500': passwordError }"
                @input="passwordError = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-400">{{ passwordError }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="formData.remember"
                type="checkbox"
                class="w-4 h-4 text-orange-500 bg-white/10 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-gray-300">Remember me</span>
            </label>

            <router-link to="/forgot-password" class="text-sm text-orange-500 hover:text-orange-400 transition-colors">
              Forgot Password
            </router-link>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p class="text-sm text-red-400">{{ authStore.error }}</p>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="!authStore.loading">LOG IN</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          </button>
        </form>

        <!-- Sign Up Link -->
        <p class="text-center mt-6 text-gray-400">
          Don't have an account?
          <router-link to="/signup" class="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
            SIGN UP
          </router-link>
        </p>

        <!-- Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-600"></div>
          <span class="px-4 text-gray-400 text-sm">Or</span>
          <div class="flex-1 border-t border-gray-600"></div>
        </div>

        <!-- Social Login Buttons -->
        <div class="flex justify-center space-x-4">
          <button
            @click="handleSocialLogin('facebook')"
            class="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
            title="Login with Facebook"
          >
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          <button
            @click="handleSocialLogin('twitter')"
            class="w-12 h-12 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors"
            title="Login with Twitter"
          >
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </button>

          <button
            @click="handleSocialLogin('apple')"
            class="w-12 h-12 bg-gray-900 hover:bg-black rounded-full flex items-center justify-center transition-colors border border-gray-700"
            title="Login with Apple"
          >
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
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

const showBackButton = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  remember: false
})

const emailError = ref('')
const passwordError = ref('')

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

const validateForm = () => {
  let isValid = true

  if (!validateEmailField()) {
    isValid = false
  }

  if (!formData.password) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    await authStore.login({
      email: formData.email,
      password: formData.password,
      remember: formData.remember
    })

    // Successful login, navigate to home
    router.push('/home')
  } catch (error: any) {
    console.error('Login error:', error)
    // Error is handled by the store
  }
}

const handleSocialLogin = (provider: string) => {
  // TODO: Implement social login
  console.log('Social login with:', provider)
  alert(`Social login with ${provider} - Coming soon!`)
}
</script>
