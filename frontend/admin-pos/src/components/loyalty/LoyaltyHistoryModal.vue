<!--
  Loyalty History Modal Component
  Displays customer's loyalty rewards and redemption history
-->

<template>
  <div
    v-if="isOpen"
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Loyalty History
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

          <!-- Customer Info -->
          <div v-if="customer" class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">
                  {{ customer.firstName }} {{ customer.lastName }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ customer.email || customer.phone }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">
                  {{ customer.loyaltyPoints?.toLocaleString() || 0 }}
                </div>
                <div class="text-sm text-gray-600">Current Points</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 mb-4">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'rewards'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'rewards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Rewards History
              </button>
              <button
                @click="activeTab = 'redemptions'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'redemptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Redemptions
              </button>
            </nav>
          </div>

          <!-- Content -->
          <div class="min-h-96 max-h-96 overflow-y-auto">
            <!-- Rewards Tab -->
            <div v-if="activeTab === 'rewards'">
              <!-- Loading State -->
              <div v-if="loadingRewards" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div class="mt-2 text-sm text-gray-600">Loading rewards...</div>
              </div>

              <!-- Rewards List -->
              <div v-else-if="rewards.length" class="space-y-3">
                <div
                  v-for="reward in rewards"
                  :key="reward.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      :class="getRewardTypeColor(reward.type)"
                    >
                      {{ getRewardTypeIcon(reward.type) }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ reward.description || reward.reason || formatRewardType(reward.type) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(reward.createdAt) }}
                        <span v-if="reward.orderId" class="ml-2">
                          Order #{{ reward.orderId.slice(-8) }}
                        </span>
                      </div>
                      <div v-if="reward.expiresAt" class="text-xs text-yellow-600">
                        Expires {{ formatDate(reward.expiresAt) }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="text-sm font-bold"
                    :class="reward.points > 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ reward.points > 0 ? '+' : '' }}{{ reward.points }}
                  </div>
                </div>
              </div>

              <!-- No Rewards -->
              <div v-else class="text-center py-8">
                <div class="text-gray-500">No rewards history found</div>
              </div>
            </div>

            <!-- Redemptions Tab -->
            <div v-if="activeTab === 'redemptions'">
              <!-- Loading State -->
              <div v-if="loadingRedemptions" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div class="mt-2 text-sm text-gray-600">Loading redemptions...</div>
              </div>

              <!-- Redemptions List -->
              <div v-else-if="redemptions.length" class="space-y-3">
                <div
                  v-for="redemption in redemptions"
                  :key="redemption.id"
                  class="p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-900">
                      {{ redemption.description }}
                    </div>
                    <div
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getRedemptionStatusColor(redemption.status)"
                    >
                      {{ redemption.status }}
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <div class="text-gray-600">
                      {{ redemption.pointsUsed }} points • ${{ redemption.discountValue.toFixed(2) }} value
                    </div>
                    <div class="text-gray-500">
                      {{ formatDate(redemption.createdAt) }}
                    </div>
                  </div>
                  <div v-if="redemption.orderId" class="text-xs text-gray-500 mt-1">
                    Applied to Order #{{ redemption.orderId.slice(-8) }}
                  </div>
                  <div v-if="redemption.expiresAt && redemption.status === 'PENDING'" class="text-xs text-yellow-600 mt-1">
                    Expires {{ formatDate(redemption.expiresAt) }}
                  </div>
                </div>
              </div>

              <!-- No Redemptions -->
              <div v-else class="text-center py-8">
                <div class="text-gray-500">No redemptions found</div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="mt-4 text-center">
            <button
              @click="loadMore"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              <span v-if="loading">Loading...</span>
              <span v-else>Load More</span>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="text-sm text-red-600">{{ error }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LoyaltyReward, LoyaltyRedemption } from '@/services/loyalty'
import { loyaltyService } from '@/services/loyalty'

interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

interface Props {
  isOpen: boolean
  customer: Customer | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// State
const activeTab = ref<'rewards' | 'redemptions'>('rewards')
const rewards = ref<LoyaltyReward[]>([])
const redemptions = ref<LoyaltyRedemption[]>([])
const loadingRewards = ref(false)
const loadingRedemptions = ref(false)
const error = ref('')
const rewardsOffset = ref(0)
const redemptionsOffset = ref(0)
const rewardsHasMore = ref(true)
const redemptionsHasMore = ref(true)
const limit = 20

// Computed
const loading = computed(() => {
  return activeTab.value === 'rewards' ? loadingRewards.value : loadingRedemptions.value
})

const hasMore = computed(() => {
  return activeTab.value === 'rewards' ? rewardsHasMore.value : redemptionsHasMore.value
})

// Watch for modal open
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.customer) {
    resetData()
    loadRewards()
  }
})

