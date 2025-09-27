<!--
  Checkout and order confirmation page for customer app
  Displays order summary, payment options, and handles order submission
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            @click="$router.go(-1)"
            :disabled="isSubmitting"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="text-xl text-gray-600" />
          </button>

          <h1 class="text-xl font-bold text-gray-900">Confirmation</h1>

          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 pb-32">
      <!-- Order summary -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Résumé de votre commande</h2>

        <!-- Customer info -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <div class="flex items-center space-x-3 mb-3">
            <FontAwesomeIcon :icon="['fas', 'user']" class="text-primary-600" />
            <div>
              <p class="font-medium text-gray-900">{{ customerInfo.name }}</p>
              <p v-if="customerInfo.phone" class="text-sm text-gray-600">{{ customerInfo.phone }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3 mb-3">
            <FontAwesomeIcon :icon="getOrderTypeIcon(customerInfo.orderType)" class="text-primary-600" />
            <div>
              <p class="font-medium text-gray-900">{{ getOrderTypeLabel(customerInfo.orderType) }}</p>
              <p v-if="customerInfo.tableNumber" class="text-sm text-gray-600">Table {{ customerInfo.tableNumber }}</p>
            </div>
          </div>

          <div v-if="customerInfo.notes" class="flex items-start space-x-3">
            <FontAwesomeIcon :icon="['fas', 'sticky-note']" class="text-amber-600 mt-1" />
            <div>
              <p class="font-medium text-gray-900">Notes spéciales</p>
              <p class="text-sm text-gray-600">{{ customerInfo.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Order items -->
        <div class="space-y-3 mb-4">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div
              v-else
              class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-primary-400" />
            </div>

            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-gray-600">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
              <p v-if="item.notes" class="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded mt-1">
                {{ item.notes }}
              </p>
            </div>

            <div class="text-right">
              <p class="font-semibold text-primary-600">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>

        <!-- Pricing breakdown -->
        <div class="border-t pt-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Sous-total</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">TVA ({{ (taxRate * 100).toFixed(0) }}%)</span>
            <span>{{ formatPrice(tax) }}</span>
          </div>
          <div v-if="discount > 0" class="flex justify-between text-green-600">
            <span>Remise</span>
            <span>-{{ formatPrice(discount) }}</span>
          </div>
          <div class="border-t pt-2">
            <div class="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span class="text-primary-600">{{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment method -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h3>

        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="method in paymentMethods"
            :key="method.value"
            @click="selectedPaymentMethod = method.value"
            :class="[
              'p-4 rounded-xl border-2 transition-all duration-200 text-left',
              selectedPaymentMethod === method.value
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon :icon="method.icon" class="text-2xl" :class="method.color" />
              <div>
                <p class="font-medium text-gray-900">{{ method.label }}</p>
                <p class="text-sm text-gray-600">{{ method.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Estimated time -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div class="flex items-center space-x-3">
          <FontAwesomeIcon :icon="['fas', 'clock']" class="text-2xl text-primary-600" />
          <div>
            <h3 class="font-semibold text-gray-900">Temps de préparation</h3>
            <p class="text-gray-600">Environ {{ estimatedTime }} minutes</p>
          </div>
        </div>
      </div>

      <!-- Terms and conditions -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div class="flex space-x-3">
          <FontAwesomeIcon :icon="['fas', 'info-circle']" class="text-amber-600 mt-1" />
          <div class="text-sm text-amber-800">
            <p class="font-medium mb-2">Conditions importantes :</p>
            <ul class="space-y-1 list-disc list-inside">
              <li>Le paiement se fait à la réception de la commande</li>
              <li>Vous recevrez une notification quand votre commande sera prête</li>
              <li>Les commandes peuvent être annulées dans les 5 minutes suivant la confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed confirmation button -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
      <button
        @click="confirmOrder"
        :disabled="!canConfirm || isSubmitting"
        class="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-floating"
      >
        <FontAwesomeIcon
          v-if="isSubmitting"
          :icon="['fas', 'spinner']"
          class="animate-spin mr-3"
        />
        <span v-else>
          <FontAwesomeIcon :icon="['fas', 'check']" class="mr-3" />
        </span>
        {{ isSubmitting ? 'Envoi en cours...' : 'Confirmer la commande' }}
      </button>
    </div>

    <!-- Success modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon :icon="['fas', 'check']" class="text-3xl text-green-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h3>
          <p class="text-gray-600 mb-4">
            Votre commande #{{ orderNumber }} a été envoyée en cuisine.
          </p>
          <div class="bg-gray-50 rounded-xl p-4 mb-4">
            <p class="text-sm text-gray-600 mb-1">Temps estimé</p>
            <p class="text-xl font-semibold text-primary-600">{{ estimatedTime }} minutes</p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="trackOrder"
            class="w-full bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Suivre ma commande
          </button>
          <button
            @click="goHome"
            class="w-full bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Retour à l'accueil
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
import { ordersApi } from '@/services/api'
import { storeToRefs } from 'pinia'
import { OrderType, PaymentMethod } from '@/types'

const router = useRouter()
const toast = useToast()

// Stores
const cartStore = useCartStore()
const appStore = useAppStore()

// Destructure store state
const {
  items,
  subtotal,
  tax,
  discount,
  total,
  customerInfo
} = storeToRefs(cartStore)

const { appConfig } = storeToRefs(appStore)

// Local state
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const selectedPaymentMethod = ref<PaymentMethod>(PaymentMethod.CASH)
const orderNumber = ref('')

// Computed
const taxRate = computed(() => appConfig.value.taxRate)

const estimatedTime = computed(() => {
  // Calculate estimated time based on items and order type
  const baseTime = items.value.length * 3 // 3 minutes per item
  const orderTypeMultiplier = customerInfo.value.orderType === OrderType.DINE_IN ? 1.2 : 1
  return Math.max(10, Math.round(baseTime * orderTypeMultiplier))
})

const paymentMethods = computed(() => [
  {
    value: PaymentMethod.CASH,
    label: 'Espèces',
    description: 'Paiement en liquide à la réception',
    icon: ['fas', 'money-bill-wave'],
    color: 'text-green-600'
  },
  {
    value: PaymentMethod.CARD,
    label: 'Carte bancaire',
    description: 'Paiement par carte à la réception',
    icon: ['fas', 'credit-card'],
    color: 'text-blue-600'
  },
  {
    value: PaymentMethod.MOBILE,
    label: 'Mobile Money',
    description: 'Orange Money, MTN Money, etc.',
    icon: ['fas', 'mobile-alt'],
    color: 'text-orange-600'
  }
])

const canConfirm = computed(() => {
  return (
    items.value.length > 0 &&
    customerInfo.value.name.trim() !== '' &&
    selectedPaymentMethod.value !== null
  )
})

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const getOrderTypeLabel = (orderType: OrderType): string => {
  const labels = {
    [OrderType.DINE_IN]: 'Sur place',
    [OrderType.TAKEAWAY]: 'À emporter',
    [OrderType.DELIVERY]: 'Livraison'
  }
  return labels[orderType] || orderType
}

const getOrderTypeIcon = (orderType: OrderType): string[] => {
  const icons = {
    [OrderType.DINE_IN]: ['fas', 'utensils'],
    [OrderType.TAKEAWAY]: ['fas', 'shopping-bag'],
    [OrderType.DELIVERY]: ['fas', 'motorcycle']
  }
  return icons[orderType] || ['fas', 'utensils']
}

const confirmOrder = async () => {
  if (!canConfirm.value) return

  isSubmitting.value = true

  try {
    // Prepare order data
    const orderData = {
      customerName: customerInfo.value.name,
      customerPhone: customerInfo.value.phone,
      tableNumber: customerInfo.value.tableNumber,
      orderType: customerInfo.value.orderType,
      orderItems: items.value.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes
      })),
      notes: customerInfo.value.notes,
      paymentMethod: selectedPaymentMethod.value,
      estimatedTime: estimatedTime.value
    }

    // Submit order
    const response = await ordersApi.createOrder(orderData)

    if (response.success && response.data?.order) {
      orderNumber.value = response.data.order.orderNumber
      showSuccessModal.value = true

      // Clear cart after successful order
      cartStore.clearCart()

      // Show success notification
      toast.success(`Commande #${orderNumber.value} confirmée !`)
    } else {
      throw new Error(response.error || 'Erreur lors de la création de la commande')
    }
  } catch (error: any) {
    console.error('Order submission error:', error)
    toast.error(error.message || 'Erreur lors de la confirmation de la commande')
  } finally {
    isSubmitting.value = false
  }
}

const trackOrder = () => {
  showSuccessModal.value = false
  router.push(`/order-status/${orderNumber.value}`)
}

const goHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

// Lifecycle
onMounted(() => {
  // Set page title
  document.title = 'Confirmation - Garbaking'

  // Redirect if cart is empty
  if (items.value.length === 0) {
    router.push('/cart')
    return
  }

  // Validate customer info
  if (!customerInfo.value.name.trim()) {
    toast.error('Informations client manquantes')
    router.push('/cart')
    return
  }
})
</script>

<style scoped>
/* Scale animation for modal */
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
  animation: scale-in 0.3s ease-out;
}
</style>