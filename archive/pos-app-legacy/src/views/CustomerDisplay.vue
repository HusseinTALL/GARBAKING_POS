<!--
  Customer Display Interface
  Shows real-time order updates for customers to see what's being added to their cart
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BuildingStorefrontIcon class="w-10 h-10" />
            </div>
            <div>
              <h1 class="text-4xl font-bold">Garbaking Restaurant</h1>
              <p class="text-blue-100 text-lg">Fresh • Delicious • Made with Love</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-blue-100">Order #</div>
            <div class="text-2xl font-bold">{{ currentOrderNumber }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 max-w-6xl mx-auto w-full p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">

        <!-- Order Items Section -->
        <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingBagIcon class="w-8 h-8 mr-3 text-blue-600" />
              Your Order
            </h2>
            <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'items' }}
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="cartItems.length === 0" class="text-center py-16">
            <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCartIcon class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-2xl font-semibold text-gray-700 mb-2">Ready to start your order</h3>
            <p class="text-gray-500 text-lg">Items will appear here as they're added</p>
          </div>

          <!-- Order Items -->
          <div v-else class="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
            <div
              v-for="item in cartItems"
              :key="item.cartId"
              class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center space-x-6">
                <!-- Item Image -->
                <div class="relative">
                  <img
                    :src="item.image || 'https://via.placeholder.com/80x80'"
                    :alt="item.name"
                    class="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
                  >
                  <div class="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {{ item.quantity }}
                  </div>
                </div>

                <!-- Item Details -->
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ item.name }}</h3>
                  <p class="text-gray-600 mb-2">{{ item.description || 'Fresh and delicious' }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-lg text-gray-700">${{ item.price.toFixed(2) }} each</span>
                    <span class="text-2xl font-bold text-green-600">${{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Section -->
        <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex flex-col">
          <h2 class="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <CalculatorIcon class="w-8 h-8 mr-3 text-green-600" />
            Order Summary
          </h2>

          <!-- Summary Details -->
          <div class="space-y-6 flex-1">
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div class="flex justify-between items-center py-2">
                <span class="text-lg text-gray-700">Subtotal</span>
                <span class="text-xl font-semibold text-gray-900">${{ subtotal.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between items-center py-2 border-t border-gray-200">
                <span class="text-lg text-gray-700">Tax (10%)</span>
                <span class="text-xl font-semibold text-gray-900">${{ taxes.toFixed(2) }}</span>
              </div>

              <div v-if="discount > 0" class="flex justify-between items-center py-2 border-t border-gray-200">
                <span class="text-lg text-gray-700">Discount</span>
                <span class="text-xl font-semibold text-red-600">-${{ discount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold">Total Amount</span>
                <span class="text-4xl font-bold">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Status -->
            <div class="text-center p-6">
              <div class="inline-flex items-center px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-lg font-semibold">
                <ClockIcon class="w-5 h-5 mr-2" />
                Order in Progress
              </div>
              <p class="text-gray-600 mt-4 text-lg">Please wait while your order is being prepared</p>
            </div>
          </div>

          <!-- Thank You Message -->
          <div class="mt-8 text-center bg-blue-50 rounded-2xl p-6">
            <h3 class="text-2xl font-bold text-blue-900 mb-2">Thank You!</h3>
            <p class="text-blue-700 text-lg">We appreciate your business</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-gray-800 text-white p-6">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-gray-300">Garbaking Restaurant • Est. 2020 • Made with ❤️</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CalculatorIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

interface CartItem {
  cartId: string
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
}

// Reactive data
const cartItems = ref<CartItem[]>([])
const currentOrderNumber = ref('219022')
const discount = ref(10.00)

// Computed values
const subtotal = computed(() =>
  cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

const taxes = computed(() => subtotal.value * 0.1)
const total = computed(() => subtotal.value + taxes.value - discount.value)

// Real-time updates simulation (in a real app, this would be WebSocket or Server-Sent Events)
let updateInterval: NodeJS.Timeout

const fetchCartUpdates = async () => {
  try {
    // In a real implementation, this would fetch from your API
    // For now, we'll use localStorage to simulate real-time updates
    const storedCart = localStorage.getItem('customer_display_cart')
    const storedOrderNumber = localStorage.getItem('customer_display_order')

    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      cartItems.value = parsedCart
    }

    if (storedOrderNumber) {
      currentOrderNumber.value = storedOrderNumber
    }
  } catch (error) {
    console.error('Error fetching cart updates:', error)
  }
}

onMounted(() => {
  // Initial load
  fetchCartUpdates()

  // Poll for updates every 1 second
  updateInterval = setInterval(fetchCartUpdates, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar for cart items */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Ensure smooth scrolling on touch devices */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}
</style>