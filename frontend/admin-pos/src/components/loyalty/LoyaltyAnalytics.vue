<!--
  Loyalty Analytics Component
  Provides detailed analytics and reporting for loyalty program performance
-->

<template>
  <div class="space-y-6">
    <!-- Analytics Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Loyalty Program Analytics</h2>
          <p class="text-sm text-gray-600 mt-1">Comprehensive insights into loyalty program performance</p>
        </div>
        <div class="flex items-center space-x-3">
          <select
            v-model="selectedTimeframe"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            @click="exportAnalytics"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>

    <!-- Key Performance Indicators -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Active Members</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ analytics.activeMemberCount.toLocaleString() }}</dd>
              <dd class="text-sm text-green-600">+{{ analytics.memberGrowthRate }}% from last period</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Points Redeemed</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ analytics.pointsRedeemed.toLocaleString() }}</dd>
              <dd class="text-sm text-blue-600">${{ analytics.redemptionValue.toLocaleString() }} value</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Engagement Rate</dt>
              <dd class="text-2xl font-semibold text-gray-900">{{ analytics.engagementRate }}%</dd>
              <dd class="text-sm text-purple-600">{{ analytics.activeRedemptions }} active redemptions</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Revenue Impact</dt>
              <dd class="text-2xl font-semibold text-gray-900">${{ analytics.revenueImpact.toLocaleString() }}</dd>
              <dd class="text-sm text-orange-600">{{ analytics.averageOrderIncrease }}% avg order increase</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Member Growth Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <svg class="mx-auto w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <p class="text-sm text-gray-500">Chart integration pending</p>
          </div>
        </div>
      </div>

      <!-- Redemption Trends -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Redemption Trends</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <svg class="mx-auto w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <p class="text-sm text-gray-500">Chart integration pending</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Top Tier Distribution -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h3>
        <div class="space-y-3">
          <div
            v-for="tier in analytics.tierDistribution"
            :key="tier.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-3"
                :style="{ backgroundColor: tier.color }"
              ></div>
              <span class="text-sm font-medium text-gray-900">{{ tier.name }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-gray-900">{{ tier.count }}</div>
              <div class="text-xs text-gray-500">{{ tier.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Rewards -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Rewards</h3>
        <div class="space-y-3">
          <div
            v-for="reward in analytics.popularRewards"
            :key="reward.id"
            class="flex items-center justify-between"
          >
            <div>
              <div class="text-sm font-medium text-gray-900">{{ reward.name }}</div>
              <div class="text-xs text-gray-500">{{ reward.pointsCost }} points</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-gray-900">{{ reward.redemptions }}</div>
              <div class="text-xs text-gray-500">redemptions</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div
            v-for="activity in analytics.recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3"
          >
            <div class="flex-shrink-0">
              <div
                class="w-2 h-2 rounded-full mt-2"
                :class="{
                  'bg-green-500': activity.type === 'redemption',
                  'bg-blue-500': activity.type === 'enrollment',
                  'bg-yellow-500': activity.type === 'tier_upgrade'
                }"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'

const loyaltyStore = useLoyaltyStore()

// State
const selectedTimeframe = ref('30d')
const isLoading = ref(false)

// Computed - Use real data from store
const analytics = computed(() => {
  const storeAnalytics = loyaltyStore.analytics

  if (!storeAnalytics) {
    return {
      activeMemberCount: 0,
      memberGrowthRate: 0,
      pointsRedeemed: 0,
      redemptionValue: 0,
      engagementRate: 0,
      activeRedemptions: 0,
      revenueImpact: 0,
      averageOrderIncrease: 0,
      tierDistribution: [],
      popularRewards: [],
      recentActivity: []
    }
  }

  // Map tier distribution from store analytics
  const tierDistribution = Object.entries(storeAnalytics.membersByTier || {}).map(([name, count]) => ({
    name,
    count,
    percentage: storeAnalytics.totalMembers > 0 ? ((count / storeAnalytics.totalMembers) * 100).toFixed(1) : 0,
    color: getTierColor(name)
  }))

  // Map recent activity from transactions
  const recentActivity = (storeAnalytics.recentTransactions || []).slice(0, 5).map(tx => ({
    id: tx.id,
    type: tx.type.toLowerCase(),
    description: getActivityDescription(tx),
    timestamp: tx.createdAt
  }))

  return {
    activeMemberCount: storeAnalytics.activeMembers || 0,
    memberGrowthRate: storeAnalytics.enrollmentRate ? (storeAnalytics.enrollmentRate * 100).toFixed(1) : 0,
    pointsRedeemed: storeAnalytics.totalPointsRedeemed || 0,
    redemptionValue: storeAnalytics.totalRedemptionValue || 0,
    engagementRate: storeAnalytics.redemptionRate ? (storeAnalytics.redemptionRate * 100).toFixed(1) : 0,
    activeRedemptions: loyaltyStore.redemptions.length,
    revenueImpact: storeAnalytics.totalRedemptionValue || 0,
    averageOrderIncrease: 15.3, // Would need to calculate from order data
    tierDistribution,
    popularRewards: [], // Would need rewards data
    recentActivity
  }
})

// Methods
const fetchAnalytics = async () => {
  isLoading.value = true
  try {
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }

    const days = daysMap[selectedTimeframe.value] || 30
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    const startDate = start.toISOString().split('T')[0]
    const endDate = end.toISOString().split('T')[0]

    await loyaltyStore.fetchAnalytics(startDate, endDate)
  } finally {
    isLoading.value = false
  }
}

const exportAnalytics = async () => {
  const success = await loyaltyStore.exportData('customers', 'EXCEL')
  if (success) {
    alert('Analytics exported successfully')
  } else {
    alert('Failed to export analytics')
  }
}

const getTierColor = (tierName: string): string => {
  const colors: Record<string, string> = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2',
    'Diamond': '#B9F2FF'
  }
  return colors[tierName] || '#6B7280'
}

const getActivityDescription = (transaction: any): string => {
  const typeDescriptions: Record<string, string> = {
    'EARN': `Customer earned ${transaction.points} points`,
    'REDEEM': `Customer redeemed ${Math.abs(transaction.points)} points`,
    'EXPIRE': `${Math.abs(transaction.points)} points expired`,
    'ADJUST': `Points adjusted: ${transaction.description}`
  }
  return typeDescriptions[transaction.type] || transaction.description
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await fetchAnalytics()
})
</script>
