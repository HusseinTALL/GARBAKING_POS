<script setup lang="ts">
/**
 * Checkout - Order checkout (Page 6 - UI/UX 4.4)
 *
 * Features:
 * - Delivery address selection with cards
 * - Payment method selection
 * - Delivery instructions textarea
 * - Total payment display
 * - Place order button
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressesStore } from '@/stores/addresses'

const router = useRouter()
const addressesStore = useAddressesStore()

// State
const selectedAddressId = ref('1')
const selectedPaymentId = ref('visa')
const deliveryInstructions = ref('')

// Mock addresses - replace with actual addresses store
const addresses = ref([
  {
    id: '1',
    type: 'home',
    icon: 'fa-home',
    name: 'Home',
    address: '123 Times Square, New York, NY 10036',
    isSelected: true
  },
  {
    id: '2',
    type: 'work',
    icon: 'fa-briefcase',
    name: 'Office',
    address: '456 Madison Ave, New York, NY 10022',
    isSelected: false
  }
])

// Mock payment methods
const paymentMethods = ref([
  {
    id: 'visa',
    name: 'Visa Card',
    icon: 'fab fa-cc-visa',
    details: '**** **** **** 4532',
    isSelected: true
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: 'fab fa-cc-mastercard',
    details: '**** **** **** 8921',
    isSelected: false
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    icon: 'fas fa-wallet',
    details: 'Pay when you receive',
    isSelected: false
  }
])

const totalPayment = ref(40.00)

// Methods
function goBack() {
  router.back()
}

function selectAddress(addressId: string) {
  selectedAddressId.value = addressId
}

function changeAddress() {
  router.push('/address/add')
}

function selectPayment(paymentId: string) {
  selectedPaymentId.value = paymentId
}

function placeOrder() {
  // TODO: Process order
  const orderNumber = Math.floor(Math.random() * 100000).toString()
  router.push(`/order-confirmation/${orderNumber}`)
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
        <h2 class="text-black font-bold text-lg">Checkout</h2>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <!-- Delivery Address -->
      <div class="mb-5">
        <h3 class="text-black font-bold mb-3">Delivery Address</h3>

        <!-- Selected Address -->
        <div
          class="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary-500 mb-3"
        >
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="fas fa-home text-primary-500 text-xl"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-black font-bold">Home</span>
                <button
                  @click="changeAddress"
                  class="text-primary-500 text-sm font-semibold"
                >
                  Change
                </button>
              </div>
              <p class="text-black opacity-70 text-sm">
                123 Times Square, New York, NY 10036
              </p>
            </div>
          </div>
        </div>

        <!-- Alternative Address -->
        <div
          class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer"
          @click="selectAddress('2')"
        >
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="fas fa-briefcase text-black opacity-40 text-xl"></i>
            </div>
            <div class="flex-1">
              <span class="text-black font-bold">Office</span>
              <p class="text-black opacity-70 text-sm mt-1">
                456 Madison Ave, New York, NY 10022
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="mb-5">
        <h3 class="text-black font-bold mb-3">Payment Method</h3>

        <div class="space-y-3">
          <!-- Visa Card -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary-500 cursor-pointer"
            @click="selectPayment('visa')"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fab fa-cc-visa text-primary-500 text-2xl"></i>
              </div>
              <div class="flex-1">
                <p class="text-black font-bold">Visa Card</p>
                <p class="text-black opacity-60 text-sm">**** **** **** 4532</p>
              </div>
              <i class="fas fa-check-circle text-primary-500 text-xl"></i>
            </div>
          </div>

          <!-- Mastercard -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer"
            @click="selectPayment('mastercard')"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fab fa-cc-mastercard text-black opacity-40 text-2xl"></i>
              </div>
              <div class="flex-1">
                <p class="text-black font-bold">Mastercard</p>
                <p class="text-black opacity-60 text-sm">**** **** **** 8921</p>
              </div>
            </div>
          </div>

          <!-- Cash on Delivery -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer"
            @click="selectPayment('cash')"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-wallet text-black opacity-40 text-2xl"></i>
              </div>
              <div class="flex-1">
                <p class="text-black font-bold">Cash on Delivery</p>
                <p class="text-black opacity-60 text-sm">Pay when you receive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Instructions -->
      <div class="mb-5">
        <h3 class="text-black font-bold mb-3">Delivery Instructions</h3>
        <div class="bg-white rounded-2xl p-4 shadow-sm">
          <textarea
            v-model="deliveryInstructions"
            placeholder="Add any special instructions..."
            class="w-full bg-transparent text-black placeholder-gray-400 focus:outline-none text-sm resize-none"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Place Order Button -->
    <div class="px-6 py-4 bg-white border-t border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <span class="text-black opacity-70">Total Payment</span>
        <span class="text-black font-bold text-2xl">${{ totalPayment.toFixed(2) }}</span>
      </div>
      <button
        @click="placeOrder"
        class="w-full bg-gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg"
      >
        Place Order
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
