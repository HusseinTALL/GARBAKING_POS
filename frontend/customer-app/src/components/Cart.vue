<!--
  Cart component for managing selected items and quantities
  Features quantity updates, item removal, and order totals
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 z-40" v-if="cartItemsCount > 0">
    <!-- Cart summary bar - responsive -->
    <div
      @click="showCart = !showCart"
      class="backdrop-blur-xl bg-white/90 border-t border-orange-100 shadow-2xl cursor-pointer hover:bg-white/95 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-4">
            <div class="relative">
              <div class="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg class="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md animate-pulse">
                {{ cartItemsCount }}
              </div>
            </div>
            <div>
              <p class="text-xs sm:text-sm text-gray-500 font-medium">{{ $t('cart') }}</p>
              <p class="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                {{ formatPrice(cartTotal) }}
              </p>
            </div>
          </div>

          <button
            :aria-label="showCart ? $t('buttons.close') : $t('cart')"
            class="group bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base font-semibold hover:shadow-xl hover:shadow-orange-200 transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-[48px] min-h-[48px] flex items-center gap-1.5 sm:gap-2"
          >
            <span class="hidden xs:inline">{{ showCart ? $t('buttons.close') : 'View' }}</span>
            <svg class="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300" :class="{'rotate-180': showCart}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Cart details panel - responsive -->
    <div
      v-if="showCart"
      class="max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto backdrop-blur-xl bg-gradient-to-b from-white/95 to-orange-50/95 border-t border-orange-100 custom-scrollbar"
    >
      <div class="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <h3 class="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{{ $t('order_items') }}</h3>
          </div>
          <button
            @click.stop="clearCart"
            :aria-label="$t('buttons.clear_cart')"
            class="flex items-center gap-1.5 sm:gap-2 text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl hover:bg-red-50 transition-all duration-300"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span class="hidden sm:inline">{{ $t('buttons.clear_cart') }}</span>
          </button>
        </div>

        <!-- Cart items - responsive -->
        <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div
            v-for="item in cartItems"
            :key="item.sku"
            class="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100 hover:border-orange-200"
          >
            <div class="flex-1 min-w-0 pr-2 sm:pr-4">
              <h4 class="font-bold text-gray-900 truncate text-sm sm:text-base lg:text-lg group-hover:text-orange-600 transition-colors">
                {{ item.name }}
              </h4>
              <p class="text-xs sm:text-sm font-semibold text-orange-600 mt-0.5 sm:mt-1">
                {{ formatPrice(item.price) }} × {{ item.quantity }}
              </p>
              <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-medium rounded"
                >
                  {{ $t(`dietary_tags.${tag.replace('-', '_')}`) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <!-- Decrease quantity - responsive -->
              <button
                @click.stop="updateQuantity(item.sku, item.quantity - 1)"
                :aria-label="$t('remove_from_cart') + ' ' + item.name"
                class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Quantity display - responsive -->
              <div class="w-10 h-8 sm:w-11 sm:h-9 lg:w-12 lg:h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-sm sm:text-base lg:text-lg">{{ item.quantity }}</span>
              </div>

              <!-- Increase quantity - responsive -->
              <button
                @click.stop="updateQuantity(item.sku, item.quantity + 1)"
                :aria-label="$t('add_to_cart') + ' ' + item.name"
                class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart summary - responsive -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-orange-200 shadow-lg">
          <div class="flex justify-between items-center mb-4 sm:mb-6">
            <span class="text-base sm:text-lg font-bold text-gray-700">{{ $t('total') }}</span>
            <span class="text-2xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              {{ formatPrice(cartTotal) }}
            </span>
          </div>

          <button
            @click.stop="proceedToOrder"
            :disabled="cartItemsCount === 0"
            :aria-label="$t('place_order')"
            class="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3.5 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:shadow-2xl hover:shadow-orange-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px] flex items-center justify-center gap-2 sm:gap-3"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ $t('place_order') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MenuItem } from '@/services/mockApi'
import { formatCurrency } from '@/utils/currency'

// Composables
const { t } = useI18n()

// Props
interface CartItem extends MenuItem {
  quantity: number
}

interface Props {
  items: CartItem[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update-quantity': [sku: string, quantity: number]
  'clear-cart': []
  'proceed-to-order': []
}>()

// Local state
const showCart = ref(false)

// Computed
const cartItems = computed(() => props.items)
const cartItemsCount = computed(() =>
  cartItems.value.reduce((total, item) => total + item.quantity, 0)
)
const cartTotal = computed(() =>
  cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const updateQuantity = (sku: string, newQuantity: number) => {
  emit('update-quantity', sku, Math.max(0, newQuantity))
}

const clearCart = () => {
  emit('clear-cart')
  showCart.value = false
}

const proceedToOrder = () => {
  emit('proceed-to-order')
}
</script>

<style scoped>
/* Ensure cart is always visible above other content */
.z-40 {
  z-index: 40;
}

/* Backdrop blur support */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Gradient text */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(251, 146, 60, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #f97316, #fb923c);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ea580c, #f97316);
}

/* Smooth animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
