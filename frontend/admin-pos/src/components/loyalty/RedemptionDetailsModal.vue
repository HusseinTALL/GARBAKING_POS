<!--
  Redemption Details Modal Component
  Shows detailed information about a specific redemption
-->

<template>
  <div
    v-if="isOpen && redemption"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Redemption Details
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Redemption Info -->
          <div class="space-y-4">
            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <span
                class="inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1"
                :class="getStatusClass(redemption.status)"
              >
                {{ redemption.status }}
              </span>
            </div>

            <!-- Customer -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Customer</label>
              <div class="mt-1 p-3 bg-gray-50 rounded-lg">
                <div class="font-medium text-gray-900">
                  {{ redemption.customer?.firstName }} {{ redemption.customer?.lastName }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ redemption.customer?.email || redemption.customer?.phone }}
                </div>
              </div>
            </div>

            <!-- Redemption Details -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Points Used</label>
                <div class="mt-1 text-lg font-semibold text-blue-600">
                  {{ redemption.pointsUsed.toLocaleString() }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Discount Value</label>
                <div class="mt-1 text-lg font-semibold text-green-600">
                  ${{ redemption.discountValue.toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Type and Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <div class="mt-1">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRedemptionTypeClass(redemption.redemptionType)"
                >
                  {{ formatRedemptionType(redemption.redemptionType) }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1 text-sm text-gray-900">
                {{ redemption.description }}
              </div>
            </div>

            <!-- Order Information -->
            <div v-if="redemption.orderId">
              <label class="block text-sm font-medium text-gray-700">Order</label>
              <div class="mt-1 p-3 bg-blue-50 rounded-lg">
                <div class="text-sm font-medium text-blue-900">
                  Order #{{ redemption.orderId.slice(-8) }}
                </div>
                <div class="text-xs text-blue-700">
                  Applied to this order
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Created</label>
                <div class="mt-1 text-sm text-gray-900">
                  {{ formatDate(redemption.createdAt) }}
                </div>
              </div>

              <div v-if="redemption.appliedAt">
                <label class="block text-sm font-medium text-gray-700">Applied</label>
                <div class="mt-1 text-sm text-gray-900">
                  {{ formatDate(redemption.appliedAt) }}
                </div>
              </div>

              <div v-if="redemption.expiresAt">
                <label class="block text-sm font-medium text-gray-700">Expires</label>
                <div class="mt-1 text-sm" :class="isExpired ? 'text-red-600' : 'text-gray-900'">
                  {{ formatDate(redemption.expiresAt) }}
                  <span v-if="isExpired" class="ml-2 text-xs">(Expired)</span>
                  <span v-else-if="redemption.status === 'PENDING'" class="ml-2 text-xs text-yellow-600">
                    ({{ getTimeUntilExpiry() }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="redemption.notes">
              <label class="block text-sm font-medium text-gray-700">Notes</label>
              <div class="mt-1 text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {{ redemption.notes }}
              </div>
            </div>

            <!-- Audit Trail -->
            <div v-if="redemption.auditTrail && redemption.auditTrail.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Activity History</label>
              <div class="space-y-2 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                <div
                  v-for="entry in redemption.auditTrail"
                  :key="entry.id"
                  class="text-xs"
                >
                  <div class="flex justify-between">
                    <span class="font-medium">{{ entry.action }}</span>
                    <span class="text-gray-500">{{ formatDate(entry.timestamp) }}</span>
                  </div>
                  <div v-if="entry.details" class="text-gray-600 mt-1">
                    {{ entry.details }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LoyaltyRedemption } from '@/services/loyalty'

interface Props {
  isOpen: boolean
  redemption: LoyaltyRedemption | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// Computed
const isExpired = computed(() => {
  if (!props.redemption?.expiresAt) return false
  return new Date(props.redemption.expiresAt) < new Date()
})

// Methods
const closeModal = () => {
  emit('close')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRedemptionType = (type: string) => {
  const formatted = {
    'DISCOUNT': 'Dollar Discount',
    'PERCENTAGE_OFF': 'Percentage Off',
    'FREE_ITEM': 'Free Item'
  }
  return formatted[type as keyof typeof formatted] || type.replace('_', ' ')
}

const getRedemptionTypeClass = (type: string) => {
  const classes = {
    'DISCOUNT': 'bg-green-100 text-green-800',
    'PERCENTAGE_OFF': 'bg-blue-100 text-blue-800',
    'FREE_ITEM': 'bg-purple-100 text-purple-800'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status: string) => {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPLIED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'EXPIRED': 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getTimeUntilExpiry = () => {
  if (!props.redemption?.expiresAt) return ''

  const now = new Date()
  const expiry = new Date(props.redemption.expiresAt)
  const diff = expiry.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} remaining`
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} remaining`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes} minute${minutes === 1 ? '' : 's'} remaining`
  }
}
</script>