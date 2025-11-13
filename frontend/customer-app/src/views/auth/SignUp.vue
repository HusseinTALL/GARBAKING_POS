<!--
  SignUp.vue
  User registration screen with password strength indicator and validation
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
    <!-- Decorative patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 right-10 w-32 h-32 border-2 border-orange-500 rounded-full"></div>
      <div class="absolute bottom-20 left-10 w-40 h-40 border-2 border-orange-400 rounded-lg rotate-45"></div>
      <div class="absolute top-1/2 right-1/4 w-20 h-20 border-2 border-orange-300 rounded-full"></div>
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
          <h1 class="text-3xl font-bold text-white mb-2">Sign Up</h1>
          <p class="text-gray-400">Please sign up to get started</p>
        </div>

        <!-- Signup Form -->
        <form @submit.prevent="handleSignUp" class="space-y-5">
          <!-- Name Input -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-300 mb-2">NAME</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="John doe"
              required
              class="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              :class="{ 'border-red-500': nameError }"
              @input="nameError = ''"
            />
            <p v-if="nameError" class="mt-1 text-sm text-red-400">{{ nameError }}</p>
          </div>

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
                @input="onPasswordInput"
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

            <!-- Password Strength Indicator -->
            <div v-if="formData.password" class="mt-2">
              <div class="flex items-center space-x-2">
                <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300"
                    :class="{
                      'bg-red-500 w-1/3': passwordStrength === 'weak',
                      'bg-yellow-500 w-2/3': passwordStrength === 'medium',
                      'bg-green-500 w-full': passwordStrength === 'strong'
                    }"
                  ></div>
                </div>
                <span
                  class="text-xs font-medium"
                  :class="{
                    'text-red-400': passwordStrength === 'weak',
                    'text-yellow-400': passwordStrength === 'medium',
                    'text-green-400': passwordStrength === 'strong'
                  }"
                >
                  {{ passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Medium' : 'Strong' }}
                </span>
              </div>
            </div>

            <p v-if="passwordError" class="mt-1 text-sm text-red-400">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">RE-TYPE PASSWORD</label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••••"
                required
                class="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                :class="{ 'border-red-500': confirmPasswordError }"
                @input="confirmPasswordError = ''"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-400">{{ confirmPasswordError }}</p>
          </div>

          <!-- Terms Checkbox -->
          <div>
            <label class="flex items-start">
              <input
                v-model="formData.acceptTerms"
                type="checkbox"
                required
                class="w-4 h-4 mt-1 text-orange-500 bg-white/10 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-gray-300">
                I agree to the
                <a href="#" class="text-orange-500 hover:text-orange-400">Terms & Conditions</a>
                and
                <a href="#" class="text-orange-500 hover:text-orange-400">Privacy Policy</a>
              </span>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p class="text-sm text-red-400">{{ authStore.error }}</p>
          </div>

          <!-- Sign Up Button -->
          <button
            type="submit"
            :disabled="authStore.loading || !formData.acceptTerms"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="!authStore.loading">SIGN UP</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          </button>
        </form>

        <!-- Login Link -->
        <p class="text-center mt-6 text-gray-400">
          Already have an account?
          <router-link to="/login" class="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
            LOG IN
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail as isEmailValid, validatePassword } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const passwordValidation = computed(() => validatePassword(formData.password))
const passwordStrength = computed(() => passwordValidation.value.strength)

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

const onPasswordInput = () => {
  passwordError.value = ''
  // Clear confirm password error if passwords now match
  if (formData.confirmPassword && formData.password === formData.confirmPassword) {
    confirmPasswordError.value = ''
  }
}

const validateForm = () => {
  let isValid = true

  // Name validation
  if (!formData.name.trim()) {
    nameError.value = 'Name is required'
    isValid = false
  } else if (formData.name.trim().length < 2) {
    nameError.value = 'Name must be at least 2 characters'
    isValid = false
  }

  // Email validation
  if (!validateEmailField()) {
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (!passwordValidation.value.valid) {
    passwordError.value = passwordValidation.value.errors[0]
    isValid = false
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    confirmPasswordError.value = 'Please confirm your password'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }

  // Terms validation
  if (!formData.acceptTerms) {
    isValid = false
  }

  return isValid
}

const handleSignUp = async () => {
  if (!validateForm()) return

  try {
    await authStore.register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })

    // Successful registration, navigate to home
    router.push('/home')
  } catch (error: any) {
    console.error('Sign up error:', error)
    // Error is handled by the store
  }
}
</script>
