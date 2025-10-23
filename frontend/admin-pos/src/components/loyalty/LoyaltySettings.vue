<!--
  Loyalty Settings Component
  Manages global loyalty program settings and configurations
-->

<template>
  <div class="space-y-6">
    <!-- Settings Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Loyalty Program Settings</h2>
          <p class="text-sm text-gray-600 mt-1">Configure global settings for your loyalty programs</p>
        </div>
        <button
          @click="saveSettings"
          :disabled="!hasChanges"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- General Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>

      <div class="space-y-6">
        <!-- Program Status -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Loyalty Program</label>
            <p class="text-sm text-gray-600">Allow customers to enroll and participate in loyalty programs</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.programEnabled"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Auto Enrollment -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Auto-Enroll New Customers</label>
            <p class="text-sm text-gray-600">Automatically enroll customers when they create an account</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.autoEnrollment"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Email Notifications -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Email Notifications</label>
            <p class="text-sm text-gray-600">Send email notifications for points earned, tier upgrades, etc.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.emailNotifications"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Point System Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Point System</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Default Points per Dollar</label>
          <input
            v-model.number="settings.defaultPointsPerDollar"
            type="number"
            min="1"
            max="10"
            step="0.1"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">How many points customers earn per dollar spent</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Point Value (Cents)</label>
          <input
            v-model.number="settings.pointValue"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">How much each point is worth in cents when redeemed</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Redemption</label>
          <input
            v-model.number="settings.minRedemptionPoints"
            type="number"
            min="1"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum points required for redemption</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Point Expiry (Days)</label>
          <input
            v-model.number="settings.pointExpiryDays"
            type="number"
            min="0"
            placeholder="0 = Never expire"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Days until points expire (0 = never expire)</p>
        </div>
      </div>
    </div>

    <!-- Bonus Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Bonus Points</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Signup Bonus</label>
          <input
            v-model.number="settings.signupBonus"
            type="number"
            min="0"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Points awarded for joining</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Birthday Bonus</label>
          <input
            v-model.number="settings.birthdayBonus"
            type="number"
            min="0"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Points awarded on birthday</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Referral Bonus</label>
          <input
            v-model.number="settings.referralBonus"
            type="number"
            min="0"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Points for successful referrals</p>
        </div>
      </div>
    </div>

    <!-- Tier Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tier System</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Tier System</label>
            <p class="text-sm text-gray-600">Allow customers to progress through membership tiers</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.tierSystemEnabled"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div v-if="settings.tierSystemEnabled" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tier Calculation Method</label>
            <select
              v-model="settings.tierCalculationMethod"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="total_spent">Total Amount Spent</option>
              <option value="points_earned">Total Points Earned</option>
              <option value="visit_frequency">Visit Frequency</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tier Reset Period</label>
            <select
              v-model="settings.tierResetPeriod"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="never">Never Reset</option>
              <option value="yearly">Annual Reset</option>
              <option value="quarterly">Quarterly Reset</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Integration Settings -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">SMS Notifications</label>
            <p class="text-sm text-gray-600">Send SMS notifications for important loyalty events</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.smsNotifications"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Third-party Analytics</label>
            <p class="text-sm text-gray-600">Share loyalty data with analytics platforms</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.analyticsIntegration"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <h3 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-red-900">Reset All Customer Points</label>
            <p class="text-sm text-red-600">This will reset all customer points to zero. This action cannot be undone.</p>
          </div>
          <button
            @click="resetAllPoints"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Reset Points
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-red-900">Export & Delete All Data</label>
            <p class="text-sm text-red-600">Export all loyalty data and permanently delete from system</p>
          </div>
          <button
            @click="exportAndDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Export & Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// State
const settings = ref({
  programEnabled: true,
  autoEnrollment: true,
  emailNotifications: true,
  defaultPointsPerDollar: 1,
  pointValue: 1.0,
  minRedemptionPoints: 100,
  pointExpiryDays: 365,
  signupBonus: 100,
  birthdayBonus: 50,
  referralBonus: 200,
  tierSystemEnabled: true,
  tierCalculationMethod: 'total_spent',
  tierResetPeriod: 'yearly',
  smsNotifications: false,
  analyticsIntegration: true
})

const originalSettings = ref({})
const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

// Methods
const loadSettings = async () => {
  // Load settings from API
  originalSettings.value = { ...settings.value }
}

const saveSettings = async () => {
  try {
    // Save settings via API
    console.log('Saving settings:', settings.value)
    originalSettings.value = { ...settings.value }
    alert('Settings saved successfully!')
  } catch (error) {
    alert('Failed to save settings')
  }
}

const resetAllPoints = async () => {
  if (!confirm('Are you sure you want to reset all customer points? This action cannot be undone.')) {
    return
  }

  if (!confirm('This will reset ALL customer points to zero. Type CONFIRM to proceed.')) {
    return
  }

  try {
    // Call API to reset points
    alert('All customer points have been reset')
  } catch (error) {
    alert('Failed to reset points')
  }
}

const exportAndDelete = async () => {
  if (!confirm('This will permanently delete all loyalty data. Are you sure?')) {
    return
  }

  try {
    // Export and delete data
    alert('Data exported and deleted successfully')
  } catch (error) {
    alert('Failed to export and delete data')
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>