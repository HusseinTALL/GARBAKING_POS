<!--
  GARBAKING POS Invoice/Order Summary - Dark Theme Design System
  Professional invoice panel following comprehensive design system specifications
-->

<template>
  <div
    class="bg-background-card border-gray-200 flex flex-col h-full min-h-0 shadow-sm"
    :class="isMobile ? 'w-full' : 'w-96 border-l'"
  >
    <!-- Header -->
    <div class="flex-none p-4 md:p-6 border-b border-gray-200">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-text">Invoice</h2>
        <div class="flex items-center space-x-2">
          <!-- Mobile close button -->
          <button
            v-if="isMobile"
            @click="$emit('close')"
            class="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors mr-3"
          >
            <X class="text-text" />
          </button>
          <!-- Desktop window controls -->
          <div v-else class="flex space-x-2">
            <div class="w-4 h-4 bg-secondary-500 rounded-full shadow-lg shadow-secondary-500/30"></div>
            <div class="w-4 h-4 bg-warning-500 rounded-full shadow-lg shadow-warning-500/30"></div>
            <div class="w-4 h-4 bg-success-500 rounded-full shadow-lg shadow-success-500/30"></div>
          </div>
        </div>
      </div>

      <!-- Mobile drag handle -->
      <div v-if="isMobile" class="flex justify-center mb-4">
        <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
      <div v-if="cartStore.isEmpty" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center border border-gray-200">
          <ShoppingCart class="text-text-light text-2xl" />
        </div>
        <p class="text-text-light text-lg font-medium">No items selected</p>
        <p class="text-text-lighter text-sm mt-2">Add items to your order to see them here</p>
      </div>

      <div v-else class="space-y-5">
        <div
          v-for="item in orderItems"
          :key="item.id"
          class="flex items-center space-x-4 pb-5 border-b border-gray-200 last:border-0 hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors duration-200 group"
        >
          <!-- Item Image -->
          <div class="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200">
            <img
              v-if="item.menuItem.imageUrl"
              :src="item.menuItem.imageUrl"
              :alt="item.menuItem.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <component :is="getFoodIcon(item.menuItem.name)" class="text-primary-500 text-lg" />
            </div>
          </div>

          <!-- Item Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-text text-lg truncate">{{ item.menuItem.name }}</h4>
              <button
                @click="removeItem(item.id)"
                class="opacity-0 group-hover:opacity-100 text-secondary-500 hover:text-secondary-600 transition-opacity p-1"
                title="Remove item"
              >
                <X class="text-sm" />
              </button>
            </div>
            <p class="text-text-light text-sm mt-1">${{ item.menuItem.price.toFixed(2) }} each</p>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center space-x-2">
                <button
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  class="w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors"
                >
                  <Minus class="text-xs text-text" />
                </button>
                <span class="text-text text-sm font-medium w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.id, item.quantity + 1)"
                  class="w-6 h-6 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Plus class="text-xs text-white" />
                </button>
              </div>
              <p class="font-bold text-text text-xl">${{ (item.menuItem.price * item.quantity).toFixed(2) }}</p>
            </div>
            <div v-if="item.specialInstructions" class="text-text-light text-xs mt-1 italic">
              Note: {{ item.specialInstructions }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Section -->
    <div v-if="!cartStore.isEmpty" class="flex-none p-3 md:p-4 border-t border-gray-200 bg-background">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-text text-lg">Customer</h3>
        <button
          @click="showLoyaltyModal = true"
          :disabled="isCustomerLoading || cartStore.isLoadingLoyalty"
          class="text-primary-500 hover:text-primary-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <Loader2 v-if="isCustomerLoading || cartStore.isLoadingLoyalty" class="w-3 h-3 animate-spin" />
          <span>{{ cartStore.selectedCustomer ? 'Change' : 'Add Customer' }}</span>
        </button>
      </div>

      <!-- Selected Customer -->
      <div v-if="cartStore.selectedCustomer" class="mb-4 p-3 bg-background-card rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-text font-medium">
              {{ cartStore.selectedCustomer.firstName }} {{ cartStore.selectedCustomer.lastName }}
            </div>
            <div class="text-text-light text-sm">
              {{ cartStore.selectedCustomer.email || cartStore.selectedCustomer.phone }}
            </div>
          </div>
          <div v-if="cartStore.customerLoyaltyProfile" class="text-right">
            <div class="text-primary-500 font-medium">
              {{ cartStore.customerLoyaltyProfile.customer.loyaltyPoints }} pts
            </div>
            <div class="text-text-light text-xs">
              {{ cartStore.customerLoyaltyProfile.customer.tier?.name || 'Member' }}
            </div>
          </div>
        </div>

        <!-- Apply Loyalty Discount Button -->
        <button
          v-if="cartStore.customerLoyaltyProfile && cartStore.customerLoyaltyProfile.customer.loyaltyPoints >= 100"
          @click="showRedemptionModal = true"
          :disabled="isRedemptionLoading"
          class="w-full mt-3 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
        >
          <Loader2 v-if="isRedemptionLoading" class="w-3 h-3 animate-spin" />
          <span>{{ isRedemptionLoading ? 'Processing...' : 'Redeem Points' }}</span>
        </button>
      </div>

      <!-- Guest Customer -->
      <div v-else class="mb-4 p-3 bg-background-card rounded-lg border border-gray-200 shadow-sm text-center">
        <div class="text-text-light text-sm">Guest Customer</div>
        <div class="text-text-lighter text-xs mt-1">Add customer to earn loyalty points</div>
      </div>

      <!-- Loyalty Error Display -->
      <div v-if="cartStore.loyaltyError" class="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-error-500 rounded-full flex items-center justify-center">
            <X class="w-2 h-2 text-white" />
          </div>
          <div class="text-error-700 text-sm">{{ cartStore.loyaltyError }}</div>
        </div>
      </div>
    </div>

    <!-- Payment Summary -->
    <div v-if="!cartStore.isEmpty" class="flex-none p-3 md:p-4 border-t border-gray-200 bg-background">
      <h3 class="font-semibold text-text text-lg mb-3">Payment Summary</h3>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-text-light">Sub Total</span>
          <span class="text-text font-medium">${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-text-light">Tax (10%)</span>
          <span class="text-text font-medium">${{ tax.toFixed(2) }}</span>
        </div>

        <!-- Applied Discounts -->
        <div v-if="cartStore.appliedDiscounts.length > 0" class="space-y-1">
          <div
            v-for="discount in cartStore.appliedDiscounts"
            :key="discount.id"
            class="flex justify-between items-center text-success-500"
          >
            <div class="flex items-center">
              <span>{{ discount.description }}</span>
              <button
                @click="cartStore.removeDiscount(discount.id)"
                class="ml-2 text-secondary-500 hover:text-secondary-600"
                title="Remove discount"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
            <span>-${{ discount.amount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2 border-t border-gray-300">
          <span class="text-text font-semibold">Total Payment</span>
          <span class="text-text font-bold text-lg">${{ cartStore.finalTotal.toFixed(2) }}</span>
        </div>

        <!-- Loyalty Points to Earn -->
        <div v-if="cartStore.selectedCustomer && cartStore.loyaltyPointsToEarn > 0" class="text-center pt-2 border-t border-gray-300">
          <div class="text-primary-500 text-sm">
            Will earn {{ cartStore.loyaltyPointsToEarn }} loyalty points
          </div>
        </div>
      </div>

      <!-- Payment Button -->
      <button
        @click="$emit('checkout')"
        :disabled="cartStore.isEmpty || isProcessing"
        class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mt-4 shadow-lg hover:shadow-xl hover:shadow-primary-500/25"
      >
        <Loader2 v-if="isProcessing" class="text-sm animate-spin" />
        <CreditCard v-else class="text-sm" />
        <span class="text-sm">{{ isProcessing ? 'Processing...' : 'Checkout' }}</span>
      </button>

      <!-- Payment Method Selection -->
      <div class="grid grid-cols-3 gap-1.5 mt-3">
        <button
          @click="updatePaymentMethod('cash')"
          :class="{
            'bg-primary-500 text-white': selectedPaymentMethod === 'cash',
            'bg-gray-100 hover:bg-gray-200 text-text': selectedPaymentMethod !== 'cash'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <Banknote class="text-xs" />
          <span>Cash</span>
        </button>
        <button
          @click="updatePaymentMethod('card')"
          :class="{
            'bg-primary-500 text-white': selectedPaymentMethod === 'card',
            'bg-gray-100 hover:bg-gray-200 text-text': selectedPaymentMethod !== 'card'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <CreditCard class="text-xs" />
          <span>Card</span>
        </button>
        <button
          @click="updatePaymentMethod('mobile')"
          :class="{
            'bg-primary-500 text-white': selectedPaymentMethod === 'mobile',
            'bg-gray-100 hover:bg-gray-200 text-text': selectedPaymentMethod !== 'mobile'
          }"
          class="font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs"
        >
          <Smartphone class="text-xs" />
          <span>Mobile</span>
        </button>
      </div>
    </div>

    <!-- Customer Selection Modal -->
    <CustomerSelectionModal
      :is-open="showLoyaltyModal"
      @close="showLoyaltyModal = false"
      @customer-selected="handleCustomerSelected"
    />

    <!-- Points Redemption Modal -->
    <PointsRedemptionModal
      :is-open="showRedemptionModal"
      :customer-profile="cartStore.customerLoyaltyProfile"
      :order-id="cartStore.currentOrder?.id"
      :min-points-redeem="100"
      :dollar-per-point="0.01"
      @close="showRedemptionModal = false"
      @redeem="handlePointsRedemption"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { Customer } from '@/stores/cart'
import type { RedemptionRequest } from '@/services/loyalty'
import CustomerSelectionModal from './loyalty/CustomerSelectionModal.vue'
import PointsRedemptionModal from './loyalty/PointsRedemptionModal.vue'
import { useToast } from 'vue-toastification'
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
  checkout: []
}>()

// Cart store
const cartStore = useCartStore()

// Toast for notifications
const toast = useToast()

// Real-time cart data from store
const orderItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const tax = computed(() => cartStore.tax)
const isProcessing = computed(() => cartStore.isProcessingPayment)

// Local state for payment method selection
const selectedPaymentMethod = ref<'cash' | 'card' | 'mobile'>('card')

// Loyalty modal states
const showLoyaltyModal = ref(false)
const showRedemptionModal = ref(false)

// Loading states
const isCustomerLoading = ref(false)
const isRedemptionLoading = ref(false)

// Methods
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

// Loyalty-related methods
const handleCustomerSelected = async (customer: Customer | null) => {
  isCustomerLoading.value = true
  try {
    if (customer) {
      await cartStore.setCustomer(customer)
      toast.success(`Customer ${customer.firstName} ${customer.lastName} selected`)
    } else {
      cartStore.clearCustomer()
      toast.info('Customer removed from order')
    }
    showLoyaltyModal.value = false
  } catch (error) {
    console.error('Failed to set customer:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to set customer')
  } finally {
    isCustomerLoading.value = false
  }
}

const handlePointsRedemption = async (redemption: RedemptionRequest & { applyToOrder: boolean }) => {
  isRedemptionLoading.value = true
  try {
    await cartStore.applyLoyaltyDiscount(redemption)
    showRedemptionModal.value = false
    toast.success(`${redemption.pointsToRedeem} points redeemed successfully!`)
  } catch (error) {
    console.error('Failed to apply loyalty discount:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to apply loyalty discount')
  } finally {
    isRedemptionLoading.value = false
  }
}
</script>

<style scoped>
/* Custom scrollbar for order items - Warm theme */
.overflow-y-auto {
  scroll-behavior: smooth;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #F5F4F1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #CECCC3;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #ADB5BD;
}
</style>
