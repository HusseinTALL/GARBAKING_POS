<!--
  PaymentMethodSelector.vue
  Payment method selection with saved cards and payment options
  Features: credit/debit cards, mobile money, cash on delivery
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 class="font-semibold text-gray-900">Payment Method</h3>
      </div>
    </div>

    <!-- Payment Methods List -->
    <div class="space-y-3">
      <!-- Credit/Debit Cards -->
      <div v-if="savedCards.length > 0">
        <label
          v-for="card in savedCards"
          :key="card.id"
          class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all mb-3"
          :class="[
            selectedMethod?.id === card.id
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <input
            type="radio"
            name="payment"
            :value="card.id"
            v-model="selectedPaymentId"
            class="w-5 h-5 text-orange-500 focus:ring-orange-500"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <component :is="getCardIcon(card.brand)" class="h-6" />
              <span class="font-semibold text-gray-900">
                •••• {{ card.last4 }}
              </span>
              <span v-if="card.isDefault" class="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                Default
              </span>
            </div>
            <p class="text-sm text-gray-600">Expires {{ card.expiryMonth }}/{{ card.expiryYear }}</p>
          </div>
          <div v-if="selectedMethod?.id === card.id" class="flex-shrink-0">
            <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
      </div>

      <!-- Add New Card -->
      <button
        @click="showCardForm = true"
        class="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
      >
        <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-gray-600 group-hover:text-orange-600 font-medium">Add Credit/Debit Card</span>
      </button>

      <!-- Mobile Money -->
      <label
        class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedMethod?.type === 'mobile'
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          name="payment"
          value="mobile"
          v-model="selectedPaymentId"
          class="w-5 h-5 text-orange-500 focus:ring-orange-500"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="font-semibold text-gray-900">Mobile Money</span>
          </div>
          <p class="text-sm text-gray-600">Pay with Orange Money, MTN, Moov</p>
        </div>
        <div v-if="selectedMethod?.type === 'mobile'" class="flex-shrink-0">
          <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </label>

      <!-- Cash on Delivery -->
      <label
        class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedMethod?.type === 'cash'
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          name="payment"
          value="cash"
          v-model="selectedPaymentId"
          class="w-5 h-5 text-orange-500 focus:ring-orange-500"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-semibold text-gray-900">Cash on Delivery</span>
          </div>
          <p class="text-sm text-gray-600">Pay with cash when delivered</p>
        </div>
        <div v-if="selectedMethod?.type === 'cash'" class="flex-shrink-0">
          <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </label>
    </div>

    <!-- Add Card Form Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showCardForm"
          class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          @click="showCardForm = false"
        >
          <div
            @click.stop
            class="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Add Card</h3>
              <button
                @click="showCardForm = false"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Card Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <input
                  v-model="cardForm.number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  @input="formatCardNumber"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <!-- Cardholder Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                <input
                  v-model="cardForm.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                />
              </div>

              <!-- Expiry and CVV -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    v-model="cardForm.expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    @input="formatExpiry"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                  <input
                    v-model="cardForm.cvv"
                    type="text"
                    placeholder="123"
                    maxlength="3"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Save Card Checkbox -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="cardForm.save"
                  type="checkbox"
                  class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span class="text-sm text-gray-700">Save card for future use</span>
              </label>

              <!-- Set as Default -->
              <label v-if="cardForm.save" class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="cardForm.isDefault"
                  type="checkbox"
                  class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span class="text-sm text-gray-700">Set as default payment method</span>
              </label>

              <!-- Error Message -->
              <p v-if="cardError" class="text-sm text-red-600">
                {{ cardError }}
              </p>

              <!-- Submit Button -->
              <button
                @click="saveCard"
                :disabled="!isCardFormValid"
                class="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'

// Types
interface SavedCard {
  id: string
  type: 'card'
  brand: 'visa' | 'mastercard' | 'amex'
  last4: string
  expiryMonth: string
  expiryYear: string
  cardholderName: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: 'card' | 'mobile' | 'cash'
  card?: SavedCard
}

// Emits
const emit = defineEmits<{
  (e: 'select', method: PaymentMethod): void
}>()

// State
const selectedPaymentId = ref<string>('cash')
const showCardForm = ref(false)
const cardError = ref('')

