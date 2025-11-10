<!--
  PaymentMethodCard Component
  Payment method selection cards with various types
  Supports: Credit Card, Debit Card, PayPal, Apple Pay, Google Pay, Cash
  Features: selection, default badge, card logos, expiry display
-->

<template>
  <button
    type="button"
    @click="handleSelect"
    :disabled="disabled"
    :class="[
      'payment-method-card group relative w-full text-left transition-all duration-200',
      'bg-white dark:bg-gray-800 rounded-2xl border-2 p-4',
      selected
        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
      disabled && 'opacity-50 cursor-not-allowed',
      !disabled && 'hover:shadow-md cursor-pointer'
    ]"
  >
    <div class="flex items-start gap-4">
      <!-- Payment Icon/Logo -->
      <div
        :class="[
          'flex-shrink-0 flex items-center justify-center rounded-xl transition-colors',
          'w-14 h-14',
          selected
            ? 'bg-primary-100 dark:bg-primary-900/30'
            : 'bg-gray-100 dark:bg-gray-700'
        ]"
      >
        <!-- Card Icons -->
        <component
          v-if="methodIcon"
          :is="methodIcon"
          :class="[
            'w-8 h-8',
            selected
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          ]"
        />

        <!-- Default Card Icon -->
        <svg
          v-else-if="method.type === 'card'"
          :class="[
            'w-8 h-8',
            selected
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>

        <!-- Wallet Icon -->
        <svg
          v-else-if="method.type === 'wallet'"
          :class="[
            'w-8 h-8',
            selected
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>

        <!-- Cash Icon -->
        <svg
          v-else
          :class="[
            'w-8 h-8',
            selected
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      </div>

      <!-- Payment Details -->
      <div class="flex-1 min-w-0">
        <!-- Title & Default Badge -->
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-base font-bold text-gray-900 dark:text-white truncate">
            {{ method.name }}
          </h3>
          <BaseBadge
            v-if="method.isDefault"
            label="Default"
            variant="primary"
            size="xs"
          />
        </div>

        <!-- Card Number / Details -->
        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
          {{ formatDetails() }}
        </p>

        <!-- Expiry / Additional Info -->
        <p
          v-if="method.expiry || method.email"
          class="text-xs text-gray-500 dark:text-gray-500 mt-1"
        >
          {{ method.expiry ? `Expires ${method.expiry}` : method.email }}
        </p>
      </div>

      <!-- Selection Indicator -->
      <div class="flex-shrink-0">
        <div
          :class="[
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            selected
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300 dark:border-gray-600'
          ]"
        >
          <svg
            v-if="selected"
            class="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Card Brand Logo (for cards) -->
    <div
      v-if="method.type === 'card' && method.brand"
      class="absolute top-4 right-4"
    >
      <img
        v-if="method.brandLogo"
        :src="method.brandLogo"
        :alt="method.brand"
        class="h-6 object-contain"
      />
      <span v-else class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        {{ method.brand }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

export interface PaymentMethod {
  id: string | number
  type: 'card' | 'wallet' | 'cash' | 'bank'
  name: string
  brand?: string // visa, mastercard, amex, etc.
  brandLogo?: string
  last4?: string // Last 4 digits of card
  expiry?: string // MM/YY
  email?: string // For PayPal, etc.
  isDefault?: boolean
  icon?: any
  [key: string]: any
}

export interface PaymentMethodCardProps {
  method: PaymentMethod
  selected?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<PaymentMethodCardProps>(), {
  selected: false,
  disabled: false
})

const emit = defineEmits<{
  select: [method: PaymentMethod]
}>()

// Computed
const methodIcon = computed(() => {
  return props.method.icon
})

// Methods
const formatDetails = () => {
  const { method } = props

  if (method.type === 'card' && method.last4) {
    return `•••• •••• •••• ${method.last4}`
  } else if (method.type === 'wallet' && method.email) {
    return method.email
  } else if (method.type === 'cash') {
    return 'Pay with cash on delivery'
  } else if (method.type === 'bank') {
    return method.last4 ? `Account ending in ${method.last4}` : 'Bank transfer'
  }

  return ''
}

const handleSelect = () => {
  if (!props.disabled) {
    emit('select', props.method)
  }
}
</script>

<style scoped>
.payment-method-card {
  -webkit-tap-highlight-color: transparent;
}
</style>
