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
          <!-- Quick Actions -->
          <button
            @click="showQuickActions = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Quick Actions
          </button>
          <button
            @click="exportData"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
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
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'">
        <LoyaltyOverview />
      </div>

      <!-- Programs Tab -->
      <div v-if="activeTab === 'programs'">
        <ProgramsManager />
      </div>

      <!-- Customers Tab -->
      <div v-if="activeTab === 'customers'">
        <LoyaltyManager />
      </div>

      <!-- Rewards Tab -->
      <div v-if="activeTab === 'rewards'">
        <RewardsManager />
      </div>

      <!-- Redemptions Tab -->
      <div v-if="activeTab === 'redemptions'">
        <RedemptionManager />
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'">
        <LoyaltyAnalytics />
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'">
        <LoyaltySettings />
      </div>
    </div>

    <!-- Quick Actions Modal -->
    <QuickActionsModal
      :is-open="showQuickActions"
      @close="showQuickActions = false"
    />

    <!-- Export Modal -->
    <ExportModal
      :is-open="showExportModal"
      @close="showExportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoyaltyOverview from '@/components/loyalty/LoyaltyOverview.vue'
import ProgramsManager from '@/components/loyalty/ProgramsManager.vue'
import LoyaltyManager from '@/components/loyalty/LoyaltyManager.vue'
import RewardsManager from '@/components/loyalty/RewardsManager.vue'
import RedemptionManager from '@/components/loyalty/RedemptionManager.vue'
import LoyaltyAnalytics from '@/components/loyalty/LoyaltyAnalytics.vue'
import LoyaltySettings from '@/components/loyalty/LoyaltySettings.vue'
import QuickActionsModal from '@/components/loyalty/QuickActionsModal.vue'
import ExportModal from '@/components/loyalty/ExportModal.vue'

// State
const activeTab = ref('overview')
const showQuickActions = ref(false)
const showExportModal = ref(false)

const tabs = ref([
  { id: 'overview', label: 'Overview' },
  { id: 'programs', label: 'Programs', count: 3 },
  { id: 'customers', label: 'Customers', count: 1247 },
  { id: 'rewards', label: 'Rewards', count: 156 },
  { id: 'redemptions', label: 'Redemptions', count: 42 },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' }
])

// Methods
const exportData = () => {
  showExportModal.value = true
}

// Lifecycle
onMounted(() => {
  // Load initial data or perform setup
})
</script>