<!--
  Loyalty Program Administration Dashboard
  Main interface for managing all aspects of the loyalty program
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- Header -->
    <div class="flex-none bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Loyalty Program</h1>
          <p class="text-sm text-gray-600 mt-1">Manage customer loyalty programs, rewards, and redemptions</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="exportData"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export Data
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex-none bg-white border-b border-gray-200 px-6">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Customer Enrollment Tab -->
      <div v-if="activeTab === 'customers'">
        <CustomerEnrollment />
      </div>

      <!-- Tier Management Tab -->
      <div v-if="activeTab === 'tiers'">
        <TierManagement />
      </div>

      <!-- Campaigns Tab -->
      <div v-if="activeTab === 'campaigns'">
        <CampaignManagement />
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'">
        <LoyaltyAnalytics />
      </div>
    </div>

    <!-- Export Modal -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showExportModal = false"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Loyalty Data</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              v-model="exportFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CSV">CSV</option>
              <option value="EXCEL">Excel</option>
            </select>
          </div>

          <div class="flex items-center space-x-3">
            <button
              @click="handleExport"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Export
            </button>
            <button
              @click="showExportModal = false"
              class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import CustomerEnrollment from '@/components/loyalty/CustomerEnrollment.vue'
import TierManagement from '@/components/loyalty/TierManagement.vue'
import CampaignManagement from '@/components/loyalty/CampaignManagement.vue'
import LoyaltyAnalytics from '@/components/loyalty/LoyaltyAnalytics.vue'

const loyaltyStore = useLoyaltyStore()

// State
const activeTab = ref('customers')
const showExportModal = ref(false)
const exportFormat = ref<'CSV' | 'EXCEL'>('EXCEL')

const tabs = computed(() => [
  { id: 'customers', label: 'Customer Enrollment', count: loyaltyStore.customers.length },
  { id: 'tiers', label: 'Tier Management' },
  { id: 'campaigns', label: 'Campaigns', count: loyaltyStore.campaigns.length },
  { id: 'analytics', label: 'Analytics' }
])

// Methods
const exportData = () => {
  showExportModal.value = true
}

const handleExport = async () => {
  const success = await loyaltyStore.exportData('customers', exportFormat.value)
  if (success) {
    alert(`Data exported successfully as ${exportFormat.value}`)
  } else {
    alert('Failed to export data')
  }
  showExportModal.value = false
}

// Lifecycle
onMounted(async () => {
  await loyaltyStore.fetchPrograms()
  await loyaltyStore.fetchCustomers()
  await loyaltyStore.fetchCampaigns()
})
</script>