<!--
  Order status component for real-time order tracking
  Displays current order status with visual progress indicators
-->

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 border border-gray-100">
    <!-- Order header - responsive -->
    <div class="text-center mb-4 sm:mb-6">
      <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {{ $t('order') }} #{{ order.localOrderId || order.clientOrderId.slice(-8) }}
      </h3>
      <p class="text-gray-600">
        {{ order.customer.name }} • {{ formatDate(order.createdAt) }}
      </p>
    </div>

    <!-- Status progress -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{{ $t('status.queued') }}</span>
            <span>{{ $t('order_accepted') }}</span>
            <span>{{ $t('order_preparing') }}</span>
            <span>{{ $t('order_ready') }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
              :style="{ width: statusProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Current status display -->
      <div class="text-center">
        <div
          class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
          :class="getStatusColor(order.status)"
        >
          <div
            v-if="order.status === 'preparing'"
            class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
          ></div>
          <svg
            v-else-if="order.status === 'ready'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else-if="order.status === 'accepted'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          {{ getStatusText(order.status) }}
        </div>

        <!-- Sync status -->
        <div v-if="!order.synced" class="mt-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {{ $t('notifications.pending_sync') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Order items -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 mb-3">{{ $t('order_items') }}</h4>
      <div class="space-y-2">
        <div
          v-for="item in order.items"
          :key="item.sku"
          class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-600">{{ formatPrice(item.price) }}</p>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-900">×{{ item.qty }}</p>
            <p class="text-sm text-gray-600">{{ formatPrice(item.price * item.qty) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order total -->
    <div class="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
      <span class="text-lg font-bold text-gray-900">{{ $t('total') }}</span>
      <span class="text-xl font-bold text-orange-600">{{ formatPrice(order.total) }}</span>
    </div>

    <!-- Estimated time (for preparing orders) -->
    <div v-if="order.status === 'preparing'" class="bg-blue-50 rounded-xl p-4 mb-4">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-blue-800 font-medium">{{ $t('estimated_time') }}: {{ estimatedTime }}</p>
      </div>
    </div>

    <!-- Ready notification -->
    <div v-if="order.status === 'ready'" class="bg-green-50 rounded-xl p-4 mb-4">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-green-800 font-medium">{{ $t('order_ready_pickup') }}</p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex space-x-3">
      <button
        @click="$emit('close')"
        class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
      >
        {{ $t('buttons.close') }}
      </button>
      <button
        v-if="order.status === 'ready'"
        @click="$emit('mark-collected', order.localOrderId!)"
        class="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
      >
        {{ $t('mark_collected') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Order } from '@/services/mockApi'

// Composables
const { t } = useI18n()

// Props
interface Props {
  order: Order
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'mark-collected': [orderId: string]
}>()

// Computed
const statusProgress = computed(() => {
  switch (props.order.status) {
    case 'queued':
      return 10
    case 'accepted':
      return 30
    case 'preparing':
      return 60
    case 'ready':
      return 100
    default:
      return 0
  }
})

const estimatedTime = computed(() => {
  // Simple estimated time based on number of items
  const baseTime = 8 // base 8 minutes
  const itemTime = props.order.items.reduce((total, item) => total + item.qty, 0) * 2
  return `${baseTime + itemTime} ${t('minutes')}`
})

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'queued':
      return 'bg-gray-100 text-gray-800'
    case 'accepted':
      return 'bg-blue-100 text-blue-800'
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800'
    case 'ready':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: Order['status']): string => {
  switch (status) {
    case 'queued':
      return t('status.queued')
    case 'accepted':
      return t('order_accepted')
    case 'preparing':
      return t('order_preparing')
    case 'ready':
      return t('order_ready')
    default:
      return status
  }
}
</script>

<style scoped>
/* Progress bar animation */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}

/* Loading spinner for preparing status */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Card styling */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>