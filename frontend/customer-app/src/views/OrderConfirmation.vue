<!--
  Order Confirmation View - Customer App
  Displays successful order confirmation with order details and estimated delivery time
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <!-- Success Icon -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Commande confirmée!</h1>
        <p class="text-gray-600">Merci pour votre commande</p>
      </div>

      <!-- Order Details -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 class="font-semibold text-gray-900 mb-2">Détails de la commande</h2>
        <p class="text-sm text-gray-600 mb-1">
          <span class="font-medium">Numéro:</span> {{ orderNumber }}
        </p>
        <p class="text-sm text-gray-600 mb-1">
          <span class="font-medium">Temps estimé:</span> 15-20 min
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">Total:</span> {{ formatPrice(orderTotal) }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="goToOrderStatus"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Suivre ma commande
        </button>
        <button
          @click="goToMenu"
          class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Continuer les achats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/currency'

// Props
const props = defineProps<{
  orderNumber: string
}>()

// Router
const router = useRouter()

// Reactive data
const orderTotal = ref(0)

// Methods
const formatPrice = (price: number): string => formatCurrency(price)

const goToOrderStatus = (): void => {
  router.push(`/order-status/${props.orderNumber}`)
}

const goToMenu = (): void => {
  router.push('/menu')
}

// Load order data on mount
onMounted(() => {
  // In a real app, this would fetch order details from the API
  orderTotal.value = 8500 // Mock data
})
</script>
