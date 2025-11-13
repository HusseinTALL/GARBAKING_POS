<!--
  Order Confirmation View - Enhanced with tracking
  Displays successful order confirmation with order details, status tracking, and delivery info
  Integrates with order store and provides real-time status updates
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Header -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="goToHome"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Order Confirmed</h1>

          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-6 max-w-2xl mx-auto">
      <!-- Success Animation -->
      <div class="text-center mb-8">
        <div class="relative inline-block">
          <!-- Animated success icon -->
          <div class="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
            <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <!-- Confetti particles -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="confetti"></div>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Placed!</h1>
        <p class="text-gray-600 dark:text-gray-400">Thank you for your order. We're preparing it now.</p>
      </div>

      <!-- Order Details Card -->
      <div v-if="order" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Order #{{ order.orderNumber }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusClass(order.status)"
          >
            {{ orderStore.getOrderStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Estimated Delivery/Pickup Time -->
        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ order.deliveryTime.type === 'asap' ? 'Estimated Delivery' : 'Scheduled Delivery' }}
              </p>
              <p class="text-lg font-bold text-orange-600 dark:text-orange-400">
                {{ formatDeliveryTime(order) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div v-if="order.deliveryAddress" class="border-t dark:border-gray-700 pt-4 mb-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">Delivery Address</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ order.deliveryAddress.street }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ order.deliveryAddress.city }}, {{ order.deliveryAddress.zipCode }}
              </p>
              <p v-if="order.deliveryAddress.instructions" class="text-xs text-gray-500 dark:text-gray-500 italic mt-1">
                {{ order.deliveryAddress.instructions }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="border-t dark:border-gray-700 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Payment Method</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatPaymentMethod(order.paymentMethod) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Tracking -->
      <div class="mb-6">
        <OrderTracking v-if="order" :order="order" />
      </div>

      <!-- Order Items Summary -->
      <div v-if="order" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Order Items</h3>

        <div class="space-y-3">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-3 pb-3 border-b dark:border-gray-700 last:border-0"
          >
            <div class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="font-bold text-orange-600 dark:text-orange-400">{{ item.quantity }}×</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white text-sm">{{ item.name }}</p>
              <p v-if="item.notes" class="text-xs text-gray-500 dark:text-gray-500 italic">{{ item.notes }}</p>
            </div>
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span class="text-gray-900 dark:text-white">{{ formatPrice(order.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Delivery Fee</span>
            <span class="text-gray-900 dark:text-white">{{ formatPrice(order.deliveryFee) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Tax</span>
            <span class="text-gray-900 dark:text-white">{{ formatPrice(order.tax) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{{ formatPrice(order.discount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-700">
            <span class="text-gray-900 dark:text-white">Total</span>
            <span class="text-orange-600 dark:text-orange-400">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <BaseButton
          @click="viewOrderDetails"
          variant="primary"
          size="lg"
          class="w-full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Track Order Status
        </BaseButton>

        <BaseButton
          @click="goToHome"
          variant="outline"
          size="lg"
          class="w-full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore, OrderStatus } from '@/stores/order'
import { formatCurrency } from '@/utils/currency'
import OrderTracking from '@/components/OrderTracking.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

// State
const order = ref<any>(null)

// Computed
const orderId = computed(() => route.params.id as string)

// Methods
const formatPrice = (amount: number): string => {
  return formatCurrency(amount)
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatDeliveryTime = (order: any): string => {
  if (order.deliveryTime.type === 'asap') {
    return order.deliveryTime.estimatedTime || '30-40 minutes'
  } else {
    return `${order.deliveryTime.scheduledDate} at ${order.deliveryTime.scheduledTime}`
  }
}

const formatPaymentMethod = (method: any): string => {
  if (method.type === 'card' && method.last4) {
    return `Card ending in ${method.last4}`
  } else if (method.type === 'mobile') {
    return 'Mobile Money'
  } else if (method.type === 'cash') {
    return 'Cash on Delivery'
  }
  return method.type
}

const getStatusClass = (status: OrderStatus): string => {
  const classes = {
    [OrderStatus.PENDING]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [OrderStatus.PREPARING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [OrderStatus.READY]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    [OrderStatus.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[status] || classes[OrderStatus.PENDING]
}

const viewOrderDetails = () => {
  router.push(`/orders/${orderId.value}`)
}

const goToHome = () => {
  router.push('/')
}

// Lifecycle
onMounted(async () => {
  if (orderId.value) {
    order.value = await orderStore.fetchOrderById(orderId.value)

    if (!order.value) {
      // Order not found, redirect to orders list
      router.push('/orders')
    }
  }

  document.title = 'Order Confirmed - Garbaking'
})
</script>

<style scoped>
/* Bounce animation */
@keyframes bounce-once {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-once {
  animation: bounce-once 0.6s ease-out;
}

/* Confetti particles (optional decoration) */
.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
</style>