const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvv: '',
  save: true,
  isDefault: false
})

// Load saved cards from localStorage
const savedCards = ref<SavedCard[]>([])

const loadCards = () => {
  const stored = localStorage.getItem('payment_cards')
  if (stored) {
    savedCards.value = JSON.parse(stored)
  }
}

// Computed
const selectedMethod = computed((): PaymentMethod | null => {
  if (selectedPaymentId.value === 'mobile') {
    return { id: 'mobile', type: 'mobile' }
  } else if (selectedPaymentId.value === 'cash') {
    return { id: 'cash', type: 'cash' }
  } else {
    const card = savedCards.value.find(c => c.id === selectedPaymentId.value)
    if (card) {
      return { id: card.id, type: 'card', card }
    }
  }
  return null
})

const isCardFormValid = computed(() => {
  return (
    cardForm.value.number.replace(/\s/g, '').length >= 13 &&
    cardForm.value.name.trim() !== '' &&
    cardForm.value.expiry.length === 5 &&
    cardForm.value.cvv.length === 3
  )
})

// Methods
const getCardIcon = (brand: string) => {
  if (brand === 'visa') {
    return h('svg', {
      class: 'h-6',
      viewBox: '0 0 48 32',
      fill: 'none'
    }, [
      h('rect', { width: '48', height: '32', rx: '4', fill: '#1434CB' }),
      h('text', {
        x: '24',
        y: '20',
        'text-anchor': 'middle',
        fill: 'white',
        'font-size': '14',
        'font-weight': 'bold'
      }, 'VISA')
    ])
  } else if (brand === 'mastercard') {
    return h('svg', {
      class: 'h-6',
      viewBox: '0 0 48 32',
      fill: 'none'
    }, [
      h('rect', { width: '48', height: '32', rx: '4', fill: '#EB001B' }),
      h('circle', { cx: '19', cy: '16', r: '9', fill: '#FF5F00' }),
      h('circle', { cx: '29', cy: '16', r: '9', fill: '#F79E1B' })
    ])
  }
  return h('svg', {
    class: 'h-6',
    viewBox: '0 0 48 32',
    fill: 'none'
  }, [
    h('rect', { width: '48', height: '32', rx: '4', fill: '#006FCF' })
  ])
}

const formatCardNumber = () => {
  let value = cardForm.value.number.replace(/\s/g, '')
  value = value.replace(/\D/g, '')
  value = value.substring(0, 16)
  cardForm.value.number = value.replace(/(\d{4})/g, '$1 ').trim()
}

const formatExpiry = () => {
  let value = cardForm.value.expiry.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardForm.value.expiry = value
}

const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'amex' => {
  const cleanNumber = number.replace(/\s/g, '')
  if (cleanNumber.startsWith('4')) return 'visa'
  if (cleanNumber.startsWith('5')) return 'mastercard'
  if (cleanNumber.startsWith('3')) return 'amex'
  return 'visa'
}

const saveCard = () => {
  if (!isCardFormValid.value) {
    cardError.value = 'Please fill in all card details'
    return
  }

  cardError.value = ''

  const cleanNumber = cardForm.value.number.replace(/\s/g, '')
  const [month, year] = cardForm.value.expiry.split('/')

  const newCard: SavedCard = {
    id: Date.now().toString(),
    type: 'card',
    brand: detectCardBrand(cleanNumber),
    last4: cleanNumber.slice(-4),
    expiryMonth: month,
    expiryYear: year,
    cardholderName: cardForm.value.name.toUpperCase(),
    isDefault: cardForm.value.isDefault
  }

  if (cardForm.value.save) {
    // If setting as default, unset other defaults
    if (newCard.isDefault) {
      savedCards.value.forEach(card => {
        card.isDefault = false
      })
    }

    savedCards.value.push(newCard)
    localStorage.setItem('payment_cards', JSON.stringify(savedCards.value))
  }

  // Select the new card
  selectedPaymentId.value = newCard.id

  // Reset form
  cardForm.value = {
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    save: true,
    isDefault: false
  }

  showCardForm.value = false
}

// Watch selected payment method
watch(selectedMethod, (newMethod) => {
  if (newMethod) {
    emit('select', newMethod)
  }
}, { immediate: true })

// Initialize
loadCards()
</script>
