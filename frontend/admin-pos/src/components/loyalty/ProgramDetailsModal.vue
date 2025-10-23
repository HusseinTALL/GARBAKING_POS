<!--
  Program Details Modal Component
  Shows comprehensive information about a specific loyalty program
-->

<template>
  <div
    v-if="isOpen && program"
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-medium text-gray-900" id="modal-title">
                {{ program.name }}
              </h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  program.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ program.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Program Overview -->
          <div class="mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-700">{{ program.description }}</p>
              <div class="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                <div>
                  <span class="font-medium">Created:</span>
                  {{ formatDate(program.createdAt) }}
                </div>
                <div>
                  <span class="font-medium">Type:</span>
                  {{ formatProgramType(program.type) }}
                </div>
                <div>
                  <span class="font-medium">Members:</span>
                  {{ program.memberCount || 0 }}
                </div>
              </div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Key Metrics</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">{{ program.memberCount || 0 }}</div>
                <div class="text-sm text-gray-600">Active Members</div>
                <div class="text-xs text-green-600 mt-1">+12% this month</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">{{ program.totalPointsIssued || 0 }}</div>
                <div class="text-sm text-gray-600">Points Issued</div>
                <div class="text-xs text-blue-600 mt-1">{{ (program.totalPointsIssued || 0) * 0.1 }} today</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600">{{ program.totalRedemptions || 0 }}</div>
                <div class="text-sm text-gray-600">Redemptions</div>
                <div class="text-xs text-purple-600 mt-1">${{ ((program.totalRedemptions || 0) * 5.5).toFixed(0) }} value</div>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-orange-600">{{ program.engagementRate || 68 }}%</div>
                <div class="text-sm text-gray-600">Engagement Rate</div>
                <div class="text-xs text-orange-600 mt-1">Above average</div>
              </div>
            </div>
          </div>

          <!-- Program Configuration -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Program Configuration</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Point System -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 mb-3">Point System</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Points per Dollar:</span>
                    <span class="font-medium">{{ program.pointsPerDollar }}x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Point Value:</span>
                    <span class="font-medium">${{ (program.pointValue || 0.01).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Min Redemption:</span>
                    <span class="font-medium">{{ program.minPointsRedeem }} points</span>
                  </div>
                </div>
              </div>

              <!-- Bonus Points -->
              <div class="border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 mb-3">Bonus Points</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Signup Bonus:</span>
                    <span class="font-medium">{{ program.signupBonus }} points</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Birthday Bonus:</span>
                    <span class="font-medium">{{ program.birthdayBonus }} points</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Referral Bonus:</span>
                    <span class="font-medium">{{ program.referralBonus || 0 }} points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Membership Tiers -->
          <div v-if="program.tiers && program.tiers.length > 0" class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Membership Tiers</h4>
            <div class="space-y-3">
              <div
                v-for="(tier, index) in program.tiers"
                :key="tier.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: tier.color || '#6B7280' }"
                    ></div>
                    <h5 class="font-medium text-gray-900">{{ tier.name }}</h5>
                    <span class="text-sm text-gray-500">
                      ({{ tier.memberCount || 0 }} members)
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">
                      ${{ tier.minSpent.toLocaleString() }}+ spent
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ tier.pointMultiplier }}x point multiplier
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-600">{{ tier.benefits }}</p>
              </div>
            </div>
          </div>

          <!-- Program Settings -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Program Settings</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Auto-enroll new customers</span>
                  <span class="text-sm font-medium">
                    {{ program.autoEnroll ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Points transfer allowed</span>
                  <span class="text-sm font-medium">
                    {{ program.allowPointsTransfer ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Program status</span>
                  <span class="text-sm font-medium">
                    {{ program.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Last updated</span>
                  <span class="text-sm font-medium">
                    {{ formatDate(program.updatedAt || program.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="space-y-3">
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="flex items-start space-x-3"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-2 h-2 rounded-full mt-2"
                      :class="{
                        'bg-green-500': activity.type === 'enrollment',
                        'bg-blue-500': activity.type === 'redemption',
                        'bg-yellow-500': activity.type === 'tier_upgrade',
                        'bg-purple-500': activity.type === 'bonus_points'
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

          <!-- Performance Chart Placeholder -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-4">Performance Trends</h4>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <svg class="mx-auto w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p class="text-sm text-gray-500">Chart integration pending</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="exportProgramData"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Export Data
          </button>
          <button
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoyaltyProgram } from '@/services/loyalty'

interface Props {
  isOpen: boolean
  program: LoyaltyProgram | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// Mock recent activity data
const recentActivity = ref([
  {
    id: '1',
    type: 'enrollment',
    description: 'New member Sarah Johnson enrolled',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '2',
    type: 'redemption',
    description: 'Mike Chen redeemed 500 points for $5 discount',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    type: 'tier_upgrade',
    description: 'Emma Davis upgraded from Silver to Gold tier',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: '4',
    type: 'bonus_points',
    description: 'Birthday bonus awarded to Alex Brown',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
])

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

const formatProgramType = (type: string) => {
  const formatted = {
    'points': 'Points-Based',
    'tier': 'Tier-Based',
    'cashback': 'Cashback',
    'hybrid': 'Hybrid'
  }
  return formatted[type as keyof typeof formatted] || type
}

const exportProgramData = () => {
  if (!props.program) return

  // Create CSV data for the program
  const csvData = [
    ['Program Name', props.program.name],
    ['Type', formatProgramType(props.program.type || 'points')],
    ['Status', props.program.isActive ? 'Active' : 'Inactive'],
    ['Points per Dollar', props.program.pointsPerDollar],
    ['Min Points to Redeem', props.program.minPointsRedeem],
    ['Signup Bonus', props.program.signupBonus],
    ['Birthday Bonus', props.program.birthdayBonus],
    ['Member Count', props.program.memberCount || 0],
    ['Total Points Issued', props.program.totalPointsIssued || 0],
    ['Total Redemptions', props.program.totalRedemptions || 0],
    ['Created Date', formatDate(props.program.createdAt)]
  ]

  const csvContent = csvData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.program.name.toLowerCase().replace(/\s+/g, '-')}-details.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>