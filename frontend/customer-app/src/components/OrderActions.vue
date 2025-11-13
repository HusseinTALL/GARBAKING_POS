<!--
  OrderActions Component - Action buttons for orders
  Provides cancel, reorder, help, and share actions
-->

<template>
  <div class="flex flex-col gap-3">
    <!-- Primary actions row -->
    <div class="flex gap-3">
      <!-- Reorder button -->
      <button
        v-if="showReorder"
        @click="$emit('reorder')"
        class="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ $t('orders.actions.reorder') }}
      </button>

      <!-- Cancel button -->
      <button
        v-if="showCancel"
        @click="$emit('cancel')"
        class="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 active:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        {{ $t('orders.actions.cancel') }}
      </button>

      <!-- Track button (for active orders) -->
      <button
        v-if="showTrack"
        @click="$emit('track')"
        class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        {{ $t('orders.actions.track') }}
      </button>
    </div>

    <!-- Secondary actions row -->
    <div class="flex gap-3">
      <!-- View details button -->
      <button
        v-if="showDetails"
        @click="$emit('viewDetails')"
        class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        {{ $t('orders.actions.details') }}
      </button>

      <!-- Help/Contact button -->
      <button
        v-if="showHelp"
        @click="$emit('help')"
        class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        {{ $t('orders.actions.help') }}
      </button>

      <!-- Share button -->
      <button
        v-if="showShare"
        @click="handleShare"
        class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        {{ $t('orders.actions.share') }}
      </button>
    </div>

    <!-- Invoice/Receipt button (full width) -->
    <button
      v-if="showReceipt"
      @click="$emit('receipt')"
      class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors flex items-center justify-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      {{ $t('orders.actions.receipt') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { Order, OrderStatus } from '@/types'

interface Props {
  order: Order
  showReorder?: boolean
  showCancel?: boolean
  showTrack?: boolean
  showDetails?: boolean
  showHelp?: boolean
  showShare?: boolean
  showReceipt?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showReorder: true,
  showCancel: false,
  showTrack: false,
  showDetails: true,
  showHelp: true,
  showShare: true,
  showReceipt: true
})

const emit = defineEmits<{
  (e: 'reorder'): void
  (e: 'cancel'): void
  (e: 'track'): void
  (e: 'viewDetails'): void
  (e: 'help'): void
  (e: 'share'): void
  (e: 'receipt'): void
}>()

const { t } = useI18n()
const toast = useToast()

// Methods
async function handleShare() {
  const shareData = {
    title: `${t('orders.orderNumber', { number: props.order.orderNumber })}`,
    text: `${t('orders.shareText', {
      number: props.order.orderNumber,
      status: t(`orders.status.${props.order.status.toLowerCase()}`)
    })}`,
    url: window.location.href
  }

  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      await navigator.share(shareData)
      toast.success(t('orders.shareSuccess'))
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`
      )
      toast.success(t('orders.copiedToClipboard'))
    }
  } catch (error: any) {
    // User cancelled share or error occurred
    if (error.name !== 'AbortError') {
      console.error('Share error:', error)
      toast.error(t('orders.shareFailed'))
    }
  }

  emit('share')
}
</script>

<style scoped>
/* Additional animations for active states */
button:active {
  transform: scale(0.98);
}

button {
  transition: transform 0.1s ease, background-color 0.2s ease;
}
</style>
