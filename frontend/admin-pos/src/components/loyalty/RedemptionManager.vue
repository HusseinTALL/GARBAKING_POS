<!--
  Redemption Manager Component
  Manages loyalty point redemptions and reward fulfillment
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Redemption Management</h2>
        <div class="flex space-x-3">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="loadRedemptions"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPLIED">Applied</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button
            @click="loadRedemptions"
            :disabled="loadingRedemptions"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-600">{{ stats.pendingRedemptions }}</div>
              <div class="text-sm text-gray-600">Pending Redemptions</div>
            </div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ stats.appliedRedemptions }}</div>
              <div class="text-sm text-gray-600">Applied Today</div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">${{ stats.totalValueRedeemed.toLocaleString() }}</div>
              <div class="text-sm text-gray-600">Value Redeemed</div>
            </div>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">{{ stats.expiredRedemptions }}</div>
              <div class="text-sm text-gray-600">Expired/Cancelled</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Redemptions Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Redemptions</h3>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points Used
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount Value
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="redemption in redemptions" :key="redemption.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ redemption.customer?.firstName }} {{ redemption.customer?.lastName }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ redemption.customer?.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRedemptionTypeClass(redemption.redemptionType)"
                >
                  {{ formatRedemptionType(redemption.redemptionType) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ redemption.pointsUsed.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                ${{ redemption.discountValue.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusClass(redemption.status)"
                >
                  {{ redemption.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(redemption.createdAt) }}
                <div v-if="redemption.expiresAt && redemption.status === 'PENDING'" class="text-xs text-yellow-600">
                  Expires {{ formatDate(redemption.expiresAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    v-if="redemption.status === 'PENDING'"
                    @click="markAsApplied(redemption.id)"
                    class="text-green-600 hover:text-green-900"
                    title="Mark as Applied"
                  >
                    Apply
                  </button>
                  <button
                    v-if="['PENDING', 'APPLIED'].includes(redemption.status)"
                    @click="cancelRedemption(redemption.id)"
                    class="text-red-600 hover:text-red-900"
                    title="Cancel Redemption"
                  >
                    Cancel
                  </button>
                  <button
                    @click="viewDetails(redemption)"
                    class="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    Details
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!loadingRedemptions && redemptions.length === 0" class="text-center py-8">
        <div class="text-gray-500">No redemptions found</div>
      </div>

      <!-- Loading -->
      <div v-if="loadingRedemptions" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <div class="mt-2 text-sm text-gray-600">Loading redemptions...</div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && !loadingRedemptions" class="mt-4 text-center">
        <button
          @click="loadMore"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          Load More
        </button>
      </div>
    </div>

    <!-- Redemption Details Modal -->
    <RedemptionDetailsModal
      :is-open="showDetailsModal"
      :redemption="selectedRedemption"
      @close="showDetailsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loyaltyService, type LoyaltyRedemption } from '@/services/loyalty'
import RedemptionDetailsModal from './RedemptionDetailsModal.vue'

// State
const redemptions = ref<LoyaltyRedemption[]>([])
const loadingRedemptions = ref(false)
const statusFilter = ref('')
const hasMore = ref(true)
const offset = ref(0)
const limit = 20
const showDetailsModal = ref(false)
const selectedRedemption = ref<LoyaltyRedemption | null>(null)

const stats = ref({
  pendingRedemptions: 5,
  appliedRedemptions: 23,
  totalValueRedeemed: 1847.50,
  expiredRedemptions: 3
})

// Methods
const loadRedemptions = async (append = false) => {
  if (!append) {
    offset.value = 0
    redemptions.value = []
  }

  loadingRedemptions.value = true
  try {
    const { redemptions: fetchedRedemptions, pagination } = await loyaltyService.getAllRedemptions({
      status: statusFilter.value || undefined,
      limit,
      offset: offset.value
    })

    if (append) {
      redemptions.value.push(...fetchedRedemptions)
    } else {
      redemptions.value = fetchedRedemptions
    }

    const total = pagination?.total ?? null
    const hasExplicitMore = pagination?.hasMore ?? null
    if (hasExplicitMore !== null) {
      hasMore.value = Boolean(hasExplicitMore)
    } else if (typeof total === 'number') {
      hasMore.value = offset.value + fetchedRedemptions.length < total
    } else {
      hasMore.value = fetchedRedemptions.length === limit
    }

    offset.value += fetchedRedemptions.length
  } catch (error) {
    console.error('Error loading redemptions:', error)
  } finally {
    loadingRedemptions.value = false
  }
}

const loadMore = () => {
  loadRedemptions(true)
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

const markAsApplied = async (redemptionId: string) => {
  try {
    await loyaltyService.updateRedemptionStatus(redemptionId, 'APPLIED')
    await loadRedemptions()
  } catch (error) {
    alert('Failed to update redemption')
  }
}

const cancelRedemption = async (redemptionId: string) => {
  if (!confirm('Are you sure you want to cancel this redemption? Points will be restored to the customer.')) {
    return
  }

  try {
    await loyaltyService.updateRedemptionStatus(redemptionId, 'CANCELLED')
    await loadRedemptions()
  } catch (error) {
    alert('Failed to cancel redemption')
  }
}

const viewDetails = (redemption: LoyaltyRedemption) => {
  selectedRedemption.value = redemption
  showDetailsModal.value = true
}

// Lifecycle
onMounted(() => {
  loadRedemptions()
})
</script>