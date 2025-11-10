<!--
  CartSummaryScreen: Review order and proceed to payment
  Professional component library with improved UX and accessibility
-->
<template>
  <div class="cart-screen h-screen w-screen flex flex-col bg-brand-50">
    <!-- Professional Header -->
    <KioskHeader
      :title="t('cart.title')"
      :show-back-button="true"
      @back="continueShopping"
      :gradient="true"
    />

    <!-- Professional Empty Cart State -->
    <EmptyState
      v-if="cartStore.items.length === 0"
      icon="cart"
      :title="t('cart.empty')"
      description="Votre panier est vide. Ajoutez des articles pour commencer votre commande."
      :show-action="true"
      :action-label="t('cart.continueShopping')"
      @action="continueShopping"
      variant="neutral"
    />

    <!-- Cart Items -->
    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Items List -->
      <div class="flex-1 overflow-y-auto p-8">
        <div class="space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-white rounded-3xl p-6 shadow-lg flex gap-6 border border-transparent hover:border-brand-200 transition-all duration-200"
          >
            <!-- Item Image -->
            <div class="w-32 h-32 bg-brand-100 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                v-if="item.menuItem.imageUrl"
                :src="item.menuItem.imageUrl"
                :alt="item.menuItem.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <!-- Item Details -->
            <div class="flex-1">
              <h3 class="text-2xl font-brand font-semibold text-neutral-900 mb-2">{{ item.menuItem.name }}</h3>

              <!-- Customizations -->
              <div v-if="item.customizations.length > 0" class="mb-3 space-y-1">
                <div v-for="custom in item.customizations" :key="custom.optionId" class="text-sm text-neutral-600 flex items-center gap-2">
                  <span>• {{ custom.customizationName }}: {{ custom.optionName }}</span>
                  <PriceDisplay
                    v-if="custom.priceModifier !== 0"
                    :price="custom.priceModifier"
                    size="sm"
                    color="primary"
                    :show-currency="true"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div v-if="item.notes" class="text-sm text-neutral-500 italic mb-3">
                Note: {{ item.notes }}
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-3">
                <button
                  @click="decrementQuantity(item.id)"
                  class="w-12 h-12 rounded-full bg-neutral-200 hover:bg-neutral-300 text-2xl font-semibold text-neutral-700 transition-colors"
                >
                  −
                </button>
                <div class="text-2xl font-brand font-semibold text-neutral-900 w-12 text-center">{{ item.quantity }}</div>
                <button
                  @click="incrementQuantity(item.id)"
                  class="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-2xl font-semibold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Price and Remove -->
            <div class="flex flex-col items-end justify-between">
              <button
                @click="removeItem(item.id)"
                class="text-error-500 hover:text-error-600 p-2 transition-colors"
                :aria-label="`Supprimer ${item.menuItem.name}`"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              <PriceDisplay :price="item.subtotal" size="xl" color="primary" />
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Order Summary Sidebar -->
      <div class="w-[420px] bg-white rounded-3xl shadow-2xl p-8 flex flex-col">
        <h2 class="text-3xl font-brand font-semibold mb-8 text-neutral-900">Résumé de la commande</h2>

        <div class="flex-1 space-y-4 mb-8">
          <div class="flex justify-between items-center text-lg text-neutral-600">
            <span>{{ t('cart.subtotal') }}</span>
            <PriceDisplay :price="cartStore.subtotal" size="lg" color="default" />
          </div>
          <div class="flex justify-between items-center text-lg text-neutral-600">
            <span>{{ t('cart.tax') }}</span>
            <PriceDisplay :price="cartStore.tax" size="lg" color="default" />
          </div>
          <div class="border-t border-neutral-200 pt-4 flex justify-between items-center">
            <span class="text-2xl font-brand font-semibold text-neutral-900">{{ t('cart.total') }}</span>
            <PriceDisplay :price="cartStore.total" size="xl" color="primary" />
          </div>
        </div>

        <KioskButton
          variant="primary"
          size="xl"
          full-width
          @click="proceedToPayment"
        >
          {{ t('cart.checkout') }}
        </KioskButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import KioskHeader from '@/components/layout/KioskHeader.vue'
import PriceDisplay from '@/components/ui/PriceDisplay.vue'
import KioskButton from '@/components/KioskButton.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'

const router = useRouter()
const { t } = useI18n({ inheritLocale: true, useScope: 'global' })
const cartStore = useCartStore()

const continueShopping = () => {
  router.push('/menu')
}

const proceedToPayment = () => {
  router.push('/payment')
}

const incrementQuantity = (itemId: string) => {
  const item = cartStore.getItem(itemId)
  if (item) {
    cartStore.updateItemQuantity(itemId, item.quantity + 1)
  }
}

const decrementQuantity = (itemId: string) => {
  const item = cartStore.getItem(itemId)
  if (item) {
    cartStore.updateItemQuantity(itemId, item.quantity - 1)
  }
}

const removeItem = (itemId: string) => {
  cartStore.removeItem(itemId)
}
</script>
