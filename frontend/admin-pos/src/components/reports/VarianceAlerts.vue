<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AlertTriangle, AlertCircle, CheckCircle, XCircle, RefreshCw, Eye, Check, Download, FileSpreadsheet } from 'lucide-vue-next'
import { varianceAlertApi, cashReportApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const toast = useToast()
const authStore = useAuthStore()

const alerts = ref<any[]>([])
const isLoading = ref(false)
const isExporting = ref(false)
const filterStatus = ref<string>('ALL')
const selectedAlert = ref<any>(null)
const showResolveModal = ref(false)
const resolutionNotes = ref('')

// Date range for exports
const today = new Date()
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(today.getDate() - 7)

const startDate = ref(sevenDaysAgo.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])

const statusFilters = [
  { value: 'ALL', label: 'All Alerts' },
  { value: 'UNACKNOWLEDGED', label: 'Unacknowledged' },
  { value: 'UNRESOLVED', label: 'Unresolved' },
  { value: 'HIGH_PRIORITY', label: 'High Priority' }
]

const filteredAlerts = computed(() => {
  // Alerts are already filtered by API, just return them
  return alerts.value
})

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'text-red-500 bg-red-900'
    case 'HIGH': return 'text-orange-500 bg-orange-900'
    case 'MEDIUM': return 'text-yellow-500 bg-yellow-900'
    case 'LOW': return 'text-blue-500 bg-blue-900'
    default: return 'text-gray-500 bg-gray-900'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return AlertCircle
    case 'MEDIUM':
      return AlertTriangle
    default:
      return AlertTriangle
  }
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchAlerts = async () => {
  isLoading.value = true
  try {
    switch (filterStatus.value) {
      case 'UNACKNOWLEDGED':
        alerts.value = await varianceAlertApi.getUnacknowledgedAlerts()
        break
      case 'UNRESOLVED':
        alerts.value = await varianceAlertApi.getUnresolvedAlerts()
        break
      case 'HIGH_PRIORITY':
        alerts.value = await varianceAlertApi.getHighPriorityAlerts()
        break
      default:
        alerts.value = await varianceAlertApi.getUnresolvedAlerts()
    }
  } catch (error: any) {
    console.error('Failed to fetch alerts:', error)
    toast.error('Failed to load variance alerts')
  } finally {
    isLoading.value = false
  }
}

const acknowledgeAlert = async (alert: any) => {
  try {
    await varianceAlertApi.acknowledgeAlert(alert.alertId, authStore.user?.id || 1)
    toast.success('Alert acknowledged')
    await fetchAlerts()
  } catch (error: any) {
    console.error('Failed to acknowledge alert:', error)
    toast.error('Failed to acknowledge alert')
  }
}

const openResolveModal = (alert: any) => {
  selectedAlert.value = alert
  resolutionNotes.value = ''
  showResolveModal.value = true
}

const resolveAlert = async () => {
  if (!selectedAlert.value) return

  if (!resolutionNotes.value.trim()) {
    toast.error('Please provide resolution notes')
    return
  }

  try {
    await varianceAlertApi.resolveAlert(
      selectedAlert.value.alertId,
      authStore.user?.id || 1,
      resolutionNotes.value
    )
    toast.success('Alert resolved')
    showResolveModal.value = false
    selectedAlert.value = null
    resolutionNotes.value = ''
    await fetchAlerts()
  } catch (error: any) {
    console.error('Failed to resolve alert:', error)
    toast.error('Failed to resolve alert')
  }
}

const exportToPDF = async () => {
  isExporting.value = true
  try {
    const blob = await cashReportApi.exportVarianceReportToPDF(startDate.value, endDate.value)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `variance-report_${startDate.value}_to_${endDate.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('PDF report downloaded successfully')
  } catch (error: any) {
    console.error('Failed to export PDF:', error)
    toast.error('Failed to export variance report to PDF')
  } finally {
    isExporting.value = false
  }
}

const exportToExcel = async () => {
  isExporting.value = true
  try {
    const blob = await cashReportApi.exportVarianceReportToExcel(startDate.value, endDate.value)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `variance-report_${startDate.value}_to_${endDate.value}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Excel report downloaded successfully')
  } catch (error: any) {
    console.error('Failed to export Excel:', error)
    toast.error('Failed to export variance report to Excel')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  fetchAlerts()
})

