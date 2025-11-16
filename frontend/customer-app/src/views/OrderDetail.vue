<script setup lang="ts">
/**
 * OrderDetail - View specific order details (Page 16)
 *
 * Features:
 * - Order status banner
 * - Order information
 * - Items list
 * - Payment summary
 * - Driver info (for delivery)
 * - Reorder/Help buttons
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const orderNumber = computed(() => route.params.id as string)

// Mock order data - replace with actual data from store
const order = ref({
  id: '#12345',
  status: 'delivered',
  date: 'Today, 2:30 PM',
  items: [
    {
      id: '1',
      name: 'Margherita Pizza',
      quantity: 2,
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e'
    },
    {
      id: '2',
      name: 'Classic Burger',
      quantity: 1,
      price: 10.00,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
    }
  ],
  subtotal: 34.00,
  deliveryFee: 3.00,
  tax: 3.70,
  discount: 5.00,
  total: 35.70,
  paymentMethod: 'Credit Card',
  deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
  driver: {
    name: 'John Smith',
    phone: '+1 234 567 8900',
    vehicle: 'Honda Bike',
    plate: 'ABC 123',
    rating: 4.9
  }
})

const statusConfig = computed(() => {
  const configs: Record<string, any> = {
    'pending': {
      color: 'amber',
      bgClass: 'bg-primary-50',
      textClass: 'text-primary-600',
      iconClass: 'text-primary-500',
      icon: 'fa-clock',
      title: 'Order Confirmed',
      message: 'Your order is being prepared'
    },
    'preparing': {
      color: 'blue',
      bgClass: 'bg-accent-blue-50',
      textClass: 'text-accent-blue-600',
      iconClass: 'text-accent-blue-500',
      icon: 'fa-fire-burner',
      title: 'Preparing',
      message: 'Your food is being prepared'
    },
    'on-the-way': {
      color: 'purple',
      bgClass: 'bg-accent-purple-50',
      textClass: 'text-accent-purple-600',
      iconClass: 'text-accent-purple-500',
      icon: 'fa-motorcycle',
      title: 'On the Way',
      message: 'Your order is being delivered'
    },
    'delivered': {
      color: 'green',
      bgClass: 'bg-accent-green-50',
      textClass: 'text-accent-green-600',
      iconClass: 'text-accent-green-500',
      icon: 'fa-check-circle',
      title: 'Delivered',
      message: 'Your order has been delivered successfully'
    },
    'cancelled': {
      color: 'red',
      bgClass: 'bg-secondary-50',
      textClass: 'text-secondary-600',
      iconClass: 'text-secondary-500',
      icon: 'fa-times-circle',
      title: 'Cancelled',
      message: 'This order was cancelled'
    }
  }
  return configs[order.value.status] || configs['pending']
})

function goBack() {
  router.back()
}

function reorder() {
  // TODO: Implement reorder functionality
  console.log('Reorder')
}

function getHelp() {
  // TODO: Navigate to help/support
  router.push('/help')
}

function callDriver() {
  window.location.href = `tel:${order.value.driver.phone}`
}

function trackOrder() {
  router.push(`/order-status/${orderNumber.value}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Order Details</h2>
        <button class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <i class="fas fa-ellipsis-vertical text-black"></i>
        </button>
      </div>
    </div>

    <div class="px-6 py-6 space-y-4">
      <!-- Status Banner -->
      <div :class="['rounded-3xl p-6', statusConfig.bgClass]">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <i :class="['fas', statusConfig.icon, 'text-2xl', statusConfig.iconClass]"></i>
          </div>
          <div class="flex-1">
            <h3 :class="['font-bold text-lg mb-1', statusConfig.textClass]">
              {{ statusConfig.title }}
            </h3>
            <p class="text-black opacity-70 text-sm">{{ statusConfig.message }}</p>
            <div class="flex items-center gap-2 mt-2">
              <i class="fas fa-calendar text-black opacity-40 text-xs"></i>
              <span class="text-black opacity-60 text-xs">{{ order.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Info -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-black font-bold text-lg">Order {{ order.id }}</h3>
          <button
            v-if="order.status === 'on-the-way'"
            @click="trackOrder"
            class="text-primary-500 text-sm font-semibold"
          >
            Track Order
          </button>
        </div>

        <!-- Items List -->
        <div class="space-y-3 mb-4 pb-4 border-b border-gray-100">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <h4 class="text-black font-semibold text-sm">{{ item.name }}</h4>
              <p class="text-black opacity-60 text-xs">x{{ item.quantity }}</p>
            </div>
            <span class="text-black font-bold text-sm">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-black opacity-60">Subtotal</span>
            <span class="text-black font-semibold">${{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-black opacity-60">Delivery Fee</span>
            <span class="text-black font-semibold">${{ order.deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-black opacity-60">Tax</span>
            <span class="text-black font-semibold">${{ order.tax.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-accent-green-600">
            <span>Discount</span>
            <span class="font-semibold">-${{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-100">
            <span class="text-black">Total</span>
            <span class="text-primary-600">${{ order.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-credit-card text-black opacity-40"></i>
            <span class="text-black opacity-60 text-sm">Payment:</span>
            <span class="text-black font-semibold text-sm">{{ order.paymentMethod }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Address -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-3">Delivery Address</h3>
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-location-dot text-primary-500"></i>
          </div>
          <p class="text-black opacity-70 text-sm flex-1">{{ order.deliveryAddress }}</p>
        </div>
      </div>

      <!-- Driver Info (only for delivery) -->
      <div v-if="order.driver" class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-4">Driver Info</h3>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-user text-white text-2xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="text-black font-bold mb-1">{{ order.driver.name }}</h4>
            <div class="flex items-center gap-2 mb-1">
              <i class="fas fa-star text-primary-500 text-xs"></i>
              <span class="text-black text-xs">{{ order.driver.rating }}</span>
            </div>
            <p class="text-black opacity-60 text-xs">{{ order.driver.vehicle }} • {{ order.driver.plate }}</p>
          </div>
          <button
            @click="callDriver"
            class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center"
          >
            <i class="fas fa-phone text-white"></i>
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          @click="reorder"
          class="flex-1 bg-gradient-primary text-white font-semibold py-4 rounded-2xl shadow-lg"
        >
          Reorder
        </button>
        <button
          @click="getHelp"
          class="flex-1 bg-white text-black font-semibold py-4 rounded-2xl shadow-md border border-gray-200"
        >
          Get Help
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
