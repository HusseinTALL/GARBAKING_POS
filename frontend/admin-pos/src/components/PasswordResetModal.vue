<!--
  Password Reset Modal Component - Secure password management
  Handles password reset requests and admin-initiated resets
-->

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Reset Password</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- User Info -->
        <div v-if="user" class="flex items-center space-x-3 mb-6 p-4 bg-slate-50 rounded-lg">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style="background-color: #3b82f6"
          >
            {{ getInitials(user.name) }}
          </div>
          <div>
            <div class="font-medium text-slate-900">{{ user.name }}</div>
            <div class="text-sm text-slate-600">{{ user.email }}</div>
          </div>
        </div>

        <!-- Reset Options -->
        <div class="space-y-4 mb-6">
          <h3 class="text-sm font-medium text-slate-900">Choose Reset Method</h3>

          <label class="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': resetMethod === 'email' }"
          >
            <input
              type="radio"
              v-model="resetMethod"
              value="email"
              class="mt-1 w-4 h-4 text-blue-600"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <Mail class="w-4 h-4 text-blue-600" />
                <span class="font-medium text-slate-900">Send Reset Link</span>
              </div>
              <p class="text-sm text-slate-600">
                Send a secure password reset link to the user's email address.
                The link will expire in 24 hours.
              </p>
            </div>
          </label>

          <label class="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': resetMethod === 'temporary' }"
          >
            <input
              type="radio"
              v-model="resetMethod"
              value="temporary"
              class="mt-1 w-4 h-4 text-blue-600"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <Key class="w-4 h-4 text-blue-600" />
                <span class="font-medium text-slate-900">Generate Temporary Password</span>
              </div>
              <p class="text-sm text-slate-600">
                Create a temporary password that the user must change on first login.
                Password will be displayed once.
              </p>
            </div>
          </label>
        </div>

        <!-- Temporary Password Result -->
        <div v-if="temporaryPassword" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start space-x-2 mb-3">
            <AlertTriangle class="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-yellow-900 mb-1">Temporary Password Generated</h4>
              <p class="text-sm text-yellow-700">
                Please provide this password to the user securely. It will not be shown again.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 bg-white rounded border border-yellow-300">
            <code class="text-lg font-mono font-bold text-slate-900">{{ temporaryPassword }}</code>
            <button
              @click="copyPassword"
              class="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Copy password"
            >
              <Copy class="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <p class="text-xs text-yellow-700 mt-2">
            User must change this password on next login.
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-start space-x-2">
            <CheckCircle class="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-green-900 mb-1">Reset Link Sent</h4>
              <p class="text-sm text-green-700">
                A password reset link has been sent to <strong>{{ user?.email }}</strong>.
                The link will expire in 24 hours.
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-start space-x-2">
            <AlertCircle class="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-red-900 mb-1">Error</h4>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Additional Options -->
        <div v-if="resetMethod === 'email' && !showSuccess" class="mb-6">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="includeInstructions"
              class="w-4 h-4 text-blue-600 rounded"
            />
            <span class="text-sm text-slate-700">
              Include password requirements and instructions in email
            </span>
          </label>
        </div>

        <!-- Security Note -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start space-x-2">
            <Shield class="w-5 h-5 text-blue-600 mt-0.5" />
            <div class="text-sm text-blue-900">
              <p class="font-medium mb-1">Security Note</p>
              <ul class="list-disc list-inside space-y-1 text-blue-800">
                <li>Password must be at least 8 characters long</li>
                <li>Must include uppercase and lowercase letters</li>
                <li>Must include at least one number</li>
                <li>Must include at least one special character</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <button
            v-if="!showSuccess && !temporaryPassword"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            v-if="temporaryPassword || showSuccess"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            v-if="!showSuccess && !temporaryPassword"
            @click="handleReset"
            :disabled="isLoading || !resetMethod"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span>{{ isLoading ? 'Processing...' : 'Reset Password' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import {
  X,
  Mail,
  Key,
  AlertTriangle,
  Copy,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2
} from 'lucide-vue-next'

interface Props {
  user: any
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const usersStore = useUsersStore()

// State
const resetMethod = ref<'email' | 'temporary'>('email')
const temporaryPassword = ref('')
const showSuccess = ref(false)
const error = ref('')
const isLoading = ref(false)
const includeInstructions = ref(true)

// Methods
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const handleReset = async () => {
  if (!props.user) return

  isLoading.value = true
  error.value = ''

  try {
    if (resetMethod.value === 'email') {
      await usersStore.sendPasswordResetEmail(props.user.id)
      showSuccess.value = true
      emit('success')
    } else {
      // Generate temporary password
      temporaryPassword.value = generateTemporaryPassword()

      // In real implementation, this would call the API to set the temporary password
      // await usersStore.setTemporaryPassword(props.user.id, temporaryPassword.value)

      emit('success')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const generateTemporaryPassword = (): string => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'
  const numbers = '23456789'
  const special = '!@#$%&*'

  let password = ''

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  const all = uppercase + lowercase + numbers + special
  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(temporaryPassword.value)
    // Could add a toast notification here
    alert('Password copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy password:', err)
  }
}
</script>
