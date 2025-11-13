<!--
  Checkout View - Complete checkout flow
  Features: delivery address, payment method, promo codes, delivery time, order summary
  Integrates: AddressSelector, PaymentMethodSelector, PromoCodeInput, DeliveryOptions, OrderSummary
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
    <!-- Header -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="$router.go(-1)"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Checkout</h1>

          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-4 space-y-4">
      <!-- Progress Indicator -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div
            v-for="(step, index) in checkoutSteps"
            :key="step.id"
            class="flex items-center"
            :class="index < checkoutSteps.length - 1 ? 'flex-1' : ''"
          >
            <div class="flex flex-col items-center">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                :class="[
                  currentStepIndex >= index
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                ]"
              >
                <svg
                  v-if="currentStepIndex > index"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span
                class="text-xs mt-1 font-medium text-center"
                :class="currentStepIndex >= index ? 'text-orange-600' : 'text-gray-500'"
              >
                {{ step.label }}
              </span>
            </div>

            <!-- Connection Line -->
            <div
              v-if="index < checkoutSteps.length - 1"
              class="flex-1 h-0.5 mx-2 transition-all"
              :class="currentStepIndex > index ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step 1: Delivery Address -->
      <div v-if="currentStep === 'address'">
        <AddressSelector
          :initialAddress="selectedAddress"
          @select="handleAddressSelect"
        />
        <div class="mt-4">
          <BaseButton
            @click="proceedToNextStep"
            :disabled="!selectedAddress"
            variant="primary"
            size="lg"
            class="w-full"
          >
            Continue to Delivery Time
          </BaseButton>
        </div>
      </div>

      <!-- Step 2: Delivery Time -->
      <div v-if="currentStep === 'delivery'">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedAddress?.street }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ selectedAddress?.city }}, {{ selectedAddress?.zipCode }}</p>
              </div>
            </div>
            <button
              @click="currentStep = 'address'"
              class="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Change
            </button>
          </div>
        </div>

        <DeliveryOptions
          :estimatedDeliveryMinutes="30"
          @update="handleDeliveryTimeUpdate"
        />

        <div class="mt-4 flex gap-3">
          <BaseButton
            @click="currentStep = 'address'"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </BaseButton>
          <BaseButton
            @click="proceedToNextStep"
            :disabled="!deliveryTime"
            variant="primary"
            size="lg"
            class="flex-1"
          >
            Continue to Payment
          </BaseButton>
        </div>
      </div>

      <!-- Step 3: Payment Method -->
      <div v-if="currentStep === 'payment'">
        <div class="space-y-3 mb-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600 dark:text-gray-400">Delivering to:</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ selectedAddress?.street }}</span>
              </div>
              <button
                @click="currentStep = 'address'"
                class="text-orange-500 hover:text-orange-600"
              >
                Edit
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600 dark:text-gray-400">Delivery:</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ deliveryTime?.type === 'asap' ? 'ASAP (30-40 min)' : `Scheduled for ${deliveryTime?.time}` }}
                </span>
              </div>
              <button
                @click="currentStep = 'delivery'"
                class="text-orange-500 hover:text-orange-600"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <PaymentMethodSelector @select="handlePaymentSelect" />

        <div class="mt-4">
          <PromoCodeInput
            :cartTotal="cartStore.subtotal"
            @apply="handlePromoApply"
            @remove="handlePromoRemove"
          />
        </div>

        <div class="mt-4 flex gap-3">
          <BaseButton
            @click="currentStep = 'delivery'"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </BaseButton>
          <BaseButton
            @click="proceedToNextStep"
            :disabled="!paymentMethod"
            variant="primary"
            size="lg"
            class="flex-1"
          >
            Review Order
          </BaseButton>
        </div>
      </div>

      <!-- Step 4: Review & Confirm -->
      <div v-if="currentStep === 'review'" class="space-y-4">
        <OrderSummary
          :items="cartStore.items"
          :subtotal="cartStore.subtotal"
          :tax="cartStore.tax"
          :taxRate="appStore.appConfig.taxRate"
          :discount="cartStore.discount"
          :deliveryFee="deliveryFee"
          :total="cartStore.total + deliveryFee"
          :promoCode="appliedPromoCode"
          :estimatedDeliveryTime="estimatedDeliveryTime"
          :deliveryAddress="selectedAddress"
          :paymentMethod="paymentMethod"
          :deliveryInfo="deliveryInfo"
        />

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              v-model="agreedToTerms"
              type="checkbox"
              class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 mt-0.5"
            />
            <div class="flex-1 text-sm">
              <span class="text-gray-700 dark:text-gray-300">
                I agree to the
                <a href="#" class="text-orange-500 hover:text-orange-600 font-medium">Terms & Conditions</a>
                and
                <a href="#" class="text-orange-500 hover:text-orange-600 font-medium">Privacy Policy</a>
              </span>
            </div>
          </label>
        </div>

        <div class="flex gap-3">
          <BaseButton
            @click="currentStep = 'payment'"
            variant="outline"
            size="lg"
            class="flex-1"
          >
            Back
          </BaseButton>
          <BaseButton
            @click="placeOrder"
            :disabled="!agreedToTerms || isPlacingOrder"
            :loading="isPlacingOrder"
            variant="primary"
            size="lg"
            class="flex-1"
          >
            {{ isPlacingOrder ? 'Processing...' : `Place Order • ${formatPrice(cartStore.total + deliveryFee)}` }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { useOrderStore } from '@/stores/order'
import { formatCurrency } from '@/utils/currency'

// Components
import AddressSelector from '@/components/AddressSelector.vue'
import PaymentMethodSelector from '@/components/PaymentMethodSelector.vue'
import PromoCodeInput from '@/components/PromoCodeInput.vue'
import DeliveryOptions from '@/components/DeliveryOptions.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const toast = useToast()

// Stores
const cartStore = useCartStore()
const appStore = useAppStore()
const orderStore = useOrderStore()

// State
const currentStep = ref<'address' | 'delivery' | 'payment' | 'review'>('address')
const selectedAddress = ref<any>(null)
const deliveryTime = ref<any>(null)
const paymentMethod = ref<any>(null)
const appliedPromoCode = ref<string>('')
const agreedToTerms = ref(false)
const isPlacingOrder = ref(false)

// Checkout steps
const checkoutSteps = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' }
]

