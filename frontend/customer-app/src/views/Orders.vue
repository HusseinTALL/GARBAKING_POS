<script setup lang="ts">
/**
 * Orders - Order history (Page 15 - UI/UX 4.4)
 *
 * Features:
 * - Status filter tabs (All, Delivered, In Progress, Cancelled)
 * - Order cards with order details
 * - Reorder and Track buttons
 * - Empty state
 * - Bottom navigation
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

const statusFilter = ref('All')
const statusTabs = ['All', 'Delivered', 'In Progress', 'Cancelled']

// Mock orders - replace with actual order store
const orders = ref([
  {
    id: '12345',
    orderNumber: '#12345',
    date: 'Dec 15, 2024',
    status: 'Delivered',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Coca Cola', quantity: 1 }
    ],
    total: 29.00,
    restaurant: 'Garbaking Restaurant',
    deliveredAt: '2:30 PM'
  },
  {
    id: '12346',
    orderNumber: '#12346',
    date: 'Dec 16, 2024',
    status: 'In Progress',
    items: [
      { name: 'Margherita Pizza', quantity: 1 },
      { name: 'Caesar Salad', quantity: 1 }
    ],
    total: 23.00,
    restaurant: 'Pizza Palace',
    estimatedTime: '25 min'
  },
  {
    id: '12347',
    orderNumber: '#12347',
    date: 'Dec 14, 2024',
    status: 'Cancelled',
    items: [
      { name: 'Spicy Ramen', quantity: 1 }
    ],
    total: 14.00,
    restaurant: 'Noodle House',
    cancelledReason: 'Out of stock'
  },
  {
    id: '12348',
    orderNumber: '#12348',
    date: 'Dec 13, 2024',
    status: 'Delivered',
    items: [
      { name: 'Cheeseburger', quantity: 1 },
      { name: 'Fries', quantity: 1 }
    ],
    total: 18.00,
    restaurant: 'Burger House',
    deliveredAt: '1:15 PM'
  }
])

const filteredOrders = computed(() => {
  if (statusFilter.value === 'All') {
    return orders.value
  }
  return orders.value.filter(order => order.status === statusFilter.value)
})

const hasOrders = computed(() => filteredOrders.value.length > 0)

function selectStatus(status: string) {
  statusFilter.value = status
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Delivered':
      return 'bg-green-50 text-green-600 border-green-200'
    case 'In Progress':
      return 'bg-primary-50 text-primary-600 border-primary-200'
    case 'Cancelled':
      return 'bg-red-50 text-red-600 border-red-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

function viewOrderDetails(orderId: string) {
  router.push(`/order/${orderId}`)
}

function trackOrder(orderId: string) {
  router.push(`/order-tracking/${orderId}`)
}

function reorder(order: any) {
  // TODO: Add items to cart
  console.log('Reorder:', order)
  router.push('/cart')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <h2 class="text-black font-bold text-lg text-center mb-4">My Orders</h2>

      <!-- Status Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          v-for="status in statusTabs"
          :key="status"
          @click="selectStatus(status)"
          :class="[
            'flex-shrink-0 px-6 py-3 rounded-2xl font-semibold text-sm transition-all',
            statusFilter === status
              ? 'bg-gradient-primary text-white shadow-lg'
              : 'bg-gray-100 text-black'
          ]"
        >
          {{ status }}
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div class="px-6 py-6">
      <div v-if="hasOrders" class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-3xl p-5 shadow-md"
        >
          <!-- Order Header -->
          <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <p class="text-black font-bold text-lg">{{ order.orderNumber }}</p>
              <p class="text-black opacity-60 text-sm">{{ order.date }}</p>
            </div>

            <div
              :class="[
                'px-4 py-2 rounded-xl border-2 font-semibold text-sm',
                getStatusColor(order.status)
              ]"
            >
              {{ order.status }}
            </div>
          </div>

          <!-- Restaurant Name -->
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-store text-black opacity-40"></i>
            <p class="text-black font-semibold">{{ order.restaurant }}</p>
          </div>

          <!-- Order Items -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(item, index) in order.items"
              :key="index"
              class="flex items-center justify-between"
            >
              <p class="text-black opacity-60 text-sm">
                {{ item.quantity }}x {{ item.name }}
              </p>
            </div>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
            <p class="text-black font-semibold">Total</p>
            <p class="text-primary-500 font-bold text-lg">${{ order.total.toFixed(2) }}</p>
          </div>

          <!-- Additional Info -->
          <div v-if="order.status === 'Delivered'" class="mb-4">
            <div class="flex items-center gap-2 text-green-600 text-sm">
              <i class="fas fa-check-circle"></i>
              <span>Delivered at {{ order.deliveredAt }}</span>
            </div>
          </div>

          <div v-else-if="order.status === 'In Progress'" class="mb-4">
            <div class="flex items-center gap-2 text-primary-500 text-sm">
              <i class="fas fa-clock"></i>
              <span>Est. {{ order.estimatedTime }}</span>
            </div>
          </div>

          <div v-else-if="order.status === 'Cancelled'" class="mb-4">
            <div class="flex items-center gap-2 text-red-500 text-sm">
              <i class="fas fa-times-circle"></i>
              <span>{{ order.cancelledReason }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              v-if="order.status === 'In Progress'"
              @click="trackOrder(order.id)"
              class="flex-1 bg-gradient-primary text-white font-semibold py-3 rounded-2xl"
            >
              <i class="fas fa-location-dot mr-2"></i>
              Track Order
            </button>

            <button
              v-else
              @click="viewOrderDetails(order.id)"
              class="flex-1 bg-white border-2 border-gray-200 text-black font-semibold py-3 rounded-2xl"
            >
              View Details
            </button>

            <button
              v-if="order.status === 'Delivered'"
              @click="reorder(order)"
              class="flex-1 bg-gradient-primary text-white font-semibold py-3 rounded-2xl"
            >
              <i class="fas fa-redo mr-2"></i>
              Reorder
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 px-6">
        <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-receipt text-gray-300 text-6xl"></i>
        </div>

        <h3 class="text-black font-bold text-xl mb-2 text-center">
          No Orders Yet
        </h3>
        <p class="text-black opacity-60 text-center mb-8 max-w-xs">
          {{ statusFilter === 'All' ? 'Start ordering your favorite dishes' : `No ${statusFilter.toLowerCase()} orders` }}
        </p>

        <button
          v-if="statusFilter === 'All'"
          @click="router.push('/home')"
          class="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg"
        >
          <i class="fas fa-utensils mr-2"></i>
          Browse Menu
        </button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
