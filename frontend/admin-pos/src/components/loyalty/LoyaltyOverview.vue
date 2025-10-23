<!--
  Loyalty Overview Component
  Main dashboard showing key metrics, recent activity, and program performance
-->

<template>
  <div class="space-y-6">
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ metrics.totalMembers.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Total Members</div>
            <div class="text-xs text-green-600 mt-1">
              +{{ metrics.newMembersThisMonth }} this month
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ metrics.totalPointsAwarded.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Points Awarded</div>
            <div class="text-xs text-blue-600 mt-1">
              {{ metrics.pointsAwardedToday.toLocaleString() }} today
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">${{ metrics.totalRedemptionValue.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Redemption Value</div>
            <div class="text-xs text-purple-600 mt-1">
              {{ metrics.redemptionsThisMonth }} redemptions
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ metrics.engagementRate }}%</div>
            <div class="text-sm text-gray-600">Engagement Rate</div>
            <div class="text-xs text-orange-600 mt-1">
              {{ metrics.activeMembers }} active members
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Member Growth Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
        <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v6a2 2 0 002 2h1l1 1v3h1v-3l1-1h1a2 2 0 002-2v-6a2 2 0 00-2-2H11a2 2 0 00-2 2z"></path>
            </svg>
            <h4 class="mt-2 text-sm font-medium text-gray-900">Member Growth Chart</h4>
            <p class="mt-1 text-sm text-gray-500">Chart component would be integrated here</p>
          </div>
        </div>
      </div>

      <!-- Points Activity Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Points Activity</h3>
        <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12v6a2 2 0 002 2h1l1 1v3h1v-3l1-1h1a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2z"></path>
            </svg>
            <h4 class="mt-2 text-sm font-medium text-gray-900">Points Activity Chart</h4>
            <p class="mt-1 text-sm text-gray-500">Chart component would be integrated here</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity and Program Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            @click="loadRecentActivity"
            :disabled="loadingActivity"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {{ loadingActivity ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              :class="getActivityTypeColor(activity.type)"
            >
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900">
                {{ activity.description }}
              </div>
              <div class="text-sm text-gray-600">
                {{ activity.customerName }} • {{ formatDate(activity.timestamp) }}
              </div>
            </div>
            <div v-if="activity.points" class="flex-shrink-0">
              <span
                class="text-sm font-medium"
                :class="activity.points > 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ activity.points > 0 ? '+' : '' }}{{ activity.points }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="!loadingActivity && recentActivity.length === 0" class="text-center py-8 text-gray-500">
          No recent activity
        </div>
      </div>

      <!-- Program Status -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Program Status</h3>

        <div class="space-y-4">
          <!-- Active Programs -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Active Programs</span>
              <span class="text-sm text-green-600 font-medium">{{ programStatus.activePrograms }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: 100%"></div>
            </div>
          </div>

          <!-- Active Campaigns -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Active Campaigns</span>
              <span class="text-sm text-blue-600 font-medium">{{ programStatus.activeCampaigns }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 75%"></div>
            </div>
          </div>

          <!-- Member Tiers -->
          <div class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Member Distribution</span>
            <div v-for="tier in memberTiers" :key="tier.name" class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: tier.color }"
                ></div>
                <span class="text-xs text-gray-600">{{ tier.name }}</span>
              </div>
              <span class="text-xs font-medium text-gray-900">{{ tier.count }}</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="pt-4 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div class="space-y-2">
              <button
                @click="$emit('award-bonus')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Award Bonus Points
              </button>
              <button
                @click="$emit('create-campaign')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Create Campaign
              </button>
              <button
                @click="$emit('export-data')"
                class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Alerts -->
    <div v-if="alerts.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
      <div class="space-y-3">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="flex items-start space-x-3 p-3 rounded-lg"
          :class="getAlertClass(alert.type)"
        >
          <div class="flex-shrink-0">
            <svg v-if="alert.type === 'warning'" class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <svg v-else-if="alert.type === 'info'" class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium" :class="getAlertTextClass(alert.type)">
              {{ alert.title }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              {{ alert.message }}
            </div>
          </div>
          <button
            @click="dismissAlert(alert.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// State
const loadingActivity = ref(false)

const metrics = ref({
  totalMembers: 1247,
  newMembersThisMonth: 89,
  totalPointsAwarded: 156780,
  pointsAwardedToday: 2340,
  totalRedemptionValue: 8947,
  redemptionsThisMonth: 234,
  engagementRate: 78,
  activeMembers: 932
})

const programStatus = ref({
  activePrograms: 3,
  activeCampaigns: 2
})

const memberTiers = ref([
  { name: 'Bronze', count: 847, color: '#CD7F32' },
  { name: 'Silver', count: 298, color: '#C0C0C0' },
  { name: 'Gold', count: 87, color: '#FFD700' },
  { name: 'Platinum', count: 15, color: '#E5E4E2' }
])

const recentActivity = ref([
  {
    id: '1',
    type: 'POINTS_EARNED',
    description: 'Earned points from purchase',
    customerName: 'John Doe',
    timestamp: new Date().toISOString(),
    points: 25
  },
  {
    id: '2',
    type: 'REDEMPTION',
    description: 'Redeemed points for discount',
    customerName: 'Jane Smith',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    points: -150
  },
  {
    id: '3',
    type: 'SIGNUP',
    description: 'New member enrolled',
    customerName: 'Mike Johnson',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    points: 500
  }
])

const alerts = ref([
  {
    id: '1',
    type: 'warning',
    title: 'High Redemption Volume',
    message: 'Redemption activity is 150% above normal. Monitor point balances closely.'
  },
  {
    id: '2',
    type: 'info',
    title: 'Campaign Performance',
    message: 'Summer Double Points campaign is performing 25% better than expected.'
  }
])

// Emits
defineEmits<{
  'award-bonus': []
  'create-campaign': []
  'export-data': []
}>()

// Methods
const loadRecentActivity = async () => {
  loadingActivity.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Refresh activity data
  } finally {
    loadingActivity.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getActivityTypeColor = (type: string) => {
  const colors = {
    'POINTS_EARNED': 'bg-green-500',
    'REDEMPTION': 'bg-blue-500',
    'SIGNUP': 'bg-purple-500',
    'TIER_UPGRADE': 'bg-yellow-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const getActivityIcon = (type: string) => {
  const icons = {
    'POINTS_EARNED': '+',
    'REDEMPTION': '$',
    'SIGNUP': '★',
    'TIER_UPGRADE': '↑'
  }
  return icons[type as keyof typeof icons] || '●'
}

const getAlertClass = (type: string) => {
  const classes = {
    'warning': 'bg-yellow-50 border border-yellow-200',
    'info': 'bg-blue-50 border border-blue-200',
    'success': 'bg-green-50 border border-green-200'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-50 border border-gray-200'
}

const getAlertTextClass = (type: string) => {
  const classes = {
    'warning': 'text-yellow-800',
    'info': 'text-blue-800',
    'success': 'text-green-800'
  }
  return classes[type as keyof typeof classes] || 'text-gray-800'
}

const dismissAlert = (alertId: string) => {
  const index = alerts.value.findIndex(alert => alert.id === alertId)
  if (index !== -1) {
    alerts.value.splice(index, 1)
  }
}

// Lifecycle
onMounted(() => {
  loadRecentActivity()
})
</script>