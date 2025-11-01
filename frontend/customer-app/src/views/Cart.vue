<!--
  Shopping cart page for customer app
  Displays cart items, order summary, customer info form, and checkout functionality
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="$router.go(-1)"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="text-xl text-gray-600" />
          </button>

          <div class="flex items-center space-x-2">
            <FontAwesomeIcon :icon="['fas', 'shopping-cart']" class="text-xl text-gray-600" />
            <h1 class="text-xl font-bold text-gray-900">Panier</h1>
            <span v-if="totalItems > 0" class="bg-primary-600 text-white text-sm font-bold px-2 py-1 rounded-full">
              {{ totalItems }}
            </span>
          </div>

          <button
            v-if="items.length > 0"
            @click="showClearConfirm = true"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'trash']" class="text-xl text-red-500" />
          </button>
          <div v-else class="w-10"></div>
        </div>
      </div>
    </div>

    <!-- Empty cart state -->
    <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-20 px-6">
      <div class="text-center">
        <FontAwesomeIcon :icon="['fas', 'shopping-cart']" class="text-6xl text-gray-300 mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
        <p class="text-gray-600 mb-8 max-w-sm">
          Découvrez notre délicieux menu et ajoutez vos plats préférés à votre panier.
        </p>
        <button
          @click="$router.push('/')"
          class="bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <FontAwesomeIcon :icon="['fas', 'utensils']" class="mr-2" />
          Découvrir le Menu
        </button>
      </div>
    </div>

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
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type de commande *
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in orderTypes"
                :key="type.value"
                @click="customerInfo.orderType = type.value"
                :class="[
                  'p-3 rounded-xl border-2 transition-all duration-200 text-center',
                  customerInfo.orderType === type.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <FontAwesomeIcon :icon="type.icon" class="text-lg mb-1 block" />
                <span class="text-sm font-medium">{{ type.label }}</span>
              </button>
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
      class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom"
    >
      <button
        @click="proceedToCheckout"
        :disabled="!canCheckout || isLoading"
        class="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-floating"
      >
        <FontAwesomeIcon
          v-if="isLoading"
          :icon="['fas', 'spinner']"
          class="animate-spin mr-3"
        />
        <span v-else>
          <FontAwesomeIcon :icon="['fas', 'credit-card']" class="mr-3" />
        </span>
        {{ isLoading ? 'Traitement...' : `Commander • ${formatPrice(total)}` }}
      </button>
    </div>

    <!-- Clear cart confirmation -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showClearConfirm = false"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        @click.stop
      >
        <div class="text-center mb-6">
          <FontAwesomeIcon :icon="['fas', 'trash']" class="text-4xl text-red-500 mb-4" />
          <h3 class="text-lg font-bold text-gray-900 mb-2">Vider le panier ?</h3>
          <p class="text-gray-600">
            Cette action supprimera tous les articles de votre panier.
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="showClearConfirm = false"
            class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="confirmClearCart"
            class="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
          >
            Vider
          </button>
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
import { storeToRefs } from 'pinia'
import CartItemCard from '@/components/CartItemCard.vue'
import { OrderType } from '@/types'
import { formatCurrency } from '@/utils/currency'

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
    icon: ['fas', 'utensils']
  },
  {
    value: OrderType.TAKEAWAY,
    label: 'À emporter',
    icon: ['fas', 'shopping-bag']
  },
  {
    value: OrderType.DELIVERY,
    label: 'Livraison',
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
