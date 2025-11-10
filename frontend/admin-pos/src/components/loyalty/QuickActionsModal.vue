<!--
  Quick Actions Modal Component
  Provides quick access to common loyalty management tasks
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Quick Actions
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

          <!-- Quick Actions Grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Award Bonus Points -->
            <button
              @click="showBonusPointsModal"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">Award Points</span>
              <span class="text-xs text-gray-500 mt-1">Bonus points to customer</span>
            </button>

            <!-- Create Campaign -->
            <button
              @click="showCampaignModal"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">New Campaign</span>
              <span class="text-xs text-gray-500 mt-1">Promotional campaign</span>
            </button>

            <!-- Manual Enrollment -->
            <button
              @click="showEnrollmentModal"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">Enroll Customer</span>
              <span class="text-xs text-gray-500 mt-1">Manual enrollment</span>
            </button>

            <!-- Tier Upgrade -->
            <button
              @click="showTierUpgradeModal"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">Tier Upgrade</span>
              <span class="text-xs text-gray-500 mt-1">Manual tier change</span>
            </button>

            <!-- Bulk Import -->
            <button
              @click="showBulkImportModal"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">Bulk Import</span>
              <span class="text-xs text-gray-500 mt-1">Import customer data</span>
            </button>

            <!-- Generate Report -->
            <button
              @click="generateQuickReport"
              class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">Quick Report</span>
              <span class="text-xs text-gray-500 mt-1">Generate summary</span>
            </button>
          </div>

          <!-- Recent Quick Actions -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Recent Actions</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div
                v-for="action in recentActions"
                :key="action.id"
                class="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-blue-500': action.type === 'bonus_points',
                      'bg-green-500': action.type === 'campaign',
                      'bg-purple-500': action.type === 'enrollment',
                      'bg-yellow-500': action.type === 'tier_upgrade'
                    }"
                  ></div>
                  <span class="text-gray-900">{{ action.description }}</span>
                </div>
                <span class="text-gray-500 text-xs">{{ formatDate(action.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="closeModal"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
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

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// State
const recentActions = ref([
  {
    id: '1',
    type: 'bonus_points',
    description: 'Awarded 100 bonus points to Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '2',
    type: 'enrollment',
    description: 'Enrolled Mike Chen in Gold tier program',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    type: 'tier_upgrade',
    description: 'Upgraded Emma Davis to Platinum tier',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
])

// Methods
const closeModal = () => {
  emit('close')
}

const showBonusPointsModal = () => {
  // Implement bonus points modal
  alert('Bonus points modal will be implemented')
  closeModal()
}

const showCampaignModal = () => {
  // Implement campaign modal
  alert('Campaign modal will be implemented')
  closeModal()
}

const showEnrollmentModal = () => {
  // Implement enrollment modal
  alert('Enrollment modal will be implemented')
  closeModal()
}

const showTierUpgradeModal = () => {
  // Implement tier upgrade modal
  alert('Tier upgrade modal will be implemented')
  closeModal()
}

const showBulkImportModal = () => {
  // Implement bulk import modal
  alert('Bulk import modal will be implemented')
  closeModal()
}

const generateQuickReport = () => {
  // Generate and download quick report
  alert('Quick report will be generated')
  closeModal()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
