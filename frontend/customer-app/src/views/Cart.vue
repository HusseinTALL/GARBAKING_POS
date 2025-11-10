<!--
  Shopping Cart - Enhanced
  Cart view with EmptyState, BaseChip for order type, BaseButton for checkout
  Features: empty state, order type selection, price breakdown, checkout CTA
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
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

          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Panier</h1>
            <BaseBadge
              v-if="totalItems > 0"
              :label="totalItems.toString()"
              variant="primary"
              size="sm"
              rounded
            />
          </div>

          <button
            v-if="items.length > 0"
            @click="showClearConfirm = true"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-6 h-6 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <div v-else class="w-10"></div>
        </div>
      </div>
    </div>

    <!-- Empty cart state with EmptyState component -->
    <EmptyState
      v-if="items.length === 0"
      type="cart"
      title="Votre panier est vide"
      description="Découvrez notre délicieux menu et ajoutez vos plats préférés à votre panier."
      actionText="Découvrir le Menu"
      @action="$router.push('/')"
      size="lg"
      padding="xl"
    />

    <!-- Cart content -->
    <div v-else class="pb-32">
      <!-- Cart items -->
      <div class="px-4 py-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Vos commandes</h2>

        <div class="space-y-3">
          <CartItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            @update-quantity="updateQuantity"
            @remove-item="removeItem"
            @add-notes="addNotes"
          />
        </div>
      </div>

      <!-- Order summary -->
      <div class="px-4 py-4 bg-white mx-4 rounded-2xl shadow-sm mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>

        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Sous-total</span>
            <span class="font-medium">{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">TVA ({{ (taxRate * 100).toFixed(0) }}%)</span>
            <span class="font-medium">{{ formatPrice(tax) }}</span>
          </div>
          <div v-if="discount > 0" class="flex justify-between text-green-600">
            <span>Remise</span>
            <span class="font-medium">-{{ formatPrice(discount) }}</span>
          </div>
          <div class="border-t pt-3">
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span class="text-primary-600">{{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer info form -->
      <div class="px-4 py-4 bg-white mx-4 rounded-2xl shadow-sm mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              v-model="customerInfo.name"
              type="text"
              placeholder="Votre nom"
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              v-model="customerInfo.phone"
              type="tel"
              placeholder="+225 XX XX XX XX XX"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de commande *
            </label>
            <div class="flex flex-wrap gap-2">
              <BaseChip
                v-for="type in orderTypes"
                :key="type.value"
                :label="`${type.emoji} ${type.label}`"
                :selected="customerInfo.orderType === type.value"
                @click="customerInfo.orderType = type.value"
                variant="primary"
                size="lg"
              />
            </div>
          </div>

          <div v-if="customerInfo.orderType === 'DINE_IN'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Numéro de table
            </label>
            <input
              v-model="customerInfo.tableNumber"
              type="text"
              placeholder="Ex: 12"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes spéciales
            </label>
            <textarea
              v-model="customerInfo.notes"
              placeholder="Allergies, préférences, instructions spéciales..."
              rows="3"
              class="input-field resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating checkout button -->
    <div
      v-if="items.length > 0"
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 safe-area-bottom"
    >
      <BaseButton
        @click="proceedToCheckout"
        :disabled="!canCheckout || isLoading"
        :loading="isLoading"
        variant="primary"
        size="lg"
        class="w-full"
      >
        {{ isLoading ? 'Traitement...' : `Commander • ${formatPrice(total)}` }}
      </BaseButton>
    </div>

    <!-- Clear cart confirmation modal -->
    <BaseModal
      v-model="showClearConfirm"
      title="Vider le panier ?"
      size="sm"
    >
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          Cette action supprimera tous les articles de votre panier.
        </p>
      </div>

      <template #footer>
        <div class="flex space-x-3">
          <BaseButton
            @click="showClearConfirm = false"
            variant="outline"
            size="md"
            class="flex-1"
          >
            Annuler
          </BaseButton>
          <BaseButton
            @click="confirmClearCart"
            variant="secondary"
            size="md"
            class="flex-1 !bg-error-500 !text-white hover:!bg-error-600"
          >
            Vider
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import CartItemCard from '@/components/CartItemCard.vue'
import { OrderType } from '@/types'
import { formatCurrency } from '@/utils/currency'

// Advanced Components
import EmptyState from '@/components/advanced/EmptyState.vue'

// Base Components
import BaseChip from '@/components/base/BaseChip.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const router = useRouter()
const toast = useToast()

// Stores
const cartStore = useCartStore()
const appStore = useAppStore()

// Destructure store state
const {
  items,
  itemCount,
  subtotal,
  tax,
  discount,
  total,
  customerInfo
} = storeToRefs(cartStore)

const totalItems = computed(() => itemCount.value)

const { appConfig } = storeToRefs(appStore)

// Local state
const isLoading = ref(false)
const showClearConfirm = ref(false)

// Computed
const taxRate = computed(() => appConfig.value.taxRate)

const orderTypes = computed(() => [
  {
    value: OrderType.DINE_IN,
    label: 'Sur place',
    emoji: '🍽️',
    icon: ['fas', 'utensils']
  },
  {
    value: OrderType.TAKEAWAY,
    label: 'À emporter',
    emoji: '🛍️',
    icon: ['fas', 'shopping-bag']
  },
  {
    value: OrderType.DELIVERY,
    label: 'Livraison',
    emoji: '🏍️',
    icon: ['fas', 'motorcycle']
  }
])

const canCheckout = computed(() => {
  return (
    items.value.length > 0 &&
    customerInfo.value.name.trim() !== '' &&
    customerInfo.value.orderType !== null &&
    (customerInfo.value.orderType !== OrderType.DINE_IN || customerInfo.value.tableNumber?.trim())
  )
})

// Methods
const formatPrice = (amount: number): string => {
  return formatCurrency(amount)
}

const updateQuantity = (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    cartStore.removeItem(itemId)
  } else {
    cartStore.updateQuantity(itemId, quantity)
  }
}

const removeItem = (itemId: string) => {
  cartStore.removeItem(itemId)
  toast.info('Article retiré du panier')
}

const addNotes = (itemId: string, notes: string) => {
  cartStore.updateItemNotes(itemId, notes)
}

const confirmClearCart = () => {
  cartStore.clearCart()
  showClearConfirm.value = false
  toast.info('Panier vidé')
}

const proceedToCheckout = async () => {
  if (!canCheckout.value) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  isLoading.value = true

  try {
    // Navigate to checkout/confirmation page
    await router.push('/checkout')
  } catch (error) {
    toast.error('Erreur lors du passage à la commande')
    console.error('Checkout error:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Set page title
  document.title = `Panier (${totalItems.value}) - Garbaking`

  // Restore cart from storage
  cartStore.loadCart()
})
</script>

<style scoped>
/* Input field styles */
.input-field {
  @apply w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200;
}

/* Scale animation */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
