<!--
  OrderCard Component - Reusable order summary card
  Displays order information with status, items preview, and actions
-->

<template>
  <div
    @click="$emit('click', order)"
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
  >
    <!-- Order header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-bold text-base text-gray-900 dark:text-white">
          {{ $t('orders.orderNumber', { number: order.orderNumber }) }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ formatDate(order.createdAt) }}
        </p>
      </div>

      <!-- Status badge -->
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="getStatusColor(order.status)"
      >
        {{ getStatusText(order.status) }}
      </span>
    </div>

    <!-- Order type badge -->
    <div v-if="showOrderType" class="mb-3">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path :d="getOrderTypeIcon(order.orderType)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        </svg>
        {{ getOrderTypeText(order.orderType) }}
      </span>
    </div>

    <!-- Order items preview -->
    <div class="space-y-2 mb-3">
      <div
        v-for="item in displayedItems"
        :key="item.id"
        class="flex items-center gap-3"
      >
        <!-- Item image -->
        <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          <img
            v-if="item.menuItem?.imageUrl"
            :src="item.menuItem.imageUrl"
            :alt="item.menuItem.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
        </div>

        <!-- Item details -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ item.menuItem.name }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ formatPrice(item.unitPrice) }} × {{ item.quantity }}
          </p>
        </div>

        <!-- Item subtotal -->
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ formatPrice(item.totalPrice) }}
        </p>
      </div>

      <!-- More items indicator -->
      <p v-if="hasMoreItems" class="text-xs text-gray-500 dark:text-gray-400 pl-15">
        +{{ remainingItemsCount }} {{ $t('orders.moreItems', { count: remainingItemsCount }) }}
      </p>
    </div>

    <!-- Order total -->
    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 mb-3">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {{ $t('orders.total') }}
      </span>
      <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
        {{ formatPrice(order.total) }}
      </span>
    </div>

    <!-- Action buttons -->
    <div v-if="showActions" class="flex gap-2">
      <!-- Reorder button -->
      <button
        @click.stop="$emit('reorder', order)"
        class="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ $t('orders.reorder') }}
      </button>

      <!-- View details button -->
      <button
        @click.stop="$emit('viewDetails', order)"
        class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        {{ $t('orders.details') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Order, OrderStatus, OrderType } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  order: Order
  maxItemsPreview?: number
  showActions?: boolean
  showOrderType?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxItemsPreview: 2,
  showActions: true,
  showOrderType: true
})

const emit = defineEmits<{
  (e: 'click', order: Order): void
  (e: 'reorder', order: Order): void
  (e: 'viewDetails', order: Order): void
}>()

const { t } = useI18n()

// Computed
const displayedItems = computed(() =>
  props.order.orderItems.slice(0, props.maxItemsPreview)
)

const hasMoreItems = computed(() =>
  props.order.orderItems.length > props.maxItemsPreview
)

const remainingItemsCount = computed(() =>
  props.order.orderItems.length - props.maxItemsPreview
)

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return t('time.justNow')
  } else if (diffMins < 60) {
    return t('time.minutesAgo', { count: diffMins })
  } else if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours })
  } else if (diffDays === 1) {
    return t('time.yesterday')
  } else if (diffDays < 7) {
    return t('time.daysAgo', { count: diffDays })
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'PREPARING':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'READY':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'SERVED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getStatusText = (status: OrderStatus): string => {
  return t(`orders.status.${status.toLowerCase()}`)
}

const getOrderTypeText = (orderType: OrderType): string => {
  return t(`orders.orderType.${orderType.toLowerCase()}`)
}

const getOrderTypeIcon = (orderType: OrderType): string => {
  switch (orderType) {
    case 'DINE_IN':
      return 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'
    case 'TAKEAWAY':
      return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
    case 'DELIVERY':
      return 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z'
    default:
      return 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
  }
}
</script>

<style scoped>
.pl-15 {
  padding-left: 3.75rem; /* 60px - width of image + gap */
}
</style>
