<!--
  Main PWA Customer Ordering App for Garbaking
  Features offline-first ordering, menu browsing, cart management, and order tracking
-->

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Language switcher -->
    <div class="fixed top-4 right-4 z-30">
      <button
        @click="toggleLanguage"
        :aria-label="$t('buttons.switch_language')"
        class="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-opacity-100 transition-all"
      >
        {{ currentLocale === 'en' ? '🇺🇸 EN' : '🇫🇷 FR' }}
      </button>
    </div>

    <!-- Offline indicator -->
    <div v-if="!isOnline" class="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
      {{ $t('notifications.offline_mode') }}
    </div>

    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo/Title -->
          <div>
            <h1 class="text-xl font-bold text-gray-900">Garbaking</h1>
            <p class="text-sm text-gray-600">{{ $t('welcome') }}</p>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-2">
            <button
              @click="showOrderHistory = !showOrderHistory"
              :class="[
                'px-3 py-2 rounded-xl font-medium text-sm transition-colors',
                showOrderHistory
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ $t('order_history') }}
            </button>
            <button
              @click="showMenu = !showMenu"
              :class="[
                'px-3 py-2 rounded-xl font-medium text-sm transition-colors',
                !showOrderHistory
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ $t('menu') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="pb-32">
      <!-- Menu view -->
      <div v-if="!showOrderHistory" class="p-4">
        <!-- Categories filter -->
        <div class="mb-6 overflow-x-auto">
          <div class="flex space-x-2 pb-2">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="[
                'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              ]"
            >
              {{ $t(`categories.${category.toLowerCase()}`) }}
            </button>
          </div>
        </div>

        <!-- Menu items grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuItemCard
            v-for="item in filteredMenuItems"
            :key="item.sku"
            :item="item"
            @add-to-cart="addToCart"
          />
        </div>

        <!-- Empty state -->
        <div v-if="filteredMenuItems.length === 0" class="text-center py-12">
          <p class="text-gray-500">{{ $t('no_items') }}</p>
        </div>
      </div>

      <!-- Order history view -->
      <OrderHistory
        v-if="showOrderHistory"
        :orders="orderHistory"
        :is-loading="isLoadingHistory"
        @refresh="loadOrderHistory"
        @retry-sync="retryOrderSync"
        @mark-collected="markOrderCollected"
      />
    </main>

    <!-- Cart component -->
    <Cart
      :items="cartItems"
      @update-quantity="updateCartQuantity"
      @clear-cart="clearCart"
      @proceed-to-order="showOrderForm = true"
    />

    <!-- Order form modal -->
    <OrderForm
      v-if="showOrderForm"
      :is-visible="showOrderForm"
      :cart-items="cartItems"
      :is-online="isOnline"
      @close="showOrderForm = false"
      @submit="submitOrder"
    />

    <!-- Order status modal -->
    <div v-if="showOrderStatus && currentOrder" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <OrderStatus
        :order="currentOrder"
        @close="closeOrderStatus"
        @mark-collected="markOrderCollected"
      />
    </div>

    <!-- Loading overlay -->
    <div v-if="isSubmittingOrder" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p class="text-gray-700 font-medium">{{ $t('submitting_order') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { setLocale, getCurrentLocale } from '@/plugins/i18n'
import { mockApi, type MenuItem, type Order } from '@/services/mockApi'
import MenuItemCard from '@/components/MenuItemCard.vue'
import Cart from '@/components/Cart.vue'
import OrderForm from '@/components/OrderForm.vue'
import OrderHistory from '@/components/OrderHistory.vue'
import OrderStatus from '@/components/OrderStatus.vue'

// State
const menuItems = ref<MenuItem[]>([])
const cartItems = ref<(MenuItem & { quantity: number })[]>([])
const orderHistory = ref<Order[]>([])
const selectedCategory = ref<string>('All')
const showOrderHistory = ref(false)
const showMenu = ref(true)
const showOrderForm = ref(false)
const showOrderStatus = ref(false)
const currentOrder = ref<Order | null>(null)
const isOnline = ref(navigator.onLine)
const isSubmittingOrder = ref(false)
const isLoadingHistory = ref(false)

// Computed
const categories = computed(() => {
  const cats = ['All', ...new Set(menuItems.value.map(item => item.category))]
  return cats
})

const filteredMenuItems = computed(() => {
  if (selectedCategory.value === 'All') {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === selectedCategory.value)
})

const currentLocale = computed(() => getCurrentLocale())

// Methods
const loadMenu = async () => {
  try {
    menuItems.value = await mockApi.getMenu()
  } catch (error) {
    console.error('Failed to load menu:', error)
  }
}

const loadOrderHistory = async () => {
  isLoadingHistory.value = true
  try {
    orderHistory.value = await mockApi.getAllOrders()
  } catch (error) {
    console.error('Failed to load order history:', error)
  } finally {
    isLoadingHistory.value = false
  }
}

const addToCart = (item: MenuItem) => {
  const existingItem = cartItems.value.find(cartItem => cartItem.sku === item.sku)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cartItems.value.push({ ...item, quantity: 1 })
  }

  // Show toast notification
  showToast('Item added to cart')
}

const updateCartQuantity = (sku: string, newQuantity: number) => {
  if (newQuantity <= 0) {
    cartItems.value = cartItems.value.filter(item => item.sku !== sku)
    showToast('Item removed from cart')
  } else {
    const item = cartItems.value.find(item => item.sku === sku)
    if (item) {
      item.quantity = newQuantity
    }
  }
}

const clearCart = () => {
  cartItems.value = []
  showToast('Cart cleared')
}

const submitOrder = async (orderData: any) => {
  isSubmittingOrder.value = true

  try {
    const response = await mockApi.submitOrder(orderData)

    // Clear cart
    cartItems.value = []

    // Show order status
    const order = await mockApi.getOrderStatus(response.localOrderId)
    if (order) {
      currentOrder.value = order
      showOrderStatus.value = true
    }

    // Reload order history
    await loadOrderHistory()

    showToast('Order submitted successfully')
  } catch (error) {
    console.error('Order submission failed:', error)
    showToast('Erreur lors de la commande')
  } finally {
    isSubmittingOrder.value = false
  }
}

const retryOrderSync = async (orderId: string) => {
  try {
    await mockApi.syncOrder(orderId)
    await loadOrderHistory()
    showToast('Order synced successfully')
  } catch (error) {
    console.error('Sync retry failed:', error)
    showToast('Échec de la synchronisation')
  }
}

const markOrderCollected = async (orderId: string) => {
  // Update order status to collected
  showToast('Commande marquée comme récupérée')
  await loadOrderHistory()
  closeOrderStatus()
}

const closeOrderStatus = () => {
  showOrderStatus.value = false
  currentOrder.value = null
}

const toggleLanguage = () => {
  const newLocale = currentLocale.value === 'en' ? 'fr' : 'en'
  setLocale(newLocale)
}

const showToast = (message: string) => {
  // Simple toast notification
  const toast = document.createElement('div')
  toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm z-50'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    document.body.removeChild(toast)
  }, 3000)
}

// Network status monitoring
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Real-time order status updates
const setupOrderStatusListener = () => {
  window.addEventListener('orderStatusUpdate', (event: any) => {
    const { localOrderId, status } = event.detail

    // Update order history
    const order = orderHistory.value.find(o => o.localOrderId === localOrderId)
    if (order) {
      order.status = status
    }

    // Update current order if viewing
    if (currentOrder.value?.localOrderId === localOrderId) {
      currentOrder.value.status = status
    }
  })
}

// Initialize app
onMounted(async () => {
  await loadMenu()
  await loadOrderHistory()

  // Set up network monitoring
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Set up order status updates
  setupOrderStatusListener()

  // Set default category to first available
  if (categories.value.length > 1) {
    selectedCategory.value = categories.value[1] // Skip "All"
  }
})
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Ensure proper z-indexing */
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-50 { z-index: 50; }

/* Sticky header */
.sticky {
  position: sticky;
  top: 0;
}
</style>