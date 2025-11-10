<!--
  Export Modal Component
  Handles exporting loyalty program data in various formats
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Export Loyalty Data
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

          <form @submit.prevent="startExport">
            <!-- Export Type -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">What would you like to export?</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeCustomers"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Customer loyalty profiles</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includePrograms"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Loyalty programs and tiers</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeRewards"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Rewards and redemptions</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeTransactions"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Point transactions history</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeAnalytics"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Analytics and reports</span>
                </label>
              </div>
            </div>

            <!-- Date Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    v-model="exportOptions.fromDate"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    v-model="exportOptions.toDate"
                    type="date"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Export Format -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    v-model="exportOptions.format"
                    type="radio"
                    value="csv"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">CSV</div>
                    <div class="text-xs text-gray-500">Comma-separated values</div>
                  </div>
                </label>
                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    v-model="exportOptions.format"
                    type="radio"
                    value="xlsx"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">Excel</div>
                    <div class="text-xs text-gray-500">Microsoft Excel format</div>
                  </div>
                </label>
                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    v-model="exportOptions.format"
                    type="radio"
                    value="json"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">JSON</div>
                    <div class="text-xs text-gray-500">JavaScript Object Notation</div>
                  </div>
                </label>
                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    v-model="exportOptions.format"
                    type="radio"
                    value="pdf"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">PDF</div>
                    <div class="text-xs text-gray-500">Formatted report</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Additional Options -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Additional Options</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includePersonalInfo"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Include personal information (name, email, phone)</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.anonymize"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Anonymize customer data</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeSummary"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Include summary statistics</span>
                </label>
              </div>
            </div>

            <!-- Progress Bar (shown during export) -->
            <div v-if="isExporting" class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Exporting data...</span>
                <span class="text-sm text-gray-500">{{ exportProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${exportProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ exportStatus }}</p>
            </div>

            <!-- Export Summary -->
            <div v-if="!isExporting" class="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 class="text-sm font-medium text-blue-900 mb-2">Export Preview</h4>
              <div class="text-xs text-blue-800 space-y-1">
                <div v-if="exportOptions.includeCustomers">• Customer loyalty profiles</div>
                <div v-if="exportOptions.includePrograms">• Loyalty programs and tiers</div>
                <div v-if="exportOptions.includeRewards">• Rewards and redemptions</div>
                <div v-if="exportOptions.includeTransactions">• Point transactions history</div>
                <div v-if="exportOptions.includeAnalytics">• Analytics and reports</div>
                <div class="mt-2 font-medium">
                  Format: {{ exportOptions.format.toUpperCase() }} |
                  Date range: {{ exportOptions.fromDate || 'All time' }} - {{ exportOptions.toDate || 'Present' }}
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            v-if="!isExporting"
            @click="startExport"
            :disabled="!canExport"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
          >
            Start Export
          </button>
          <button
            v-if="isExporting"
            @click="cancelExport"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel Export
          </button>
          <button
            @click="closeModal"
            :disabled="isExporting"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// State
const exportOptions = ref({
  includeCustomers: true,
  includePrograms: true,
  includeRewards: true,
  includeTransactions: false,
  includeAnalytics: false,
  fromDate: '',
  toDate: '',
  format: 'csv',
  includePersonalInfo: true,
  anonymize: false,
  includeSummary: true
})

const isExporting = ref(false)
const exportProgress = ref(0)
const exportStatus = ref('')

// Computed
const canExport = computed(() => {
  return (
    exportOptions.value.includeCustomers ||
    exportOptions.value.includePrograms ||
    exportOptions.value.includeRewards ||
    exportOptions.value.includeTransactions ||
    exportOptions.value.includeAnalytics
  )
})

// Methods
const closeModal = () => {
  if (!isExporting.value) {
    emit('close')
  }
}

const startExport = async () => {
  if (!canExport.value) return

  isExporting.value = true
  exportProgress.value = 0
  exportStatus.value = 'Preparing export...'

  try {
    // Simulate export process
    const steps = [
      'Preparing export...',
      'Gathering customer data...',
      'Processing loyalty programs...',
      'Collecting rewards data...',
      'Generating file...',
      'Finalizing export...'
    ]

    for (let i = 0; i < steps.length; i++) {
      exportStatus.value = steps[i]
      exportProgress.value = ((i + 1) / steps.length) * 100
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Download the file (simulated)
    downloadFile()

    isExporting.value = false
    exportProgress.value = 100
    exportStatus.value = 'Export completed successfully!'

    setTimeout(() => {
      closeModal()
    }, 2000)

  } catch (error) {
    isExporting.value = false
    exportStatus.value = 'Export failed. Please try again.'
    alert('Export failed. Please try again.')
  }
}

const cancelExport = () => {
  isExporting.value = false
  exportProgress.value = 0
  exportStatus.value = ''
}

const downloadFile = () => {
  // Create a mock file for download
  const filename = `loyalty-export-${new Date().toISOString().split('T')[0]}.${exportOptions.value.format}`
  const content = generateMockContent()

  const blob = new Blob([content], { type: getMimeType() })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const getMimeType = () => {
  const mimeTypes = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json',
    pdf: 'application/pdf'
  }
  return mimeTypes[exportOptions.value.format as keyof typeof mimeTypes] || 'text/plain'
}

const generateMockContent = () => {
  if (exportOptions.value.format === 'csv') {
    return 'Customer ID,Name,Email,Points,Tier,Join Date\n1,John Doe,john@example.com,1250,Gold,2024-01-15\n2,Jane Smith,jane@example.com,750,Silver,2024-02-20'
  } else if (exportOptions.value.format === 'json') {
    return JSON.stringify({
      export_date: new Date().toISOString(),
      customers: [
        { id: 1, name: 'John Doe', email: 'john@example.com', points: 1250, tier: 'Gold' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', points: 750, tier: 'Silver' }
      ]
    }, null, 2)
  }
  return 'Loyalty program export data'
}
</script>