// Watch for tab change
watch(activeTab, (newTab) => {
  if (newTab === 'redemptions' && redemptions.value.length === 0) {
    loadRedemptions()
  }
})

// Methods
const resetData = () => {
  rewards.value = []
  redemptions.value = []
  rewardsOffset.value = 0
  redemptionsOffset.value = 0
  rewardsHasMore.value = true
  redemptionsHasMore.value = true
  error.value = ''
}

const loadRewards = async () => {
  if (!props.customer || loadingRewards.value) return

  loadingRewards.value = true
  error.value = ''

  try {
    const response = await loyaltyService.getCustomerRewards(
      props.customer.id,
      limit,
      rewardsOffset.value
    )

    if (response.success) {
      if (rewardsOffset.value === 0) {
        rewards.value = response.data.rewards
      } else {
        rewards.value.push(...response.data.rewards)
      }
      rewardsHasMore.value = response.data.pagination.hasMore
      rewardsOffset.value += limit
    } else {
      error.value = response.message || 'Failed to load rewards'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load rewards'
  } finally {
    loadingRewards.value = false
  }
}

const loadRedemptions = async () => {
  if (!props.customer || loadingRedemptions.value) return

  loadingRedemptions.value = true
  error.value = ''

  try {
    const response = await loyaltyService.getCustomerRedemptions(
      props.customer.id,
      limit,
      redemptionsOffset.value
    )

    if (response.success) {
      if (redemptionsOffset.value === 0) {
        redemptions.value = response.data.redemptions
      } else {
        redemptions.value.push(...response.data.redemptions)
      }
      redemptionsHasMore.value = response.data.pagination.hasMore
      redemptionsOffset.value += limit
    } else {
      error.value = response.message || 'Failed to load redemptions'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load redemptions'
  } finally {
    loadingRedemptions.value = false
  }
}

const loadMore = () => {
  if (activeTab.value === 'rewards') {
    loadRewards()
  } else {
    loadRedemptions()
  }
}

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

const formatRewardType = (type: string) => {
  const formatted = {
    'POINTS_EARNED': 'Points Earned',
    'POINTS_REDEEMED': 'Points Redeemed',
    'SIGNUP_BONUS': 'Signup Bonus',
    'BIRTHDAY_BONUS': 'Birthday Bonus',
    'CAMPAIGN_BONUS': 'Campaign Bonus',
    'TIER_BONUS': 'Tier Bonus',
    'REFERRAL_BONUS': 'Referral Bonus'
  }
  return formatted[type as keyof typeof formatted] || type.replace('_', ' ')
}

const getRewardTypeColor = (type: string) => {
  const colors = {
    'POINTS_EARNED': 'bg-green-500',
    'POINTS_REDEEMED': 'bg-red-500',
    'SIGNUP_BONUS': 'bg-blue-500',
    'BIRTHDAY_BONUS': 'bg-purple-500',
    'CAMPAIGN_BONUS': 'bg-yellow-500',
    'TIER_BONUS': 'bg-indigo-500',
    'REFERRAL_BONUS': 'bg-pink-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const getRewardTypeIcon = (type: string) => {
  const icons = {
    'POINTS_EARNED': '+',
    'POINTS_REDEEMED': '-',
    'SIGNUP_BONUS': '🎉',
    'BIRTHDAY_BONUS': '🎂',
    'CAMPAIGN_BONUS': '⭐',
    'TIER_BONUS': '⬆️',
    'REFERRAL_BONUS': '👥'
  }
  return icons[type as keyof typeof icons] || '●'
}

const getRedemptionStatusColor = (status: string) => {
  const colors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPLIED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'EXPIRED': 'bg-gray-100 text-gray-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
</script>