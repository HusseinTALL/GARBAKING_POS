<script setup lang="ts">
/**
 * OrderConfirmation - Order placed successfully (Page 7 - UI/UX 4.4)
 *
 * Features:
 * - Success animation with checkmark
 * - Order number display
 * - Estimated delivery time
 * - Order summary
 * - Track order button
 * - Return to home button
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderModeStore } from '@/stores/orderMode'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const orderModeStore = useOrderModeStore()

const orderNumber = computed(() => route.params.orderNumber as string || '#12345')
const showSuccess = ref(false)

// Mock order data - replace with actual order data
const order = ref({
  id: orderNumber.value,
  date: new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }),
  estimatedTime: '30-40 min',
  items: [
    {
      id: '1',
      name: 'Margherita Pizza',
      quantity: 2,
      price: 12.00
    },
    {
      id: '2',
      name: 'Classic Burger',
      quantity: 1,
      price: 10.00
    }
  ],
  subtotal: 34.00,
  deliveryFee: 5.00,
  discount: 0.00,
  total: 39.00
})

onMounted(() => {
  // Trigger success animation
  setTimeout(() => {
    showSuccess.value = true
  }, 100)

  // Clear cart after order is placed
  // cartStore.clearCart()
})

function trackOrder() {
  router.push(`/order-tracking/${orderNumber.value}`)
}

function backToHome() {
  router.push('/home')
}

function viewOrderDetails() {
  router.push(`/order/${orderNumber.value}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <!-- Success Section -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <!-- Success Icon with Animation -->
      <div
        :class="[
          'w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all duration-500',
          showSuccess ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        ]"
      >
        <i class="fas fa-check text-white text-6xl"></i>
      </div>

      <!-- Success Message -->
      <h1 class="text-black font-bold text-2xl mb-2 text-center">
        Order Placed Successfully!
      </h1>
      <p class="text-black opacity-60 text-center mb-8">
        Your order has been confirmed and will be delivered soon
      </p>

      <!-- Order Info Card -->
      <div class="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl mb-6">
        <!-- Order Number -->
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p class="text-black opacity-60 text-sm mb-1">Order Number</p>
            <p class="text-black font-bold text-lg">{{ orderNumber }}</p>
          </div>
          <button
            @click="viewOrderDetails"
            class="text-primary-500 text-sm font-semibold"
          >
            View Details
          </button>
        </div>

        <!-- Estimated Time -->
        <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-clock text-primary-500 text-xl"></i>
          </div>
          <div class="flex-1">
            <p class="text-black opacity-60 text-sm mb-1">
              {{ orderModeStore.isDelivery ? 'Estimated Delivery' : orderModeStore.isTakeaway ? 'Ready for Pickup' : 'Serving Time' }}
            </p>
            <p class="text-black font-bold">{{ order.estimatedTime }}</p>
          </div>
        </div>

        <!-- Order Date -->
        <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-calendar text-black opacity-60 text-xl"></i>
          </div>
          <div class="flex-1">
            <p class="text-black opacity-60 text-sm mb-1">Order Date</p>
            <p class="text-black font-semibold text-sm">{{ order.date }}</p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-3 mb-4">
          <h3 class="text-black font-bold text-sm">Order Summary</h3>
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="text-black opacity-60 text-sm">{{ item.quantity }}x</span>
              <span class="text-black text-sm">{{ item.name }}</span>
            </div>
            <span class="text-black font-semibold text-sm">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Totals -->
        <div class="pt-4 border-t border-gray-100 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-black opacity-60 text-sm">Subtotal</span>
            <span class="text-black text-sm">${{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-black opacity-60 text-sm">
              {{ orderModeStore.isDelivery ? 'Delivery Fee' : 'Service Fee' }}
            </span>
            <span class="text-black text-sm">${{ order.deliveryFee.toFixed(2) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex items-center justify-between">
            <span class="text-green-500 text-sm">Discount</span>
            <span class="text-green-500 text-sm">-${{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <span class="text-black font-bold">Total</span>
            <span class="text-primary-500 font-bold text-xl">
              ${{ order.total.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Track Order Info -->
      <div class="w-full max-w-md bg-primary-50 rounded-2xl p-4 flex items-start gap-3 mb-4">
        <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-info text-white"></i>
        </div>
        <div class="flex-1">
          <p class="text-black font-semibold text-sm mb-1">Track Your Order</p>
          <p class="text-black opacity-70 text-xs">
            You can track your order status in real-time from the order tracking page
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="px-6 py-6 bg-white border-t border-gray-100 space-y-3">
      <button
        @click="trackOrder"
        class="w-full bg-gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg"
      >
        <i class="fas fa-location-dot mr-2"></i>
        Track Order
      </button>
      <button
        @click="backToHome"
        class="w-full bg-white border-2 border-gray-200 text-black font-bold py-4 rounded-2xl"
      >
        <i class="fas fa-home mr-2"></i>
        Back to Home
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Pulse animation for success icon */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.w-32.h-32 {
  animation: pulse 2s infinite;
}
</style>
