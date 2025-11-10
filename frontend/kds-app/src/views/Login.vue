<!--
  Staff login page for POS system
  Supports both password and PIN authentication with role validation
-->

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" :style="{ backgroundImage: `url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.2&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')` }"></div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UtensilsCrossed class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Garbaking POS</h1>
          <p class="text-indigo-100">Connexion du personnel</p>
        </div>

        <!-- Login Form -->
        <div class="px-8 py-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Employee ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ID Employé
              </label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="credentials.employeeId"
                  type="text"
                  required
                  placeholder="Ex: EMP001"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                  :class="{ 'border-red-500': errors.employeeId }"
                  :disabled="loading"
                />
              </div>
              <p v-if="errors.employeeId" class="mt-1 text-sm text-red-600">{{ errors.employeeId }}</p>
            </div>

            <!-- Authentication Method Toggle -->
            <div class="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                @click="authMethod = 'password'"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                  authMethod === 'password'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                ]"
              >
                Mot de passe
              </button>
              <button
                type="button"
                @click="authMethod = 'pin'"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                  authMethod === 'pin'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                ]"
              >
                Code PIN
              </button>
            </div>

            <!-- Password Input -->
            <div v-if="authMethod === 'password'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                  :class="{ 'border-red-500': errors.password }"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <!-- PIN Input -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Code PIN (4 chiffres)
              </label>
              <div class="flex justify-center space-x-3">
                <input
                  v-for="(digit, index) in pinDigits"
                  :key="index"
                  :ref="el => pinInputs[index] = el"
                  v-model="pinDigits[index]"
                  type="text"
                  maxlength="1"
                  pattern="[0-9]"
                  class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                  :class="{ 'border-red-500': errors.pinCode }"
                  :disabled="loading"
                  @input="handlePinInput(index, $event)"
                  @keydown="handlePinKeydown(index, $event)"
                  @paste="handlePinPaste"
                />
              </div>
              <p v-if="errors.pinCode" class="mt-1 text-sm text-red-600 text-center">{{ errors.pinCode }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <div class="flex items-center">
                <AlertTriangle class="w-4 h-4 text-red-500 mr-3" />
                <p class="text-sm text-red-700">{{ loginError }}</p>
              </div>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="loading || !canSubmit"
              class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <Loader2
                v-if="loading"
                class="animate-spin mr-2 w-4 h-4"
              />
              <span>{{ loading ? 'Connexion...' : 'Se connecter' }}</span>
            </button>

            <!-- Development Login Button (Visible only in development mode) -->
            <button
              v-if="isDevMode"
              type="button"
              @click="handleDevLogin"
              class="w-full bg-yellow-500 text-white font-medium py-3 px-6 rounded-xl hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center mt-4"
            >
              <span>Connexion Dev (Admin)</span>
            </button>
          </form>

          <!-- Help Links -->
          <div class="mt-8 text-center space-y-2">
            <button
              @click="showForgotPassword = true"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mot de passe oublié ?
            </button>
            <div class="text-xs text-gray-500">
              Problème de connexion ? Contactez votre superviseur
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="mt-6 text-center">
        <div class="inline-flex items-center space-x-2 text-white text-opacity-75 text-sm">
          <component
            :is="systemStatus.online ? icons.Wifi : icons.WifiOff"
            :class="systemStatus.online ? 'text-green-300' : 'text-yellow-300'"
            class="w-4 h-4"
          />
          <span>{{ systemStatus.online ? 'Système en ligne' : 'Mode hors ligne' }}</span>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showForgotPassword = false"
    >
      <div
        class="bg-white rounded-2xl p-8 max-w-md w-full animate-scale-in"
        @click.stop
      >
        <div class="text-center mb-6">
          <Key class="w-16 h-16 text-indigo-600 mb-4" />
          <h3 class="text-lg font-bold text-gray-900 mb-2">Réinitialisation du mot de passe</h3>
          <p class="text-gray-600">
            Contactez votre superviseur ou manager pour réinitialiser votre mot de passe.
          </p>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="font-medium text-gray-900 mb-2">Informations de contact</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center">
                <Phone class="w-4 h-4 mr-2" />
                <span>Manager: +225 XX XX XX XX</span>
              </div>
              <div class="flex items-center">
                <Mail class="w-4 h-4 mr-2" />
                <span>support@garbaking.com</span>
              </div>
            </div>
          </div>

          <button
            @click="showForgotPassword = false"
            class="w-full bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import {
  UtensilsCrossed,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Key,
  Phone,
  Mail,
  Wifi,
  WifiOff
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotificationStore()

const icons = {
  Wifi,
  WifiOff
}

// Reactive data
const authMethod = ref<'password' | 'pin'>('password')
const showPassword = ref(false)
const showForgotPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

const credentials = ref({
  employeeId: '',
  password: '',
  pinCode: ''
})

const errors = ref({
  employeeId: '',
  password: '',
  pinCode: ''
})

// PIN handling
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref<HTMLInputElement[]>([])

// System status
const systemStatus = ref({
  online: true,
  lastSync: new Date()
})

// Development mode check
const isDevMode = ref(import.meta.env.MODE === 'development')

// Computed
const canSubmit = computed(() => {
  if (!credentials.value.employeeId.trim()) return false

  if (authMethod.value === 'password') {
    return credentials.value.password.length >= 6
  } else {
    return pinDigits.value.every(digit => digit !== '')
  }
})

// Methods
const validateForm = (): boolean => {
  errors.value = { employeeId: '', password: '', pinCode: '' }

  if (!credentials.value.employeeId.trim()) {
    errors.value.employeeId = 'ID employé requis'
    return false
  }

  if (authMethod.value === 'password') {
    if (!credentials.value.password) {
      errors.value.password = 'Mot de passe requis'
      return false
    }
    if (credentials.value.password.length < 6) {
      errors.value.password = 'Mot de passe trop court (min. 6 caractères)'
      return false
    }
  } else {
    const pin = pinDigits.value.join('')
    if (pin.length !== 4) {
      errors.value.pinCode = 'Code PIN requis (4 chiffres)'
      return false
    }
    if (!/^\d{4}$/.test(pin)) {
      errors.value.pinCode = 'Code PIN invalide (chiffres uniquement)'
      return false
    }
    credentials.value.pinCode = pin
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  loginError.value = ''

  try {
    const loginData = {
      employeeId: credentials.value.employeeId.trim(),
      password: authMethod.value === 'password' ? credentials.value.password : undefined,
      pinCode: authMethod.value === 'pin' ? credentials.value.pinCode : undefined
    }

    const success = await authStore.login(loginData)

    if (success) {
      notification.success('Connexion réussie', `Bienvenue ${authStore.displayName}`)
      router.push('/dashboard')
    } else {
      loginError.value = authStore.error || 'Échec de la connexion'
    }
  } catch (error) {
    loginError.value = 'Erreur de connexion. Vérifiez votre connexion internet.'
    notification.error('Erreur de connexion', 'Impossible de se connecter au serveur')
  } finally {
    loading.value = false
  }
}

const handleDevLogin = async () => {
  // Set development credentials
  credentials.value.employeeId = 'admin@garbaking.com'
  credentials.value.password = 'SecurePassword123!'
  authMethod.value = 'password'

  // Trigger login
  await handleLogin()
}

// PIN input handlers
const handlePinInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    input.value = pinDigits.value[index]
    return
  }

  pinDigits.value[index] = value

  // Auto-focus next input
  if (value && index < 3) {
    nextTick(() => {
      pinInputs.value[index + 1]?.focus()
    })
  }

  // Update PIN code
  credentials.value.pinCode = pinDigits.value.join('')
}

const handlePinKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    nextTick(() => {
      pinInputs.value[index - 1]?.focus()
    })
  }
}

const handlePinPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const paste = event.clipboardData?.getData('text') || ''
  const digits = paste.replace(/\D/g, '').slice(0, 4).split('')

  if (digits.length === 4) {
    pinDigits.value = digits
    credentials.value.pinCode = digits.join('')

    // Focus last input
    nextTick(() => {
      pinInputs.value[3]?.focus()
    })
  }
}

// System status check
const checkSystemStatus = async () => {
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    systemStatus.value.online = response.ok
  } catch {
    systemStatus.value.online = false
  }
}

// Lifecycle
onMounted(() => {
  // Check if already authenticated
  authStore.loadFromStorage().then(isAuth => {
    if (isAuth) {
      router.push('/dashboard')
    }
  })

  // Check system status
  checkSystemStatus()
  setInterval(checkSystemStatus, 30000) // Check every 30 seconds
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Remove number input arrows */
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
