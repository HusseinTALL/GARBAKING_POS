<!--
  Rewards Manager Component
  Manages different types of loyalty rewards including bonuses, campaigns, and special promotions
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Rewards Management</h2>
        <div class="flex space-x-3">
          <button
            @click="showBonusModal = true"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Award Bonus Points
          </button>
          <button
            @click="showCampaignModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create Campaign
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ stats.totalPointsAwarded.toLocaleString() }}</div>
              <div class="text-sm text-gray-600">Points Awarded Today</div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ stats.totalPointsRedeemed.toLocaleString() }}</div>
              <div class="text-sm text-gray-600">Points Redeemed Today</div>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ stats.activeCampaigns }}</div>
              <div class="text-sm text-gray-600">Active Campaigns</div>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-orange-600">{{ stats.birthdayBonuses }}</div>
              <div class="text-sm text-gray-600">Birthday Bonuses</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Rewards -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Rewards</h3>
        <div class="flex space-x-2">
          <select
            v-model="selectedRewardType"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="loadRewards"
          >
            <option value="">All Types</option>
            <option value="POINTS_EARNED">Points Earned</option>
            <option value="SIGNUP_BONUS">Signup Bonus</option>
            <option value="BIRTHDAY_BONUS">Birthday Bonus</option>
            <option value="CAMPAIGN_BONUS">Campaign Bonus</option>
            <option value="TIER_BONUS">Tier Bonus</option>
            <option value="REFERRAL_BONUS">Referral Bonus</option>
          </select>
          <button
            @click="loadRewards"
            :disabled="loadingRewards"
            class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            <svg v-if="loadingRewards" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Rewards Table -->
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
                Points
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
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
            <tr v-for="reward in rewards" :key="reward.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ reward.customer?.firstName }} {{ reward.customer?.lastName }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ reward.customer?.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRewardTypeClass(reward.type)"
                >
                  {{ formatRewardType(reward.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="text-sm font-bold"
                  :class="reward.points > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ reward.points > 0 ? '+' : '' }}{{ reward.points }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ reward.reason || reward.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(reward.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="canReverseReward(reward)"
                  @click="reverseReward(reward.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Reverse
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!loadingRewards && rewards.length === 0" class="text-center py-8">
        <div class="text-gray-500">No rewards found</div>
      </div>

      <!-- Loading -->
      <div v-if="loadingRewards" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <div class="mt-2 text-sm text-gray-600">Loading rewards...</div>
      </div>
    </div>

    <!-- Bonus Points Modal -->
    <BonusPointsModal
      :is-open="showBonusModal"
      @close="showBonusModal = false"
      @awarded="handleBonusAwarded"
    />

    <!-- Campaign Modal -->
    <CampaignModal
      :is-open="showCampaignModal"
      @close="showCampaignModal = false"
      @created="handleCampaignCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loyaltyService, type LoyaltyReward } from '@/services/loyalty'
import BonusPointsModal from './BonusPointsModal.vue'
import CampaignModal from './CampaignModal.vue'

// State
const rewards = ref<LoyaltyReward[]>([])
const loadingRewards = ref(false)
const selectedRewardType = ref('')
const showBonusModal = ref(false)
const showCampaignModal = ref(false)

const stats = ref({
  totalPointsAwarded: 1250,
  totalPointsRedeemed: 875,
  activeCampaigns: 3,
  birthdayBonuses: 12
})

// Methods
const loadRewards = async () => {
  loadingRewards.value = true
  try {
    const { rewards: rewardList } = await loyaltyService.getAllRewards({
      type: selectedRewardType.value || undefined,
      limit: 50
    })

    rewards.value = rewardList
  } catch (error) {
    console.error('Error loading rewards:', error)
  } finally {
    loadingRewards.value = false
  }
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

const getRewardTypeClass = (type: string) => {
  const classes = {
    'POINTS_EARNED': 'bg-green-100 text-green-800',
    'POINTS_REDEEMED': 'bg-red-100 text-red-800',
    'SIGNUP_BONUS': 'bg-blue-100 text-blue-800',
    'BIRTHDAY_BONUS': 'bg-purple-100 text-purple-800',
    'CAMPAIGN_BONUS': 'bg-yellow-100 text-yellow-800',
    'TIER_BONUS': 'bg-indigo-100 text-indigo-800',
    'REFERRAL_BONUS': 'bg-pink-100 text-pink-800'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const canReverseReward = (reward: LoyaltyReward) => {
  // Allow reversal for manual bonuses within 24 hours
  const hoursSinceCreated = (Date.now() - new Date(reward.createdAt).getTime()) / (1000 * 60 * 60)
  return ['SIGNUP_BONUS', 'BIRTHDAY_BONUS', 'CAMPAIGN_BONUS', 'TIER_BONUS', 'REFERRAL_BONUS'].includes(reward.type) && hoursSinceCreated < 24
}

const reverseReward = async (rewardId: string) => {
  if (!confirm('Are you sure you want to reverse this reward? This action cannot be undone.')) {
    return
  }

  try {
    await loyaltyService.reverseReward(rewardId)
    await loadRewards()
    alert('Reward reversed successfully')
  } catch (error) {
    alert('Failed to reverse reward')
  }
}

const handleBonusAwarded = () => {
  loadRewards()
}

const handleCampaignCreated = () => {
  loadRewards()
}

// Lifecycle
onMounted(() => {
  loadRewards()
})
</script>