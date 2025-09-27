<!--
  Payment Processing view for Garbaking POS
  Handles payment methods, processing, and receipt generation
-->
<template>
  <div class="payment-container h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="payment-header bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="pos-button-secondary px-3 py-2"
          >
            <ArrowLeft class="w-5 h-5 mr-1" />
            Back to POS
          </button>
          <div class="flex items-center space-x-2">
            <CreditCard class="w-8 h-8 text-green-600" />
            <h1 class="text-xl font-bold text-gray-900">Payment Processing</h1>
          </div>
          <div class="text-sm text-gray-500">
            Order #{{ order?.number }}
          </div>
        </div>

        <div class="text-lg font-bold text-gray-900">
          Total: ${{ order?.total.toFixed(2) }}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="payment-content flex-1 flex overflow-hidden">
      <!-- Order Summary -->
      <div class="order-summary w-96 bg-white border-r border-gray-200 flex flex-col">
        <div class="summary-header bg-gray-50 border-b border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900">Order Summary</h2>
        </div>

        <div class="summary-items flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div
              v-for="item in order?.items"
              :key="`${item.id}-${item.cartIndex}`"
              class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                <p class="text-sm text-gray-600">
                  ${{ item.price.toFixed(2) }} × {{ item.quantity }}
                </p>
              </div>
              <div class="font-semibold text-gray-900">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="summary-totals bg-gray-50 border-t border-gray-200 p-4">
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>${{ order?.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tax:</span>
              <span>${{ order?.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
              <span>Total:</span>
              <span>${{ order?.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="payment-methods flex-1 bg-gray-50 flex flex-col">
        <div class="methods-header bg-white border-b border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Select Payment Method</h2>
          <p class="text-gray-600">Choose how the customer wants to pay</p>
        </div>

        <div class="methods-content flex-1 p-6">
          <div class="grid grid-cols-2 gap-6 max-w-4xl">
            <!-- Cash Payment -->
            <div
              @click="selectPaymentMethod('cash')"
              :class="[
                'payment-method-card p-6 bg-white rounded-xl border-2 cursor-pointer transition-all',
                selectedMethod === 'cash'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign class="w-8 h-8 text-green-600" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Cash</h3>
                <p class="text-sm text-gray-600">Accept cash payment from customer</p>
              </div>
            </div>

            <!-- Card Payment -->
            <div
              @click="selectPaymentMethod('card')"
              :class="[
                'payment-method-card p-6 bg-white rounded-xl border-2 cursor-pointer transition-all',
                selectedMethod === 'card'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard class="w-8 h-8 text-blue-600" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Card</h3>
                <p class="text-sm text-gray-600">Credit/Debit card payment</p>
              </div>
            </div>
          </div>

          <!-- Cash Payment Details -->
          <div v-if="selectedMethod === 'cash'" class="mt-8 max-w-md bg-white rounded-xl p-6 border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Cash Payment Details</h4>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    v-model.number="amountReceived"
                    type="number"
                    step="0.01"
                    class="pos-input pl-10"
                    :placeholder="order?.total.toFixed(2)"
                    @input="calculateChange"
                  />
                </div>
              </div>

              <div v-if="change >= 0" class="p-4 bg-green-50 rounded-lg">
                <div class="text-sm text-green-700 mb-1">Change Due:</div>
                <div class="text-2xl font-bold text-green-800">${{ change.toFixed(2) }}</div>
              </div>

              <div v-else-if="amountReceived > 0" class="p-4 bg-red-50 rounded-lg">
                <div class="text-sm text-red-700 mb-1">Insufficient Payment:</div>
                <div class="text-lg font-bold text-red-800">
                  Still need: ${{ Math.abs(change).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Card Payment Details -->
          <div v-if="selectedMethod === 'card'" class="mt-8 max-w-md bg-white rounded-xl p-6 border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Card Payment</h4>

            <div class="space-y-4">
              <div class="text-center p-6 bg-blue-50 rounded-lg">
                <CreditCard class="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <p class="text-blue-800 font-medium">Insert or tap customer's card</p>
                <p class="text-sm text-blue-600 mt-2">Amount: ${{ order?.total.toFixed(2) }}</p>
              </div>

              <div v-if="processingCard" class="text-center p-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p class="text-sm text-gray-600">Processing payment...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="methods-footer bg-white border-t border-gray-200 p-6">
          <div class="flex space-x-4 max-w-md">
            <button
              @click="processPayment"
              :disabled="!canProcessPayment"
              class="pos-button flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="w-5 h-5 mr-2" />
              Complete Payment
            </button>

            <button
              @click="goBack"
              class="pos-button-secondary px-6 py-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Check class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p class="text-gray-600 mb-6">Order #{{ order?.number }} has been completed</p>

          <div v-if="selectedMethod === 'cash' && change > 0" class="mb-6 p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-green-700">Change Due:</p>
            <p class="text-2xl font-bold text-green-800">${{ change.toFixed(2) }}</p>
          </div>

          <div class="flex space-x-4">
            <button
              @click="printReceipt"
              class="pos-button-secondary flex-1"
            >
              <Printer class="w-4 h-4 mr-2" />
              Print Receipt
            </button>
            <button
              @click="newOrder"
              class="pos-button flex-1"
            >
              <Plus class="w-4 h-4 mr-2" />
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, CreditCard, DollarSign, Check, Printer, Plus
} from 'lucide-vue-next'

// Types
interface OrderData {
  number: string
  items: any[]
  subtotal: number
  tax: number
  total: number
}

// Router
const router = useRouter()
const route = useRoute()

// Reactive state
const order = ref<OrderData | null>(null)
const selectedMethod = ref<'cash' | 'card' | null>(null)
const amountReceived = ref(0)
const change = ref(0)
const processingCard = ref(false)
const showSuccess = ref(false)

// Computed
const canProcessPayment = computed(() => {
  if (selectedMethod.value === 'cash') {
    return amountReceived.value >= (order.value?.total || 0)
  } else if (selectedMethod.value === 'card') {
    return true
  }
  return false
})

// Methods
function selectPaymentMethod(method: 'cash' | 'card') {
  selectedMethod.value = method
  if (method === 'cash') {
    amountReceived.value = order.value?.total || 0
    calculateChange()
  }
}

function calculateChange() {
  if (order.value) {
    change.value = amountReceived.value - order.value.total
  }
}

async function processPayment() {
  if (!canProcessPayment.value || !order.value) return

  if (selectedMethod.value === 'card') {
    processingCard.value = true
    // Simulate card processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    processingCard.value = false
  }

  // Show success modal
  showSuccess.value = true

  // Clear the order from localStorage
  localStorage.removeItem('current_order')
}

function printReceipt() {
  // Implementation for printing receipt
  console.log('Printing receipt for order:', order.value?.number)
}

function newOrder() {
  showSuccess.value = false
  router.push('/')
}

function goBack() {
  router.push('/')
}

// Load order data
onMounted(() => {
  const orderData = localStorage.getItem('current_order')
  if (orderData) {
    order.value = JSON.parse(orderData)
  } else {
    // If no order data, redirect back to POS
    router.push('/')
  }
})
</script>