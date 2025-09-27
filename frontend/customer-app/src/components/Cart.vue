<!--
  Cart component for managing selected items and quantities
  Features quantity updates, item removal, and order totals
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" v-if="cartItemsCount > 0">
    <!-- Cart summary bar -->
    <div class="p-4 flex items-center justify-between" @click="showCart = !showCart">
      <div class="flex items-center space-x-3">
        <div class="bg-orange-600 text-white rounded-full p-2 min-w-[40px] h-10 flex items-center justify-center">
          <span class="font-bold text-sm">{{ cartItemsCount }}</span>
        </div>
        <div>
          <p class="text-sm text-gray-600">{{ $t('cart') }}</p>
          <p class="font-bold text-lg">{{ formatPrice(cartTotal) }}</p>
        </div>
      </div>

      <button
        :aria-label="showCart ? $t('buttons.close') : $t('cart')"
        class="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors min-w-[48px] min-h-[48px]"
      >
        {{ showCart ? '×' : '→' }}
      </button>
    </div>

    <!-- Cart details panel -->
    <div
      v-if="showCart"
      class="max-h-96 overflow-y-auto bg-gray-50 border-t border-gray-200"
    >
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('cart') }}</h3>
          <button
            @click="clearCart"
            :aria-label="$t('buttons.clear_cart')"
            class="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            {{ $t('buttons.clear_cart') }}
          </button>
        </div>

        <!-- Cart items -->
        <div class="space-y-3 mb-4">
          <div
            v-for="item in cartItems"
            :key="item.sku"
            class="bg-white rounded-xl p-3 flex items-center justify-between"
          >
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 truncate">{{ item.name }}</h4>
              <p class="text-sm text-gray-600">{{ formatPrice(item.price) }}</p>
              <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {{ $t(`dietary_tags.${tag.replace('-', '_')}`) }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2 ml-3">
              <!-- Decrease quantity -->
              <button
                @click="updateQuantity(item.sku, item.quantity - 1)"
                :aria-label="$t('remove_from_cart') + ' ' + item.name"
                class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Quantity display -->
              <span class="w-8 text-center font-medium">{{ item.quantity }}</span>

              <!-- Increase quantity -->
              <button
                @click="updateQuantity(item.sku, item.quantity + 1)"
                :aria-label="$t('add_to_cart') + ' ' + item.name"
                class="w-8 h-8 rounded-full bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart summary -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">{{ $t('total') }}</span>
            <span class="text-xl font-bold text-orange-600">{{ formatPrice(cartTotal) }}</span>
          </div>

          <button
            @click="proceedToOrder"
            :disabled="cartItemsCount === 0"
            :aria-label="$t('place_order')"
            class="w-full bg-orange-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[48px]"
          >
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
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

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

/* Smooth animations for cart toggle */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>