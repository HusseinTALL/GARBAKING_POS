<!--
  Profile View - User profile and order history
  Shows customer information and past orders
-->

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-text-DEFAULT">Profile</h1>

          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">{{ currentLocale === 'fr' ? 'FR' : 'EN' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- User Info Card -->
      <div class="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl p-6 mb-6 text-white">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ customerName || 'Guest User' }}</h2>
            <p class="text-white/80 text-sm">{{ customerPhone || 'No phone number' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ totalOrders }}</p>
            <p class="text-white/80 text-xs">Orders</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold">0</p>
            <p class="text-white/80 text-xs">Points</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold">0</p>
            <p class="text-white/80 text-xs">Vouchers</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <button
          @click="goToHome"
          class="bg-background-gray rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span class="text-sm font-semibold text-text-DEFAULT">New Order</span>
        </button>

        <button
          @click="goToVouchers"
          class="bg-background-gray rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span class="text-sm font-semibold text-text-DEFAULT">My Vouchers</span>
        </button>
      </div>

      <!-- Order History Section -->
      <div class="mb-4">
        <h3 class="text-lg font-bold text-text-DEFAULT mb-3">Order History</h3>
      </div>

      <!-- Order History Component -->
      <OrderHistory />
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cart'
import { ordersApi } from '@/services/api'
import { setLocale, getCurrentLocale } from '@/plugins/i18n'
import BottomNavigation from '@/components/BottomNavigation.vue'
import OrderHistory from '@/components/OrderHistory.vue'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const { t, locale } = useI18n()

// Get customer info from cart store
const customerName = computed(() => cartStore.customerInfo.name || 'Guest User')
const customerPhone = computed(() => cartStore.customerInfo.phone || '')

// Total orders count
const totalOrders = ref(0)

// Current locale
const currentLocale = computed(() => locale.value)

// Toggle language between French and English
const toggleLanguage = () => {
  const newLocale = currentLocale.value === 'fr' ? 'en' : 'fr'
  setLocale(newLocale)

  const languageName = newLocale === 'fr' ? 'Français' : 'English'
  toast.success(`Language changed to ${languageName}`)
}

// Fetch total orders count
const fetchOrderCount = async () => {
  if (!customerPhone.value) return

  try {
    const response = await ordersApi.getCustomerOrderHistory(customerPhone.value)
    if (response.success && response.data) {
      totalOrders.value = response.data.count || 0
    }
  } catch (error) {
    console.error('Error fetching order count:', error)
  }
}

const goToHome = () => {
  router.push('/home')
}

const goToVouchers = () => {
  router.push('/vouchers')
}

// Lifecycle
onMounted(() => {
  fetchOrderCount()
})
</script>
