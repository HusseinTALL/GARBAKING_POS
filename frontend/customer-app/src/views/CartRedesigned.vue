<script setup lang="ts">
/**
 * Cart - Shopping cart (Page 5 - UI/UX 4.4)
 *
 * Features:
 * - Cart item cards with images and quantity controls
 * - Promo code input
 * - Order summary with pricing breakdown
 * - Checkout button
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

// Mock cart items - replace with actual cart store data
const cartItems = ref([
  {
    id: '1',
    name: 'Pepperoni Pizza',
    customizations: 'Medium, Extra Cheese',
    price: 16.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Classic Burger',
    customizations: 'No customizations',
    price: 10.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop'
  }
])

const promoCode = ref('')

// Computed
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const deliveryFee = computed(() => 3.00)
const discount = computed(() => 5.00) // Applied discount
const total = computed(() => subtotal.value + deliveryFee.value - discount.value)

// Methods
function goBack() {
  router.back()
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartItems.value = []
  }
}

function decrementQuantity(itemId: string) {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

function incrementQuantity(itemId: string) {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    item.quantity++
  }
}

function applyPromoCode() {
  if (promoCode.value.trim()) {
    // TODO: Validate and apply promo code
    console.log('Applying promo code:', promoCode.value)
  }
}

function proceedToCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-warm">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">My Cart</h2>
        <button
          @click="clearCart"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-trash-alt text-black opacity-40"></i>
        </button>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <!-- Item Cards -->
      <div class="space-y-4 mb-4">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="bg-white rounded-3xl p-4 shadow-md"
        >
          <div class="flex gap-4">
            <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <h4 class="text-black font-bold mb-1">{{ item.name }}</h4>
              <p class="text-black opacity-60 text-xs mb-2">{{ item.customizations }}</p>
              <div class="flex items-center justify-between">
                <span class="text-black font-bold text-lg">${{ item.price.toFixed(2) }}</span>
                <div class="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1">
                  <button
                    @click="decrementQuantity(item.id)"
                    class="w-6 h-6 flex items-center justify-center"
                  >
                    <i class="fas fa-minus text-black text-xs"></i>
                  </button>
                  <span class="text-black font-bold">{{ item.quantity }}</span>
                  <button
                    @click="incrementQuantity(item.id)"
                    class="w-6 h-6 flex items-center justify-center"
                  >
                    <i class="fas fa-plus text-black text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promo Code -->
      <div class="bg-white rounded-3xl p-4 shadow-md mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-ticket text-primary-500 text-xl"></i>
          </div>
          <input
            v-model="promoCode"
            type="text"
            placeholder="Enter promo code"
            class="flex-1 bg-transparent text-black placeholder-gray-400 focus:outline-none font-semibold"
          />
          <button
            @click="applyPromoCode"
            class="text-primary-500 font-bold text-sm"
          >
            Apply
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white rounded-3xl p-5 shadow-md">
        <h3 class="text-black font-bold mb-4">Order Summary</h3>
        <div class="space-y-3 mb-4">
          <div class="flex justify-between">
            <span class="text-black opacity-70">Subtotal</span>
            <span class="text-black font-semibold">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-black opacity-70">Delivery Fee</span>
            <span class="text-black font-semibold">${{ deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-black opacity-70">Discount</span>
            <span class="text-primary-500 font-semibold">-${{ discount.toFixed(2) }}</span>
          </div>
          <div class="border-t border-gray-200 pt-3 flex justify-between">
            <span class="text-black font-bold text-lg">Total</span>
            <span class="text-black font-bold text-lg">${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Button -->
    <div class="px-6 py-4 bg-white border-t border-gray-100">
      <button
        @click="proceedToCheckout"
        class="w-full bg-gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