defineExpose({ refresh: fetchAlerts })
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-white">Variance Alerts</h3>
      <div class="flex items-center gap-3">
        <select
          v-model="filterStatus"
          @change="fetchAlerts"
          class="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="filter in statusFilters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>
        <button
          @click="fetchAlerts"
          :disabled="isLoading"
          class="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw :size="20" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>

    <!-- Export Controls -->
    <div class="bg-gray-700 rounded-lg p-4 mb-6">
      <div class="flex items-end gap-3">
        <div class="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              v-model="startDate"
              type="date"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              v-model="endDate"
              type="date"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          @click="exportToPDF"
          :disabled="isExporting"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Download class="w-4 h-4" />
          {{ isExporting ? 'Exporting...' : 'Export PDF' }}
        </button>
        <button
          @click="exportToExcel"
          :disabled="isExporting"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FileSpreadsheet class="w-4 h-4" />
          {{ isExporting ? 'Exporting...' : 'Export Excel' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredAlerts.length === 0 && !isLoading" class="text-center py-12">
      <CheckCircle :size="48" class="mx-auto text-green-600 mb-4" />
      <p class="text-gray-400">No variance alerts found</p>
      <p class="text-sm text-gray-500 mt-2">All cash sessions are balanced</p>
    </div>

    <!-- Alerts List -->
    <div v-else class="space-y-3">
      <div
        v-for="alert in filteredAlerts"
        :key="alert.alertId"
        class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
      >
        <div class="flex items-start gap-4">
          <!-- Severity Icon -->
          <div :class="['p-2 rounded-lg', getSeverityColor(alert.severity)]">
            <component :is="getSeverityIcon(alert.severity)" :size="24" />
          </div>

          <!-- Alert Details -->
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span :class="['px-2 py-1 rounded text-xs font-medium', getSeverityColor(alert.severity)]">
                    {{ alert.severity }}
                  </span>
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    alert.varianceStatus === 'SHORT' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
                  ]">
                    {{ alert.varianceStatus }}
                  </span>
                  <span v-if="alert.acknowledged" class="px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-400">
                    ACKNOWLEDGED
                  </span>
                </div>

                <p class="text-white font-medium mb-2">{{ alert.message }}</p>

                <div class="text-sm text-gray-400 space-y-1">
                  <p>{{ alert.drawerName }} - {{ alert.userName }}</p>
                  <p>Session #{{ alert.sessionId }} - {{ formatDateTime(alert.createdAt) }}</p>
                  <p v-if="alert.reason" class="text-gray-300">Reason: {{ alert.reason }}</p>
                </div>
              </div>

              <!-- Amount -->
              <div class="text-right">
                <p :class="[
                  'text-2xl font-bold',
                  alert.variance < 0 ? 'text-red-400' : 'text-yellow-400'
                ]">
                  {{ alert.variance >= 0 ? '+' : '' }}${{ Math.abs(alert.variance).toFixed(2) }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ Math.abs(alert.variancePercentage).toFixed(2) }}% variance
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 mt-4">
              <button
                v-if="!alert.acknowledged"
                @click="acknowledgeAlert(alert)"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1"
              >
                <Eye :size="14" />
                Acknowledge
              </button>
              <button
                v-if="!alert.resolved"
                @click="openResolveModal(alert)"
                class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1"
              >
                <Check :size="14" />
                Resolve
              </button>
              <span v-if="alert.resolved" class="px-3 py-1 bg-green-900 text-green-400 text-sm rounded flex items-center gap-1">
                <CheckCircle :size="14" />
                Resolved
              </span>
            </div>

            <!-- Resolution Details -->
            <div v-if="alert.resolved" class="mt-3 p-3 bg-gray-600 rounded">
              <p class="text-xs text-gray-400 mb-1">Resolution by {{ alert.resolvedBy }} on {{ formatDateTime(alert.resolvedAt) }}</p>
              <p class="text-sm text-gray-300">{{ alert.resolutionNotes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resolve Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Resolve Variance Alert</h3>

        <div v-if="selectedAlert" class="mb-4 p-3 bg-gray-700 rounded">
          <p class="text-sm text-gray-400">Alert #{{ selectedAlert.alertId }}</p>
          <p class="text-white font-medium">{{ selectedAlert.message }}</p>
          <p class="text-lg font-bold mt-2" :class="selectedAlert.variance < 0 ? 'text-red-400' : 'text-yellow-400'">
            {{ selectedAlert.variance >= 0 ? '+' : '' }}${{ Math.abs(selectedAlert.variance).toFixed(2) }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Resolution Notes (Required)</label>
            <textarea
              v-model="resolutionNotes"
              rows="4"
              class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Explain how this variance was resolved..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="showResolveModal = false"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              @click="resolveAlert"
              :disabled="!resolutionNotes.trim()"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              Resolve Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gray-650 {
  background-color: #3f4654;
}
</style>
