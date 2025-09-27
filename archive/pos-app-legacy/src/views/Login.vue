<!--
  Cashier Login view for Garbaking POS
  Provides PIN-based authentication for cashier access
-->
<template>
  <div class="login-container min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
    <div class="login-card bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <!-- Logo and Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ShoppingCart class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Garbaking Cashier POS</h1>
        <p class="text-gray-600">Enter your PIN to access the point of sale system</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cashier PIN
          </label>
          <input
            v-model="pin"
            type="password"
            maxlength="6"
            class="pos-input text-center text-2xl tracking-widest"
            placeholder="••••••"
            autocomplete="off"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="!pin || pin.length < 4 || loading"
          class="pos-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Authenticating...
          </div>
          <div v-else>Login to POS</div>
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
        {{ error }}
      </div>

      <!-- Quick PIN Pad -->
      <div class="mt-6 grid grid-cols-3 gap-2">
        <button
          v-for="number in [1,2,3,4,5,6,7,8,9]" :key="number"
          @click="addToPin(number.toString())"
          class="pos-button-secondary py-3 text-lg font-semibold"
          :disabled="loading || pin.length >= 6"
        >
          {{ number }}
        </button>
        <button
          @click="clearPin"
          class="pos-button-secondary py-3 text-sm"
          :disabled="loading"
        >
          Clear
        </button>
        <button
          @click="addToPin('0')"
          class="pos-button-secondary py-3 text-lg font-semibold"
          :disabled="loading || pin.length >= 6"
        >
          0
        </button>
        <button
          @click="deleteLastPin"
          class="pos-button-secondary py-3 text-sm"
          :disabled="loading || !pin"
        >
          ⌫
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'

const router = useRouter()
const pin = ref('')
const loading = ref(false)
const error = ref('')

const addToPin = (number: string) => {
  if (pin.value.length < 6) {
    pin.value += number
  }
}

const clearPin = () => {
  pin.value = ''
  error.value = ''
}

const deleteLastPin = () => {
  pin.value = pin.value.slice(0, -1)
  error.value = ''
}

const handleLogin = async () => {
  if (pin.value.length < 4) {
    error.value = 'PIN must be at least 4 digits'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Mock authentication - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, accept any PIN with at least 4 digits
    if (pin.value.length >= 4) {
      localStorage.setItem('pos_cashier_token', 'mock-token-' + Date.now())
      localStorage.setItem('cashier_name', 'John Doe') // Mock cashier name
      await router.push('/')
    } else {
      throw new Error('Invalid PIN')
    }
  } catch (err) {
    error.value = 'Invalid PIN. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>