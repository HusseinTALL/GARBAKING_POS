<script setup lang="ts">
/**
 * OrderTracking - Real-time order tracking (Page 8 - UI/UX 4.4)
 *
 * Features:
 * - Live order status timeline
 * - Driver information with photo
 * - Real-time location map
 * - Estimated delivery time
 * - Contact driver/restaurant buttons
 * - Order details summary
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderModeStore } from '@/stores/orderMode'

const router = useRouter()
const route = useRoute()
const orderModeStore = useOrderModeStore()

const orderNumber = computed(() => route.params.orderNumber as string || '#12345')

// Order status steps
const orderSteps = ref([
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    icon: 'fa-clipboard-check',
    time: '2:30 PM',
    completed: true
  },
  {
    id: 'preparing',
    label: 'Preparing',
    icon: 'fa-fire-burner',
    time: '2:35 PM',
    completed: true
  },
  {
    id: 'ready',
    label: 'Ready',
    icon: 'fa-box',
    time: '2:50 PM',
    completed: true
  },
  {
    id: 'delivery',
    label: orderModeStore.isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
    icon: orderModeStore.isDelivery ? 'fa-motorcycle' : 'fa-shopping-bag',
    time: 'In transit',
    completed: false,
    active: true
  },
  {
    id: 'delivered',
    label: orderModeStore.isDelivery ? 'Delivered' : 'Picked Up',
    icon: 'fa-circle-check',
    time: '',
    completed: false
  }
])

// Mock driver data
const driver = ref({
  name: 'Michael Johnson',
  photo: 'https://i.pravatar.cc/150?img=12',
  phone: '+1 (555) 123-4567',
  vehicle: 'Honda CBR 150',
  rating: 4.8,
  deliveries: 1234
})

const estimatedTime = ref('15 min')
const currentStatus = ref('Your order is on the way')

// Auto-update timer
let updateInterval: number | null = null

onMounted(() => {
  // Simulate real-time updates every 10 seconds
  updateInterval = window.setInterval(() => {
    // Update estimated time
    const currentMinutes = parseInt(estimatedTime.value)
    if (currentMinutes > 0) {
      estimatedTime.value = `${currentMinutes - 1} min`
    }
  }, 10000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

function goBack() {
  router.back()
}

function callDriver() {
  window.location.href = `tel:${driver.value.phone}`
}

function messageDriver() {
  // TODO: Open messaging interface
  console.log('Message driver')
}

function viewOrderDetails() {
  router.push(`/order/${orderNumber.value}`)
}

function contactRestaurant() {
  // TODO: Contact restaurant
  console.log('Contact restaurant')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-6">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Track Order</h2>
        <button
          @click="viewOrderDetails"
          class="text-primary-500 text-sm font-semibold"
        >
          Details
        </button>
      </div>

      <!-- Order Number -->
      <div class="text-center">
        <p class="text-black opacity-60 text-sm">Order Number</p>
        <p class="text-black font-bold text-lg">{{ orderNumber }}</p>
      </div>
    </div>

    <div class="px-6 py-6 space-y-4">
      <!-- Estimated Time Card -->
      <div class="bg-gradient-primary rounded-3xl p-6 shadow-xl text-center">
        <i class="fas fa-clock text-white text-4xl mb-3"></i>
        <p class="text-white opacity-90 text-sm mb-1">Estimated Arrival</p>
        <p class="text-white font-bold text-3xl mb-2">{{ estimatedTime }}</p>
        <p class="text-white opacity-80 text-sm">{{ currentStatus }}</p>
      </div>

      <!-- Driver Info Card (if delivery) -->
      <div v-if="orderModeStore.isDelivery" class="bg-white rounded-3xl p-5 shadow-md">
        <h3 class="text-black font-bold mb-4">Your Driver</h3>

        <div class="flex items-center gap-4 mb-4">
          <div class="relative">
            <img
              :src="driver.photo"
              :alt="driver.name"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div class="flex-1">
            <h4 class="text-black font-bold">{{ driver.name }}</h4>
            <p class="text-black opacity-60 text-sm">{{ driver.vehicle }}</p>
            <div class="flex items-center gap-2 mt-1">
              <i class="fas fa-star text-primary-500 text-xs"></i>
              <span class="text-black text-sm font-semibold">{{ driver.rating }}</span>
              <span class="text-black opacity-40 text-sm">({{ driver.deliveries }} deliveries)</span>
            </div>
          </div>
        </div>

        <!-- Contact Buttons -->
        <div class="flex gap-3">
          <button
            @click="callDriver"
            class="flex-1 bg-green-500 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            <i class="fas fa-phone"></i>
            Call
          </button>
          <button
            @click="messageDriver"
            class="flex-1 bg-primary-50 text-primary-500 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            <i class="fas fa-message"></i>
            Message
          </button>
        </div>
      </div>

      <!-- Map Placeholder -->
      <div class="bg-white rounded-3xl overflow-hidden shadow-md">
        <div class="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <!-- Map placeholder with marker -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <i class="fas fa-map-marked-alt text-gray-400 text-6xl mb-3"></i>
              <p class="text-gray-500 text-sm">Live tracking map</p>
            </div>
          </div>
          <!-- Delivery marker -->
          <div class="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <i class="fas fa-motorcycle text-white text-xl"></i>
            </div>
          </div>
          <!-- Destination marker -->
          <div class="absolute bottom-20 right-1/4">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
              <i class="fas fa-location-dot text-white"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Timeline -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold mb-5">Order Status</h3>

        <div class="space-y-4">
          <div
            v-for="(step, index) in orderSteps"
            :key="step.id"
            class="flex items-start gap-4 relative"
          >
            <!-- Timeline line -->
            <div
              v-if="index < orderSteps.length - 1"
              class="absolute left-6 top-12 w-0.5 h-full -ml-px"
              :class="step.completed ? 'bg-primary-500' : 'bg-gray-200'"
            ></div>

            <!-- Icon -->
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10',
                step.completed
                  ? 'bg-primary-500'
                  : step.active
                  ? 'bg-primary-500 animate-pulse'
                  : 'bg-gray-100'
              ]"
            >
              <i
                :class="[
                  `fas ${step.icon} text-xl`,
                  step.completed || step.active ? 'text-white' : 'text-gray-400'
                ]"
              ></i>
            </div>

            <!-- Content -->
            <div class="flex-1 pt-2">
              <div class="flex items-center justify-between">
                <h4
                  :class="[
                    'font-bold',
                    step.completed || step.active ? 'text-black' : 'text-black opacity-40'
                  ]"
                >
                  {{ step.label }}
                </h4>
                <span
                  :class="[
                    'text-sm',
                    step.completed ? 'text-primary-500 font-semibold' : 'text-black opacity-40'
                  ]"
                >
                  {{ step.time }}
                </span>
              </div>
              <p
                v-if="step.active"
                class="text-primary-500 text-sm font-medium mt-1"
              >
                In Progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Restaurant Button -->
      <button
        @click="contactRestaurant"
        class="w-full bg-white border-2 border-gray-200 text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
      >
        <i class="fas fa-store"></i>
        Contact Restaurant
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Bounce animation for delivery marker */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-10px) translateX(-50%);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
