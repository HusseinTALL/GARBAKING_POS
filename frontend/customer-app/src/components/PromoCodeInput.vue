<!--
  PromoCodeInput.vue
  Promo code input with validation and apply button
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <h3 class="font-semibold text-gray-900">Promo Code</h3>
    </div>

    <!-- Applied Promo Code Display -->
    <div v-if="appliedCode" class="mb-3">
      <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div class="font-semibold text-green-900 text-sm">{{ appliedCode.code }}</div>
            <div class="text-xs text-green-700">
              {{ appliedCode.description }}
              <span class="font-semibold">-${{ appliedCode.discount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <button
          @click="handleRemove"
          class="p-1 hover:bg-green-100 rounded transition-colors"
        >
          <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Promo Code Input Form -->
    <div v-else class="flex gap-2">
      <div class="flex-1 relative">
        <input
          v-model="promoCode"
          type="text"
          placeholder="Enter promo code"
          :disabled="applying"
          class="w-full px-4 py-3 border-2 rounded-lg transition-all uppercase"
          :class="[
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200',
            'focus:outline-none focus:ring-2'
          ]"
          @keyup.enter="handleApply"
          @input="error = ''"
        />

        <!-- Error Message -->
        <p v-if="error" class="absolute -bottom-5 left-0 text-xs text-red-600 mt-1">
          {{ error }}
        </p>
      </div>

      <!-- Apply Button -->
      <button
        @click="handleApply"
        :disabled="!promoCode.trim() || applying"
        class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        <span v-if="!applying">Apply</span>
        <svg v-else class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>

    <!-- Available Promo Codes (Optional) -->
    <div v-if="showAvailable && availableCodes.length > 0 && !appliedCode" class="mt-4">
      <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Available Offers</div>
      <div class="space-y-2">
        <button
          v-for="code in availableCodes"
          :key="code.code"
          @click="selectAvailableCode(code)"
          class="w-full text-left p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-gray-900 text-sm group-hover:text-orange-600">{{ code.code }}</div>
              <div class="text-xs text-gray-600">{{ code.description }}</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Types
interface PromoCode {
  code: string
  description: string
  discount: number
  type: 'percentage' | 'fixed'
  minAmount?: number
}

// Props
interface Props {
  cartTotal: number
  showAvailable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAvailable: true
})

// Emits
const emit = defineEmits<{
  (e: 'apply', code: PromoCode): void
  (e: 'remove'): void
}>()

// State
const promoCode = ref('')
const applying = ref(false)
const error = ref('')
const appliedCode = ref<PromoCode | null>(null)

// Sample available promo codes
const availableCodes = ref<PromoCode[]>([
  {
    code: 'WELCOME20',
    description: '20% off your first order',
    discount: 0.20,
    type: 'percentage',
    minAmount: 15
  },
  {
    code: 'SAVE5',
    description: '$5 off orders above $25',
    discount: 5,
    type: 'fixed',
    minAmount: 25
  },
  {
    code: 'FREESHIP',
    description: 'Free delivery on all orders',
    discount: 0,
    type: 'fixed'
  }
])

// Methods
const validatePromoCode = (code: string): PromoCode | null => {
  const upperCode = code.toUpperCase().trim()

  // Find matching promo code
  const found = availableCodes.value.find(c => c.code === upperCode)

  if (!found) {
    return null
  }

  // Check minimum amount
  if (found.minAmount && props.cartTotal < found.minAmount) {
    error.value = `Minimum order of $${found.minAmount} required`
    return null
  }

  return found
}

const calculateDiscount = (code: PromoCode): number => {
  if (code.type === 'percentage') {
    return props.cartTotal * code.discount
  } else {
    return code.discount
  }
}

const handleApply = async () => {
  if (!promoCode.value.trim() || applying.value) return

  applying.value = true
  error.value = ''

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))

  const validated = validatePromoCode(promoCode.value)

  if (!validated) {
    if (!error.value) {
      error.value = 'Invalid promo code'
    }
    applying.value = false
    return
  }

  // Calculate actual discount
  const discountAmount = calculateDiscount(validated)

  // Apply the code
  appliedCode.value = {
    ...validated,
    discount: discountAmount
  }

  emit('apply', appliedCode.value)
  promoCode.value = ''
  applying.value = false
}

const handleRemove = () => {
  appliedCode.value = null
  emit('remove')
}

const selectAvailableCode = (code: PromoCode) => {
  promoCode.value = code.code
  handleApply()
}
</script>
