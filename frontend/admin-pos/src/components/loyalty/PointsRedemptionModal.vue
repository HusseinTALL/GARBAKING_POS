<!--
  Points Redemption Modal Component
  Allows customers to redeem loyalty points for discounts and rewards
-->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Redeem Loyalty Points
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Customer Info -->
          <div v-if="customerProfile" class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">Available Points</div>
                <div class="text-2xl font-bold text-blue-600">
                  {{ customerProfile.customer.loyaltyPoints.toLocaleString() }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">Point Value</div>
                <div class="text-lg font-semibold text-gray-900">
                  ${{ (customerProfile.customer.loyaltyPoints * dollarPerPoint).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Redemption Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Redemption Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Redemption Type
              </label>
              <select
                v-model="form.redemptionType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DISCOUNT">Dollar Discount</option>
                <option value="PERCENTAGE_OFF">Percentage Off</option>
                <option value="FREE_ITEM">Free Item</option>
              </select>
            </div>

            <!-- Points to Redeem -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Points to Redeem
              </label>
              <div class="relative">
                <input
                  v-model.number="form.pointsToRedeem"
                  type="number"
                  :min="minPointsRedeem"
                  :max="customerProfile?.customer.loyaltyPoints || 0"
                  :step="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter points to redeem"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm">pts</span>
                </div>
              </div>
              <div class="mt-1 text-sm text-gray-600">
                Minimum: {{ minPointsRedeem }} points
                <span v-if="maxPointsPerOrder">
                  • Maximum: {{ maxPointsPerOrder }} points per order
                </span>
              </div>
            </div>

            <!-- Discount Value Preview -->
            <div v-if="form.pointsToRedeem >= minPointsRedeem" class="p-3 bg-green-50 rounded-lg">
              <div class="text-sm text-gray-700">
                <span class="font-medium">Discount Value:</span>
                <span class="text-green-600 font-bold ml-2">
                  ${{ discountValue.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                v-model="form.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., $5 off order, 10% discount"
                maxlength="255"
              />
            </div>

            <!-- Expiration (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                v-model="form.expiresAt"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Order Association (Optional) -->
            <div v-if="orderId">
              <div class="flex items-center space-x-2">
                <input
                  v-model="applyToCurrentOrder"
                  type="checkbox"
                  id="apply-to-order"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="apply-to-order" class="text-sm text-gray-700">
                  Apply to current order (#{{ orderId.slice(-8) }})
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="text-sm text-red-600">{{ error }}</div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            :disabled="!isFormValid || isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redeeming...
            </span>
            <span v-else>Redeem Points</span>
          </button>
          <button
            @click="closeModal"
            :disabled="isSubmitting"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { CustomerLoyaltyProfile, RedemptionRequest } from '@/services/loyalty'

interface Props {
  isOpen: boolean
  customerProfile?: CustomerLoyaltyProfile | null
  orderId?: string | null
  minPointsRedeem?: number
  maxPointsPerOrder?: number
  dollarPerPoint?: number
}

const props = withDefaults(defineProps<Props>(), {
  customerProfile: null,
  orderId: null,
  minPointsRedeem: 100,
  maxPointsPerOrder: undefined,
  dollarPerPoint: 0.01
})

const emit = defineEmits<{
  'close': []
  'redeem': [redemption: RedemptionRequest & { applyToOrder: boolean }]
}>()

// Form state
const form = ref({
  pointsToRedeem: props.minPointsRedeem,
  redemptionType: 'DISCOUNT' as 'DISCOUNT' | 'PERCENTAGE_OFF' | 'FREE_ITEM',
  description: '',
  expiresAt: ''
})

const applyToCurrentOrder = ref(false)
const isSubmitting = ref(false)
const error = ref('')

// Computed properties
const discountValue = computed(() => {
  return form.value.pointsToRedeem * props.dollarPerPoint
})

const isFormValid = computed(() => {
  return (
    form.value.pointsToRedeem >= props.minPointsRedeem &&
    form.value.pointsToRedeem <= (props.customerProfile?.customer.loyaltyPoints || 0) &&
    (!props.maxPointsPerOrder || form.value.pointsToRedeem <= props.maxPointsPerOrder) &&
    form.value.description.trim().length > 0
  )
})

// Watch for changes
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetForm()
    error.value = ''
  }
})

watch(() => form.value.redemptionType, (newType) => {
  // Auto-generate description based on type
  if (form.value.pointsToRedeem >= props.minPointsRedeem) {
    switch (newType) {
      case 'DISCOUNT':
        form.value.description = `$${discountValue.value.toFixed(2)} off order`
        break
      case 'PERCENTAGE_OFF':
        const percentage = Math.min(Math.round(discountValue.value * 5), 50) // Max 50% off
        form.value.description = `${percentage}% off order`
        break
      case 'FREE_ITEM':
        form.value.description = `Free item up to $${discountValue.value.toFixed(2)}`
        break
    }
  }
})

watch(() => form.value.pointsToRedeem, () => {
  // Update description when points change
  if (form.value.pointsToRedeem >= props.minPointsRedeem) {
    const type = form.value.redemptionType
    switch (type) {
      case 'DISCOUNT':
        form.value.description = `$${discountValue.value.toFixed(2)} off order`
        break
      case 'PERCENTAGE_OFF':
        const percentage = Math.min(Math.round(discountValue.value * 5), 50)
        form.value.description = `${percentage}% off order`
        break
      case 'FREE_ITEM':
        form.value.description = `Free item up to $${discountValue.value.toFixed(2)}`
        break
    }
  }
})

// Methods
const resetForm = () => {
  form.value = {
    pointsToRedeem: props.minPointsRedeem,
    redemptionType: 'DISCOUNT',
    description: '',
    expiresAt: ''
  }
  applyToCurrentOrder.value = !!props.orderId
}

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    const redemption: RedemptionRequest & { applyToOrder: boolean } = {
      pointsToRedeem: form.value.pointsToRedeem,
      redemptionType: form.value.redemptionType,
      description: form.value.description,
      orderId: applyToCurrentOrder.value ? props.orderId || undefined : undefined,
      expiresAt: form.value.expiresAt || undefined,
      applyToOrder: applyToCurrentOrder.value
    }

    emit('redeem', redemption)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to redeem points'
  } finally {
    isSubmitting.value = false
  }
}
</script>