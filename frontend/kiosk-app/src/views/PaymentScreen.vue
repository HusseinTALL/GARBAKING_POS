<!--
  PaymentScreen: Select payment method and process payment
  Supports card, mobile money, QR code, and cash payment options
-->
<template>
  <div class="payment-screen h-screen w-screen flex flex-col bg-brand-50">
    <KioskHeader
      :title="t('payment.title')"
      @back="goBack"
    />

    <!-- Processing State -->
    <div v-if="orderStore.processing" class="flex-1 flex flex-col items-center justify-center gap-6">
      <div class="animate-spin rounded-full h-28 w-28 border-8 border-brand-400 border-t-transparent"></div>
      <h2 class="text-3xl font-brand font-semibold text-neutral-900">{{ t('payment.processing') }}</h2>
    </div>

    <!-- Payment Selection -->
    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Payment Methods -->
      <div class="flex-1 overflow-y-auto p-12">
        <div class="max-w-4xl mx-auto grid grid-cols-2 gap-8">
          <!-- Card Payment -->
          <button
            v-if="settingsStore.settings.enableCardPayment"
            @click="selectPaymentMethod('card')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-5',
              selectedMethod === 'card'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-28 h-28 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('payment.card') }}</div>
          </button>

          <!-- Mobile Money -->
          <button
            v-if="settingsStore.settings.enableMobileMoneyPayment"
            @click="selectPaymentMethod('mobile-money')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-5',
              selectedMethod === 'mobile-money'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-28 h-28 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('payment.mobileMoney') }}</div>
          </button>

          <!-- QR Code -->
          <button
            v-if="settingsStore.settings.enableQRPayment"
            @click="selectPaymentMethod('qr-code')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-5',
              selectedMethod === 'qr-code'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-28 h-28 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('payment.qrCode') }}</div>
          </button>

          <!-- Cash at Counter -->
          <button
            v-if="settingsStore.settings.enableCashPayment"
            @click="selectPaymentMethod('cash')"
            :class="[
              'p-12 rounded-3xl border-2 transition-all duration-200 bg-white shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 flex flex-col items-center gap-5',
              selectedMethod === 'cash'
                ? 'border-brand-500 shadow-2xl scale-[1.03]'
                : 'border-transparent hover:border-brand-300 hover:shadow-lg'
            ]"
          >
            <svg class="w-28 h-28 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <div class="text-3xl font-brand font-semibold text-neutral-900">{{ t('payment.cash') }}</div>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="orderStore.error" class="mt-8 max-w-4xl mx-auto">
          <div class="bg-error-50 border border-error-200 rounded-2xl p-6 text-center">
            <p class="text-lg font-semibold text-error-600">{{ orderStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Order Summary Sidebar -->
      <div class="w-[420px] bg-white rounded-3xl shadow-2xl p-8 flex flex-col">
        <h2 class="text-3xl font-brand font-semibold text-neutral-900 mb-8">Order Summary</h2>

        <div class="flex-1 space-y-4 mb-8">
          <div class="flex justify-between text-lg text-neutral-600">
            <span>Items</span>
            <span class="font-semibold text-neutral-900">{{ cartStore.itemCount }}</span>
          </div>
          <div class="flex justify-between text-lg text-neutral-600">
            <span>Subtotal</span>
            <span class="font-semibold text-neutral-900">${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg text-neutral-600">
            <span>Tax</span>
            <span class="font-semibold text-neutral-900">${{ cartStore.tax.toFixed(2) }}</span>
          </div>
          <div class="border-t border-neutral-200 pt-4 flex justify-between items-center">
            <span class="text-2xl font-brand font-semibold text-neutral-900">Total</span>
            <span class="text-3xl font-brand font-semibold text-brand-600">${{ cartStore.total.toFixed(2) }}</span>
          </div>
        </div>

        <KioskButton
          size="xl"
          variant="primary"
          :disabled="!selectedMethod"
          @click="processPayment"
          class="w-full"
        >
          {{ t('common.confirm') }}
        </KioskButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useSettingsStore } from '@/stores/settings'
import KioskHeader from '@/components/layout/KioskHeader.vue'
import KioskButton from '@/components/KioskButton.vue'
import type { PaymentMethod } from '@/types'

const router = useRouter()
const { t } = useI18n({ inheritLocale: true, useScope: 'global' })
const cartStore = useCartStore()
const orderStore = useOrderStore()
const settingsStore = useSettingsStore()

const selectedMethod = ref<PaymentMethod | null>(null)

const selectPaymentMethod = (method: PaymentMethod) => {
  selectedMethod.value = method
}

const processPayment = async () => {
  if (!selectedMethod.value) return

  // Create order
  const order = await orderStore.createOrder(selectedMethod.value)

  if (!order) {
    return // Error already set in store
  }

  // Process payment
  const success = await orderStore.processPayment(
    order.id,
    selectedMethod.value,
    cartStore.total
  )

  if (success) {
    // Clear cart and go to confirmation
    cartStore.clearCart()
    router.push('/confirmation')
  }
}

const goBack = () => {
  router.push('/cart')
}
</script>