// Computed
const currentStepIndex = computed(() => {
  return checkoutSteps.findIndex(step => step.id === currentStep.value)
})

const deliveryFee = computed(() => {
  if (cartStore.subtotal >= 30) return 0
  return 5.00
})

const deliveryInfo = computed(() => {
  if (cartStore.subtotal >= 30) {
    return 'Free delivery on orders above $30!'
  }
  return `Add ${formatPrice(30 - cartStore.subtotal)} more for free delivery`
})

const estimatedDeliveryTime = computed(() => {
  if (deliveryTime.value?.type === 'asap') {
    return '30-40 minutes'
  } else if (deliveryTime.value?.type === 'scheduled') {
    return `${deliveryTime.value.date} at ${deliveryTime.value.time}`
  }
  return ''
})

// Methods
const formatPrice = (amount: number): string => {
  return formatCurrency(amount)
}

const handleAddressSelect = (address: any) => {
  selectedAddress.value = address
}

const handleDeliveryTimeUpdate = (time: any) => {
  deliveryTime.value = time
}

const handlePaymentSelect = (method: any) => {
  paymentMethod.value = method
}

const handlePromoApply = (promo: any) => {
  cartStore.applyDiscount(promo.discount)
  appliedPromoCode.value = promo.code
  toast.success(`Promo code "${promo.code}" applied!`)
}

const handlePromoRemove = () => {
  cartStore.applyDiscount(0)
  appliedPromoCode.value = ''
  toast.info('Promo code removed')
}

const proceedToNextStep = () => {
  const stepMap: Record<string, 'address' | 'delivery' | 'payment' | 'review'> = {
    address: 'delivery',
    delivery: 'payment',
    payment: 'review'
  }

  const nextStep = stepMap[currentStep.value]
  if (nextStep) {
    currentStep.value = nextStep
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const placeOrder = async () => {
  if (!agreedToTerms.value) {
    toast.error('Please agree to the terms and conditions')
    return
  }

  if (!selectedAddress.value || !deliveryTime.value || !paymentMethod.value) {
    toast.error('Please complete all checkout steps')
    return
  }

  isPlacingOrder.value = true

  try {
    const orderData = {
      items: cartStore.items,
      subtotal: cartStore.subtotal,
      tax: cartStore.tax,
      discount: cartStore.discount,
      deliveryFee: deliveryFee.value,
      total: cartStore.total + deliveryFee.value,
      customerInfo: cartStore.customerInfo,
      deliveryAddress: selectedAddress.value,
      paymentMethod: {
        type: paymentMethod.value.type,
        last4: paymentMethod.value.card?.last4
      },
      deliveryTime: deliveryTime.value,
      promoCode: appliedPromoCode.value
    }

    const order = await orderStore.createOrder(orderData)
    cartStore.clearCart()
    await router.push(`/order-confirmation/${order.id}`)
    toast.success('Order placed successfully!')
  } catch (error) {
    console.error('Failed to place order:', error)
    toast.error('Failed to place order. Please try again.')
  } finally {
    isPlacingOrder.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (cartStore.items.length === 0) {
    toast.info('Your cart is empty')
    router.push('/cart')
    return
  }

  document.title = 'Checkout - Garbaking'
})
</script>
