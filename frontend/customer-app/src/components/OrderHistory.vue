<!--
  Order history component displaying past orders with status and details
  Fetches customer order history from API based on phone number stored in cart
-->

<template>
  <div class="w-full">
    <!-- Loading state -->
    <div v-if="isLoading && orders.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading order history...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!isLoading && orders.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
      <p class="text-gray-600 mb-4">Your order history will appear here</p>
      <button
        @click="goToHome"
        class="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
      >
        Start ordering
      </button>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        @click="viewOrderDetails(order.orderNumber)"
        class="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      >
        <!-- Order header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-base text-gray-900">
              Order #{{ order.orderNumber }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <!-- Status badge -->
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="getStatusColor(order.status)"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <!-- Order items preview (show first 2 items) -->
        <div class="space-y-2 mb-3">
          <div
            v-for="(item, index) in order.orderItems.slice(0, 2)"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <!-- Item image -->
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                v-if="item.menuItem?.imageUrl"
                :src="item.menuItem.imageUrl"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>

            <!-- Item details -->
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
              <p class="text-xs text-gray-600">
                {{ formatPrice(item.unitPrice) }} × {{ item.quantity }}
              </p>
            </div>

            <!-- Item subtotal -->
            <p class="text-sm font-semibold text-gray-900">
              {{ formatPrice(item.unitPrice * item.quantity) }}
            </p>
          </div>

          <!-- More items indicator -->
          <p v-if="order.orderItems.length > 2" class="text-xs text-gray-500 pl-15">
            +{{ order.orderItems.length - 2 }} more item{{ order.orderItems.length - 2 > 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Order total -->
        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-600">Total</span>
          <span class="text-lg font-bold text-primary-600">{{ formatPrice(order.total) }}</span>
        </div>

        <!-- Action buttons -->
        <div class="mt-4 flex gap-2">
          <!-- Reorder button -->
          <button
            @click.stop="reorderItems(order)"
            class="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reorder
          </button>

          <!-- View details button -->
          <button
            @click.stop="viewOrderDetails(order.orderNumber)"
            class="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Details
          </button>
        </div>
      </div>

      <!-- Refresh button -->
      <button
        v-if="orders.length > 0"
        @click.stop="refreshHistory"
        :disabled="isLoading"
        class="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
      >
        <svg
          class="w-5 h-5 inline-block mr-2"
          :class="{ 'animate-spin': isLoading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ isLoading ? 'Refreshing...' : 'Refresh orders' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cart'
import { ordersApi } from '@/services/api'
import { formatCurrency } from '@/utils/currency'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

// State
const orders = ref<any[]>([])
const isLoading = ref(false)

// Computed
const customerPhone = computed(() => cartStore.customerInfo.phone)

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PREPARING':
      return 'bg-orange-100 text-orange-800'
    case 'READY':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'En attente'
    case 'CONFIRMED':
      return 'Confirmée'
    case 'PREPARING':
      return 'En préparation'
    case 'READY':
      return 'Prête'
    case 'COMPLETED':
      return 'Terminée'
    case 'CANCELLED':
      return 'Annulée'
    default:
      return status
  }
}

const fetchOrderHistory = async () => {
  if (!customerPhone.value) {
    console.log('No customer phone number available')
    return
  }

  isLoading.value = true

  try {
    const response = await ordersApi.getCustomerOrderHistory(customerPhone.value)

    if (response.success && response.data) {
      // Transform orders to ensure consistent data structure
      // Backend sends 'items' with 'menuItemName', frontend expects 'orderItems' with 'name'
      const transformedOrders = (response.data.orders || []).map((order: any) => ({
        ...order,
        orderItems: (order.items || order.orderItems || []).map((item: any) => ({
          ...item,
          // Map menuItemName to name for display
          name: item.menuItemName || item.name || 'Unknown Item',
          // Create a minimal menuItem object for image display
          menuItem: item.menuItem || {
            imageUrl: item.menuItemImageUrl || null,
            name: item.menuItemName || item.name
          }
        })),
        total: order.totalAmount || order.total || 0
      }))

      orders.value = transformedOrders
      console.log(`Loaded ${orders.value.length} orders for ${customerPhone.value}`)
    } else {
      throw new Error(response.error || 'Failed to fetch order history')
    }
  } catch (error: any) {
    console.error('Error fetching order history:', error)
    toast.error('Failed to load order history')
  } finally {
    isLoading.value = false
  }
}

const refreshHistory = async () => {
  await fetchOrderHistory()
  toast.success('Order history refreshed')
}

const viewOrderDetails = (orderNumber: string) => {
  router.push(`/order-status/${orderNumber}`)
}

const goToHome = () => {
  router.push('/home')
}

const reorderItems = (order: any) => {
  // Clear current cart
  cartStore.clearCart()

  // Add all items from the order to cart
  order.orderItems.forEach((item: any) => {
    const cartItem = {
      menuItemId: String(item.menuItemId),
      id: String(item.menuItemId),
      name: item.name || item.menuItemName || 'Unknown Item',
      price: item.unitPrice,
      imageUrl: item.menuItem?.imageUrl || null,
      notes: item.specialInstructions || item.notes || '',
      sku: item.menuItemSku || item.menuItem?.sku
    }

    cartStore.addItem(cartItem, item.quantity)
  })

  // Show success message
  toast.success(`${order.orderItems.length} items added to cart!`)

  // Navigate to home/menu page
  router.push('/home')
}

// Lifecycle
onMounted(() => {
  fetchOrderHistory()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
