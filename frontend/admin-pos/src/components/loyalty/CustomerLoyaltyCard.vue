<!--
  Customer Loyalty Card Component
  Displays customer loyalty profile information including points, tier status, and progress
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Loyalty Profile -->
    <div v-else-if="loyaltyProfile" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Tier Badge -->
          <div
            v-if="loyaltyProfile.customer.tier"
            class="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm"
            :style="{ backgroundColor: loyaltyProfile.customer.tier.color || '#6B7280' }"
          >
            {{ loyaltyProfile.customer.tier.icon || loyaltyProfile.customer.tier.name.charAt(0) }}
          </div>
          <div v-else class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span class="text-gray-600 font-bold">?</span>
          </div>

          <!-- Customer Info -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ loyaltyProfile.customer.tier?.name || 'Not Enrolled' }} Member
            </h3>
            <p class="text-sm text-gray-600">
              Member since {{ formatDate(loyaltyProfile.customer.joinDate) }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2">
          <button
            @click="$emit('redeem-points')"
            :disabled="loyaltyProfile.customer.loyaltyPoints < 100"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Redeem Points
          </button>
          <button
            @click="$emit('view-history')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            View History
          </button>
        </div>
      </div>

      <!-- Points Summary -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">
            {{ loyaltyProfile.customer.loyaltyPoints.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600">Available Points</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            ${{ loyaltyProfile.customer.totalSpent.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600">Total Spent</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ loyaltyProfile.customer.visitCount }}
          </div>
          <div class="text-sm text-gray-600">Visits</div>
        </div>
      </div>

      <!-- Tier Progress -->
      <div v-if="loyaltyProfile.tierProgress" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-gray-900">
            Progress to {{ loyaltyProfile.tierProgress.nextTier?.name }}
          </h4>
          <span class="text-sm text-gray-600">
            ${{ loyaltyProfile.tierProgress.remainingSpend.toLocaleString() }} remaining
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${loyaltyProfile.tierProgress.progress}%` }"
          ></div>
        </div>

        <div class="text-xs text-gray-500 text-center">
          {{ loyaltyProfile.tierProgress.progress.toFixed(1) }}% to next tier
        </div>
      </div>

      <!-- Recent Rewards -->
      <div v-if="loyaltyProfile.recentRewards?.length" class="space-y-3">
        <h4 class="font-medium text-gray-900">Recent Activity</h4>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="reward in loyaltyProfile.recentRewards.slice(0, 5)"
            :key="reward.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                :class="getRewardTypeColor(reward.type)"
              >
                {{ getRewardTypeIcon(reward.type) }}
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ reward.description || reward.reason }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(reward.createdAt) }}
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
      </div>

      <!-- Active Redemptions -->
      <div v-if="loyaltyProfile.activeRedemptions?.length" class="space-y-3">
        <h4 class="font-medium text-gray-900">Active Redemptions</h4>
        <div class="space-y-2">
          <div
            v-for="redemption in loyaltyProfile.activeRedemptions"
            :key="redemption.id"
            class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div>
              <div class="text-sm font-medium text-gray-900">
                {{ redemption.description }}
              </div>
              <div class="text-xs text-gray-500">
                {{ redemption.pointsUsed }} points • ${{ redemption.discountValue.toFixed(2) }} value
              </div>
            </div>
            <div class="text-xs font-medium text-yellow-700">
              {{ redemption.status }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Enrolled State -->
    <div v-else class="text-center py-8">
      <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Not Enrolled in Loyalty Program</h3>
      <p class="text-gray-600 mb-4">Enroll this customer to start earning rewards</p>
      <button
        @click="$emit('enroll-customer')"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Enroll Customer
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-8">
      <div class="text-red-600 mb-2">{{ error }}</div>
      <button
        @click="$emit('retry')"
        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerLoyaltyProfile } from '@/services/loyalty'

interface Props {
  loyaltyProfile?: CustomerLoyaltyProfile | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loyaltyProfile: null,
  loading: false,
  error: null
})

const emit = defineEmits<{
  'redeem-points': []
  'view-history': []
  'enroll-customer': []
  'retry': []
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
</script>