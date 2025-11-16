<!--
  OrderSummary.vue
  Comprehensive order summary with all pricing details
  Features: item breakdown, promo codes, delivery fee, taxes, total
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

    <!-- Order Items -->
    <div class="space-y-3 mb-4 pb-4 border-b border-gray-200">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-3"
      >
        <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
              <p v-if="item.customizations" class="text-xs text-gray-600 mt-0.5">
                {{ formatCustomizations(item.customizations) }}
              </p>
              <p v-if="item.notes" class="text-xs text-gray-500 italic mt-1">
                Note: {{ item.notes }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-semibold text-gray-900">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
              <p class="text-xs text-gray-600">
                Qty: {{ item.quantity }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Breakdown -->
    <div class="space-y-3">
      <!-- Subtotal -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-medium text-gray-900">{{ formatPrice(subtotal) }}</span>
      </div>

      <!-- Delivery Fee -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-1">
          <span class="text-gray-600">Delivery Fee</span>
          <button
            v-if="deliveryInfo"
            @click="showDeliveryInfo = !showDeliveryInfo"
            class="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <span
          class="font-medium"
          :class="deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'"
        >
          {{ deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee) }}
        </span>
      </div>

      <!-- Delivery Info Tooltip -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="showDeliveryInfo && deliveryInfo" class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p>{{ deliveryInfo }}</p>
        </div>
      </Transition>

      <!-- Tax -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Tax ({{ (taxRate * 100).toFixed(0) }}%)</span>
        <span class="font-medium text-gray-900">{{ formatPrice(tax) }}</span>
      </div>

      <!-- Discount -->
      <div v-if="discount > 0" class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2">
          <span class="text-green-600">Discount</span>
          <span v-if="promoCode" class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
            {{ promoCode }}
          </span>
        </div>
        <span class="font-medium text-green-600">-{{ formatPrice(discount) }}</span>
      </div>

      <!-- Service Fee (if applicable) -->
      <div v-if="serviceFee > 0" class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Service Fee</span>
        <span class="font-medium text-gray-900">{{ formatPrice(serviceFee) }}</span>
      </div>

      <!-- Total -->
      <div class="pt-3 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-gray-900">Total</span>
          <div class="text-right">
            <p class="text-2xl font-bold text-orange-600">{{ formatPrice(total) }}</p>
            <p v-if="savingsAmount > 0" class="text-xs text-green-600 font-medium">
              You save {{ formatPrice(savingsAmount) }}!
            </p>
          </div>
        </div>
      </div>

      <!-- Estimated Delivery Time -->
      <div v-if="estimatedDeliveryTime" class="pt-3 border-t border-gray-200">
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="text-gray-600">Estimated Delivery:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ estimatedDeliveryTime }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Method Summary -->
      <div v-if="paymentMethod" class="pt-3 border-t border-gray-200">
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <div>
            <span class="text-gray-600">Payment:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ formatPaymentMethod(paymentMethod) }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Address Summary -->
      <div v-if="deliveryAddress" class="pt-3 border-t border-gray-200">
        <div class="flex items-start gap-2 text-sm">
          <svg class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="flex-1">
            <span class="text-gray-600">Deliver to:</span>
            <p class="font-medium text-gray-900">{{ deliveryAddress.street }}</p>
            <p class="text-gray-600">{{ deliveryAddress.city }}, {{ deliveryAddress.zipCode }}</p>
            <p v-if="deliveryAddress.instructions" class="text-xs text-gray-500 italic mt-1">
              {{ deliveryAddress.instructions }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

// Types
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
  customizations?: any
  notes?: string
}

interface DeliveryAddress {
  street: string
  city: string
  zipCode: string
  instructions?: string
}

interface PaymentMethod {
  type: 'card' | 'mobile' | 'cash'
  last4?: string
}

// Props
interface Props {
  items: OrderItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount?: number
  deliveryFee?: number
  serviceFee?: number
  total: number
  promoCode?: string
  estimatedDeliveryTime?: string
  deliveryAddress?: DeliveryAddress
  paymentMethod?: PaymentMethod
  deliveryInfo?: string
}

const props = withDefaults(defineProps<Props>(), {
  discount: 0,
  deliveryFee: 0,
  serviceFee: 0
})

// State
const showDeliveryInfo = ref(false)

// Computed
const savingsAmount = computed(() => {
  return props.discount
})

// Methods
const formatPrice = (amount: number): string => {
  return formatCurrency(amount)
}

const formatCustomizations = (customizations: any): string => {
  if (!customizations) return ''

  const parts: string[] = []

  for (const [key, value] of Object.entries(customizations)) {
    if (Array.isArray(value) && value.length > 0) {
      parts.push(`${value.join(', ')}`)
    } else if (typeof value === 'string' && value) {
      parts.push(value)
    }
  }

  return parts.join(' • ')
}

const formatPaymentMethod = (method: PaymentMethod): string => {
  if (method.type === 'card' && method.last4) {
    return `Card ending in ${method.last4}`
  } else if (method.type === 'mobile') {
    return 'Mobile Money'
  } else if (method.type === 'cash') {
    return 'Cash on Delivery'
  }
  return 'Not selected'
}
</script>
