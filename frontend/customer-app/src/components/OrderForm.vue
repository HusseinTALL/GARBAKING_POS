<!--
  Order form component for collecting customer details and submitting orders
  Features table number input, validation, and offline-first order submission
-->

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
    v-if="isVisible"
    @click.self="closeForm"
    style="touch-action: none;"
  >
    <div
      class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md my-auto max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header - responsive -->
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">{{ $t('place_order') }}</h2>
        <button
          @click="closeForm"
          :aria-label="$t('buttons.cancel')"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Order summary -->
      <div class="mb-6 bg-gray-50 rounded-xl p-4">
        <h3 class="font-medium text-gray-900 mb-3">{{ $t('cart') }}</h3>
        <div class="space-y-2 mb-4">
          <div
            v-for="item in cartItems"
            :key="item.sku"
            class="flex justify-between text-sm"
          >
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>
        <div class="border-t pt-3 flex justify-between font-bold">
          <span>{{ $t('total') }}</span>
          <span class="text-orange-600">{{ formatPrice(orderTotal) }}</span>
        </div>
      </div>

      <!-- Customer details form -->
      <form @submit.prevent="submitOrder" class="space-y-4">
        <!-- Table number or name input -->
        <div>
          <label for="customerInfo" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('table_number') }} / {{ $t('customer_name') }}
          </label>
          <input
            id="customerInfo"
            v-model="customerInfo"
            type="text"
            :placeholder="$t('placeholders.enter_table')"
            :aria-describedby="hasError ? 'error-message' : undefined"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasError }"
            required
          />
          <p
            v-if="hasError"
            id="error-message"
            class="mt-2 text-sm text-red-600"
            role="alert"
          >
            {{ errorMessage }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ $t('placeholders.enter_name') }}
          </p>
        </div>

        <!-- Payment method (display only for now) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Méthode de paiement
          </label>
          <div class="bg-gray-100 p-3 rounded-xl text-sm text-gray-600">
            💰 Espèces - Paiement à table
          </div>
        </div>

        <!-- Submit buttons -->
        <div class="flex space-x-3 pt-4">
          <button
            type="button"
            @click="closeForm"
            class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors min-h-[48px]"
          >
            {{ $t('buttons.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !customerInfo.trim()"
            :aria-label="$t('buttons.submit')"
            class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[48px] flex items-center justify-center"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isSubmitting ? 'Envoi...' : $t('buttons.submit') }}
          </button>
        </div>
      </form>

      <!-- Offline indicator -->
      <div
        v-if="!isOnline"
        class="mt-4 bg-yellow-100 border border-yellow-300 rounded-xl p-3 text-yellow-800 text-sm flex items-center"
        role="alert"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {{ $t('notifications.offline_mode') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { v4 as uuidv4 } from 'uuid'
import type { MenuItem, OrderItem } from '@/services/mockApi'
import { formatCurrency } from '@/utils/currency'

// Composables
const { t } = useI18n()

// Props
interface CartItem extends MenuItem {
  quantity: number
}

interface Props {
  isVisible: boolean
  cartItems: CartItem[]
  isOnline: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'submit': [order: {
    clientOrderId: string
    storeId: string
    createdAt: string
    customer: { name: string; type: 'onsite' }
    items: OrderItem[]
    total: number
    idempotencyKey: string
    payment: { method: 'cash'; status: 'pending' }
  }]
}>()

// Local state
const customerInfo = ref('')
const isSubmitting = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// Computed
const orderTotal = computed(() =>
  props.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
)

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const validateInput = (): boolean => {
  const input = customerInfo.value.trim()

  if (!input) {
    hasError.value = true
    errorMessage.value = t('errors.table_required')
    return false
  }

  // Check if it's a table number (1-20)
  const tableNumber = parseInt(input)
  if (!isNaN(tableNumber)) {
    if (tableNumber < 1 || tableNumber > 20) {
      hasError.value = true
      errorMessage.value = t('errors.invalid_table')
      return false
    }
  }

  hasError.value = false
  errorMessage.value = ''
  return true
}

const closeForm = () => {
  customerInfo.value = ''
  hasError.value = false
  errorMessage.value = ''
  emit('close')
}

const submitOrder = async () => {
  if (!validateInput()) {
    return
  }

  isSubmitting.value = true

  try {
    const orderItems: OrderItem[] = props.cartItems.map(item => ({
      sku: item.sku,
      name: item.name,
      qty: item.quantity,
      price: item.price
    }))

    const order = {
      clientOrderId: uuidv4(),
      storeId: 'store_local',
      createdAt: new Date().toISOString(),
      customer: {
        name: customerInfo.value.trim(),
        type: 'onsite' as const
      },
      items: orderItems,
      total: orderTotal.value,
      idempotencyKey: uuidv4(),
      payment: {
        method: 'cash' as const,
        status: 'pending' as const
      }
    }

    emit('submit', order)
    closeForm()
  } catch (error) {
    console.error('Order submission error:', error)
    hasError.value = true
    errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

// Reset error when input changes
const onInputChange = () => {
  if (hasError.value) {
    hasError.value = false
    errorMessage.value = ''
  }
}

// Watch for input changes
watch(() => customerInfo.value, onInputChange)

// Lock/unlock body scroll when modal opens/closes
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
  } else {
    // Unlock body scroll
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
  }
}, { immediate: true })
</script>

<style scoped>
/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Modal backdrop */
.z-50 {
  z-index: 50;
}

/* Focus styles for better accessibility */
input:focus {
  outline: none;
}

/* High contrast error state */
.border-red-500 {
  border-color: #ef4444;
}
</style>
