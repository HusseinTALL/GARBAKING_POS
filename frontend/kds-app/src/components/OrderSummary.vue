<!--
  GARBAKING POS Invoice/Order Summary - Dark Theme Design System
  Professional invoice panel following comprehensive design system specifications
-->

<template>
  <div
    class="bg-slate-800 border-slate-700 flex flex-col h-full"
    :class="isMobile ? 'w-full' : 'w-96 border-l'"
  >
    <!-- Header -->
    <div class="p-4 md:p-6 border-b border-slate-700">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-white">Invoice</h2>
        <div class="flex items-center space-x-2">
          <!-- Mobile close button -->
          <button
            v-if="isMobile"
            @click="$emit('close')"
            class="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors mr-3"
          >
            <X class="text-white" />
          </button>
          <!-- Desktop window controls -->
          <div v-else class="flex space-x-2">
            <div class="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
            <div class="w-4 h-4 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/30"></div>
            <div class="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
          </div>
        </div>
      </div>

      <!-- Mobile drag handle -->
      <div v-if="isMobile" class="flex justify-center mb-4">
        <div class="w-10 h-1 bg-slate-600 rounded-full"></div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <div v-if="cartStore.isEmpty" class="text-center py-16">
        <div class="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-600">
          <ShoppingCart class="text-slate-400 text-2xl" />
        </div>
        <p class="text-slate-400 text-lg font-medium">No items selected</p>
        <p class="text-slate-500 text-sm mt-2">Add items to your order to see them here</p>
      </div>

      <div v-else class="space-y-5">
        <div
          v-for="item in orderItems"
          :key="item.id"
          class="flex items-center space-x-4 pb-5 border-b border-slate-700 last:border-0 hover:bg-slate-750 rounded-lg p-3 -m-3 transition-colors duration-200 group"
        >
          <!-- Item Image -->
          <div class="w-14 h-14 bg-slate-700 rounded-xl flex-shrink-0 overflow-hidden border border-slate-600">
            <img
              v-if="item.menuItem.imageUrl"
              :src="item.menuItem.imageUrl"
              :alt="item.menuItem.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <component :is="getFoodIcon(item.menuItem.name)" class="text-blue-400 text-lg" />
            </div>
          </div>

          <!-- Item Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-white text-lg truncate">{{ item.menuItem.name }}</h4>
              <button
                @click="removeItem(item.id)"
                class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                title="Remove item"
              >
                <X class="text-sm" />
              </button>
            </div>
            <p class="text-slate-400 text-sm mt-1">${{ item.menuItem.price.toFixed(2) }} each</p>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center space-x-2">
                <button
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  class="w-6 h-6 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors"
                >
                  <Minus class="text-xs text-white" />
                </button>
                <span class="text-slate-300 text-sm font-medium w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.id, item.quantity + 1)"
                  class="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <Plus class="text-xs text-white" />
                </button>
              </div>
              <p class="font-bold text-white text-xl">${{ (item.menuItem.price * item.quantity).toFixed(2) }}</p>
            </div>
            <div v-if="item.specialInstructions" class="text-slate-400 text-xs mt-1 italic">
              Note: {{ item.specialInstructions }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Summary -->
    <div v-if="!cartStore.isEmpty" class="p-3 md:p-4 border-t border-slate-700 bg-slate-850">
      <h3 class="font-semibold text-white text-lg mb-3">Payment Summary</h3>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Sub Total</span>
          <span class="text-white font-medium">${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Tax (10%)</span>
          <span class="text-white font-medium">${{ tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-slate-600">
          <span class="text-white font-semibold">Total Payment</span>
          <span class="text-white font-bold text-lg">${{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Payment Button -->
      <button
        @click="processPayment"
        :disabled="isProcessing"
        class="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-4 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
        :class="{ 'animate-pulse': isProcessing }"
      >
        <Loader2
          v-if="isProcessing"
          class="animate-spin text-sm"
        />
        <CreditCard
          v-else
          class="text-sm"
        />
        <span class="text-sm">{{ isProcessing ? 'Processing...' : 'Process Payment' }}</span>
      </button>

      <!-- Payment Method Selection -->
      <div class="grid grid-cols-3 gap-1.5 mt-3">
        <button
          @click="updatePaymentMethod('cash')"
          :class="{
            'bg-blue-500 text-white': selectedPaymentMethod === 'cash',
            'bg-slate-700 hover:bg-slate-600 text-white': selectedPaymentMethod !== 'cash'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <Banknote class="text-xs" />
          <span>Cash</span>
        </button>
        <button
          @click="updatePaymentMethod('card')"
          :class="{
            'bg-blue-500 text-white': selectedPaymentMethod === 'card',
            'bg-slate-700 hover:bg-slate-600 text-white': selectedPaymentMethod !== 'card'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <CreditCard class="text-xs" />
          <span>Card</span>
        </button>
        <button
          @click="updatePaymentMethod('mobile')"
          :class="{
            'bg-blue-500 text-white': selectedPaymentMethod === 'mobile',
            'bg-slate-700 hover:bg-slate-600 text-white': selectedPaymentMethod !== 'mobile'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <Smartphone class="text-xs" />
          <span>Mobile</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import {
  X,
  ShoppingCart,
  Minus,
  Plus,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Wheat,
  UtensilsCrossed,
  Beef,
  Fish,
  Soup,
  Leaf,
  Flame,
  Utensils
} from 'lucide-vue-next'

// Props
interface Props {
  isMobile?: boolean
}

withDefaults(defineProps<Props>(), {
  isMobile: false
})

// Emits
defineEmits<{
  close: []
}>()

// Cart store
const cartStore = useCartStore()

// Real-time cart data from store
const orderItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const tax = computed(() => cartStore.tax)
const total = computed(() => cartStore.total)
const isProcessing = computed(() => cartStore.isProcessingPayment)

// Local state for payment method selection
const selectedPaymentMethod = ref<'cash' | 'card' | 'mobile'>('card')

// Methods
const processPayment = async () => {
  try {
    const result = await cartStore.processPayment(selectedPaymentMethod.value)

    if (result.success) {
      // Show success feedback
      alert(`Payment successful! Transaction ID: ${result.transactionId}`)
    } else {
      // Show error feedback
      alert(`Payment failed: ${result.error}`)
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('Payment failed. Please try again.')
  }
}

const updatePaymentMethod = (method: 'cash' | 'card' | 'mobile') => {
  selectedPaymentMethod.value = method
  cartStore.paymentMethod = method
}

const removeItem = (cartItemId: string) => {
  cartStore.removeItem(cartItemId)
}

const updateQuantity = (cartItemId: string, newQuantity: number) => {
  cartStore.updateItemQuantity(cartItemId, newQuantity)
}

const getFoodIcon = (itemName: string) => {
  const name = itemName.toLowerCase()

  if (name.includes('pasta') || name.includes('spaghetti')) {
    return Wheat
  } else if (name.includes('chicken') || name.includes('fried')) {
    return UtensilsCrossed
  } else if (name.includes('steak') || name.includes('beef')) {
    return Beef
  } else if (name.includes('fish')) {
    return Fish
  } else if (name.includes('soup') || name.includes('jjigae')) {
    return Soup
  } else if (name.includes('tofu')) {
    return Leaf
  } else if (name.includes('kimchi')) {
    return Flame
  } else {
    return Utensils
  }
}
</script>

<style scoped>
/* Custom scrollbar for order items */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
