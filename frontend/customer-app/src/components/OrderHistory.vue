<!--
  Order history component displaying past orders with status and details
  Shows order items, totals, and real-time status updates
-->

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('order_history') }}</h2>
      <button
        @click="refreshHistory"
        :aria-label="$t('buttons.refresh')"
        class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        :disabled="isLoading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :class="{ 'animate-spin': isLoading }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && orders.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p class="text-gray-600">{{ $t('loading') }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!isLoading && orders.length === 0" class="text-center py-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 text-gray-300 mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('no_orders') }}</h3>
      <p class="text-gray-600">{{ $t('no_orders_description') }}</p>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.localOrderId || order.clientOrderId"
        class="bg-white rounded-2xl shadow-card p-4 border border-gray-100"
      >
        <!-- Order header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-bold text-lg text-gray-900">
              #{{ order.localOrderId || order.clientOrderId.slice(-8) }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ formatDate(order.createdAt) }}
            </p>
            <p class="text-sm text-gray-600">
              {{ order.customer.name }}
            </p>
          </div>

          <!-- Status badge -->
          <div class="text-right">
            <span
              class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatusColor(order.status)"
            >
              {{ getStatusText(order.status) }}
            </span>
            <div v-if="!order.synced" class="mt-1">
              <span class="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {{ $t('notifications.pending_sync') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order items -->
        <div class="space-y-2 mb-4">
          <div
            v-for="item in order.items"
            :key="item.sku"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ item.name }}</p>
              <p class="text-sm text-gray-600">
                {{ formatPrice(item.price) }} × {{ item.qty }}
              </p>
            </div>
            <p class="font-medium text-gray-900">
              {{ formatPrice(item.price * item.qty) }}
            </p>
          </div>
        </div>

        <!-- Order total -->
        <div class="flex justify-between items-center pt-3 border-t border-gray-200">
          <span class="text-lg font-bold text-gray-900">{{ $t('total') }}</span>
          <span class="text-xl font-bold text-orange-600">{{ formatPrice(order.total) }}</span>
        </div>

        <!-- Order actions -->
        <div class="mt-4 flex space-x-2">
          <button
            v-if="order.status === 'ready'"
            @click="markAsCollected(order.localOrderId!)"
            class="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
          >
            {{ $t('mark_collected') }}
          </button>
          <button
            v-if="!order.synced"
            @click="retrySyncOrder(order.localOrderId!)"
            :disabled="isRetrying"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm"
          >
            {{ isRetrying ? $t('syncing') : $t('retry_sync') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Order } from '@/services/mockApi'

// Composables
const { t } = useI18n()

// Props
interface Props {
  orders: Order[]
  isLoading: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'refresh': []
  'retry-sync': [orderId: string]
  'mark-collected': [orderId: string]
}>()

// Local state
const isRetrying = ref(false)

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return t('time.just_now')
  } else if (diffMins < 60) {
    return t('time.minutes_ago', { count: diffMins })
  } else if (diffHours < 24) {
    return t('time.hours_ago', { count: diffHours })
  } else if (diffDays === 1) {
    return t('time.yesterday')
  } else if (diffDays < 7) {
    return t('time.days_ago', { count: diffDays })
  } else {
    return date.toLocaleDateString()
  }
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
    case 'synced':
      return 'bg-purple-100 text-purple-800'
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
    case 'synced':
      return t('status.synced')
    default:
      return status
  }
}

const refreshHistory = () => {
  emit('refresh')
}

const retrySyncOrder = async (orderId: string) => {
  isRetrying.value = true
  try {
    emit('retry-sync', orderId)
  } finally {
    setTimeout(() => {
      isRetrying.value = false
    }, 2000)
  }
}

const markAsCollected = (orderId: string) => {
  emit('mark-collected', orderId)
}
</script>

<style scoped>
/* Loading animation */
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

/* Card shadow */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>