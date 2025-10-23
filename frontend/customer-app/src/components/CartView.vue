<!--
  Full-page Cart View component
  Shows cart items with thumbnails, quantities, and totals
-->

<template>
  <div class="min-h-screen bg-white pb-32">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <button
          @click="$emit('close')"
          class="w-10 h-10 rounded-full bg-background-gray flex items-center justify-center text-text-DEFAULT hover:bg-gray-200 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="text-xl font-bold text-text-DEFAULT">My Cart</h1>

        <button
          v-if="items.length > 0"
          @click="$emit('clear-cart')"
          class="text-sm text-danger-500 font-semibold hover:text-danger-600 transition-colors"
        >
          Clear
        </button>
        <div v-else class="w-10"></div>
      </div>
    </div>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- Empty cart state -->
      <div v-if="items.length === 0" class="text-center py-20">
        <div class="w-24 h-24 bg-background-gray rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-text-DEFAULT mb-2">Your cart is empty</h3>
        <p class="text-text-secondary mb-6">Add some delicious items from the menu</p>
        <button
          @click="$emit('close')"
          class="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
        >
          Browse Menu
        </button>
      </div>

      <!-- Cart items -->
      <div v-else class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id || item.menuItemId"
          class="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-primary-200 transition-colors"
        >
          <!-- Item image -->
          <div class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span class="text-3xl">{{ getCategoryEmoji(item.category) }}</span>
            </div>
          </div>

          <!-- Item details -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-text-DEFAULT truncate">{{ item.name }}</h3>
            <p v-if="item.category" class="text-sm text-text-secondary">{{ item.category }}</p>
            <p class="text-lg font-bold text-text-DEFAULT mt-1">{{ formatPrice(item.price) }}</p>
          </div>

          <!-- Quantity controls -->
          <div class="flex flex-col items-center justify-between">
            <button
              @click="$emit('update-quantity', item.id, item.quantity + 1)"
              class="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>

            <span class="text-lg font-bold text-text-DEFAULT my-2">{{ item.quantity }}</span>

            <button
              @click="$emit('update-quantity', item.id, item.quantity - 1)"
              class="w-8 h-8 rounded-full bg-gray-200 text-text-DEFAULT flex items-center justify-center hover:bg-gray-300 transition-colors active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Promo code section -->
        <div class="bg-background-gray rounded-2xl p-4 mt-6">
          <div class="flex gap-3">
            <input
              v-model="promoCode"
              type="text"
              placeholder="Enter promo code"
              class="flex-1 px-4 py-3 bg-white rounded-xl text-sm text-text-DEFAULT placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              @click="applyPromo"
              class="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        <!-- Order summary -->
        <div class="bg-background-gray rounded-2xl p-6 mt-6 space-y-3">
          <h3 class="font-bold text-text-DEFAULT mb-4">Order Summary</h3>

          <div class="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span class="font-semibold">{{ formatPrice(subtotal) }}</span>
          </div>

          <div class="flex justify-between text-text-secondary">
            <span>Delivery Fee</span>
            <span class="font-semibold">{{ formatPrice(deliveryFee) }}</span>
          </div>

          <div v-if="discount > 0" class="flex justify-between text-primary-500">
            <span>Discount</span>
            <span class="font-semibold">-{{ formatPrice(discount) }}</span>
          </div>

          <div class="border-t border-gray-200 pt-3 mt-3 flex justify-between">
            <span class="font-bold text-text-DEFAULT text-lg">Total</span>
            <span class="font-bold text-primary-500 text-lg">{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky checkout button -->
    <div v-if="items.length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
      <div class="max-w-md mx-auto">
        <button
          @click="$emit('proceed-to-checkout')"
          class="w-full bg-primary-500 text-white py-4 rounded-full font-bold text-lg hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '@/services/mockApi'

interface CartItem extends MenuItem {
  quantity: number
}

interface Props {
  items: CartItem[]
}

const props = defineProps<Props>()

defineEmits<{
  'close': []
  'clear-cart': []
  'update-quantity': [sku: string, quantity: number]
  'proceed-to-checkout': []
}>()

const promoCode = ref('')

const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'Mains': '🍛',
    'Drinks': '🥤',
    'Desserts': '🍰',
    'Appetizers': '🥗'
  }
  return emojiMap[category] || '🍽️'
}

const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
}

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const deliveryFee = computed(() => {
  return subtotal.value > 20 ? 0 : 2.50
})

const discount = ref(0)

const total = computed(() => {
  return subtotal.value + deliveryFee.value - discount.value
})

const applyPromo = () => {
  if (promoCode.value.toLowerCase() === 'first25') {
    discount.value = subtotal.value * 0.25
    // Show success toast
    const event = new CustomEvent('show-toast', { detail: { message: '25% discount applied!' } })
    window.dispatchEvent(event)
  } else if (promoCode.value) {
    // Show error toast
    const event = new CustomEvent('show-toast', { detail: { message: 'Invalid promo code' } })
    window.dispatchEvent(event)
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
