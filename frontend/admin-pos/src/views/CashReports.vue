<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
          Cash Management Reports
        </h1>
        <div class="flex items-center space-x-3">
          <select
            v-model="selectedReport"
            class="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily Report</option>
            <option value="variances">Variance Alerts</option>
            <option value="cashflow">Cash Flow</option>
            <option value="settings">Alert Settings</option>
          </select>
          <button
            @click="refreshData"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Daily Report -->
      <div v-if="selectedReport === 'daily'" class="space-y-6">
        <!-- Date Selector -->
        <div class="bg-gray-800 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Report Date</label>
          <input
            v-model="selectedDate"
            type="date"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadDailyReport"
          />
        </div>

        <!-- Daily Report Summary -->
        <div v-if="dailyReport" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Sales -->
          <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-400 text-sm font-medium mb-1">Total Sales</p>
                <p class="text-3xl font-bold text-green-400">
                  ${{ dailyReport.totalSales?.toFixed(2) || '0.00' }}
                </p>
                <p class="text-xs text-green-300 mt-1">{{ dailyReport.saleCount || 0 }} transactions</p>
              </div>
              <TrendingUp class="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </div>

          <!-- Net Cash Flow -->
          <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-400 text-sm font-medium mb-1">Net Cash Flow</p>
                <p class="text-3xl font-bold text-blue-400">
                  ${{ dailyReport.netCashFlow?.toFixed(2) || '0.00' }}
                </p>
                <p class="text-xs text-blue-300 mt-1">After drops & payouts</p>
              </div>
              <DollarSign class="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>

          <!-- Sessions -->
          <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-400 text-sm font-medium mb-1">Sessions</p>
                <p class="text-3xl font-bold text-purple-400">
                  {{ dailyReport.totalSessions || 0 }}
                </p>
                <p class="text-xs text-purple-300 mt-1">
                  {{ dailyReport.openSessions || 0 }} open, {{ dailyReport.closedSessions || 0 }} closed
                </p>
              </div>
              <Clock class="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </div>

          <!-- Variance Status -->
          <div :class="[
            'rounded-lg p-6 border',
            dailyReport.shortSessions > 0 ? 'bg-gradient-to-br from-red-900 to-red-800 border-red-500' :
            dailyReport.overSessions > 0 ? 'bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500' :
            'bg-gradient-to-br from-green-900 to-green-800 border-green-500'
          ]">
            <div class="flex items-center justify-between">
              <div>
                <p :class="[
                  'text-sm font-medium mb-1',
                  dailyReport.shortSessions > 0 ? 'text-red-400' :
                  dailyReport.overSessions > 0 ? 'text-yellow-400' :
                  'text-green-400'
                ]">Total Variance</p>
                <p :class="[
                  'text-3xl font-bold',
                  dailyReport.shortSessions > 0 ? 'text-red-400' :
                  dailyReport.overSessions > 0 ? 'text-yellow-400' :
                  'text-green-400'
                ]">
                  ${{ Math.abs(dailyReport.totalVariance || 0).toFixed(2) }}
                </p>
                <p :class="[
                  'text-xs mt-1',
                  dailyReport.shortSessions > 0 ? 'text-red-300' :
                  dailyReport.overSessions > 0 ? 'text-yellow-300' :
                  'text-green-300'
                ]">
                  {{ dailyReport.balancedSessions || 0 }} balanced
                </p>
              </div>
              <AlertTriangle :class="[
                'w-12 h-12 opacity-50',
                dailyReport.shortSessions > 0 ? 'text-red-400' :
                dailyReport.overSessions > 0 ? 'text-yellow-400' :
                'text-green-400'
              ]" />
            </div>
          </div>
        </div>

        <!-- Transaction Breakdown -->
        <div v-if="dailyReport" class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-bold text-white mb-4">Transaction Breakdown</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <p class="text-gray-400 text-sm">Sales</p>
              <p class="text-2xl font-bold text-green-400">{{ dailyReport.saleCount || 0 }}</p>
              <p class="text-xs text-gray-500">${{ dailyReport.totalSales?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-400 text-sm">Refunds</p>
              <p class="text-2xl font-bold text-red-400">{{ dailyReport.refundCount || 0 }}</p>
              <p class="text-xs text-gray-500">${{ dailyReport.totalRefunds?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-400 text-sm">Drops</p>
              <p class="text-2xl font-bold text-blue-400">{{ dailyReport.dropCount || 0 }}</p>
              <p class="text-xs text-gray-500">${{ dailyReport.totalDrops?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-400 text-sm">Payouts</p>
              <p class="text-2xl font-bold text-yellow-400">{{ dailyReport.payoutCount || 0 }}</p>
              <p class="text-xs text-gray-500">${{ dailyReport.totalPayouts?.toFixed(2) || '0.00' }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-400 text-sm">No Sale</p>
              <p class="text-2xl font-bold text-gray-400">{{ dailyReport.noSaleCount || 0 }}</p>
              <p class="text-xs text-gray-500">-</p>
            </div>
          </div>
        </div>

        <!-- Session Details -->
        <div v-if="dailyReport && dailyReport.sessions && dailyReport.sessions.length > 0" class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-bold text-white mb-4">Session Details</h3>
          <div class="space-y-3">
            <div
              v-for="session in dailyReport.sessions"
              :key="session.sessionId"
              class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <span class="text-white font-medium">Session #{{ session.sessionId }}</span>
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      session.status === 'OPEN' ? 'bg-green-900 text-green-400' : 'bg-gray-600 text-gray-300'
                    ]">
                      {{ session.status }}
                    </span>
                    <span v-if="session.varianceStatus" :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      session.varianceStatus === 'BALANCED' ? 'bg-green-900 text-green-400' :
                      session.varianceStatus === 'SHORT' ? 'bg-red-900 text-red-400' :
                      'bg-yellow-900 text-yellow-400'
                    ]">
                      {{ session.varianceStatus }}
                    </span>
                  </div>
                  <div class="flex items-center gap-6 mt-2 text-sm text-gray-400">
                    <span>{{ session.userName }}</span>
                    <span>{{ session.drawerName }}</span>
                    <span>{{ session.totalTransactions }} transactions</span>
                    <span v-if="session.durationMinutes">{{ Math.floor(session.durationMinutes / 60) }}h {{ session.durationMinutes % 60 }}m</span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-400">Expected</p>
                  <p class="text-lg font-bold text-blue-400">${{ session.expectedCash?.toFixed(2) || '0.00' }}</p>
                  <p v-if="session.variance" :class="[
                    'text-sm font-medium',
                    session.variance === 0 ? 'text-green-400' :
                    session.variance < 0 ? 'text-red-400' :
                    'text-yellow-400'
                  ]">
                    {{ session.variance >= 0 ? '+' : '' }}${{ session.variance?.toFixed(2) || '0.00' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Variance Alerts -->
      <div v-if="selectedReport === 'variances'" class="space-y-6">
        <VarianceAlertsComponent />
      </div>

      <!-- Cash Flow -->
      <div v-if="selectedReport === 'cashflow'" class="space-y-6">
        <div class="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
          <TrendingUp class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg">Cash Flow Analysis</p>
          <p class="text-sm mt-2">Coming soon...</p>
        </div>
      </div>

      <!-- Alert Settings -->
      <div v-if="selectedReport === 'settings'" class="space-y-6">
        <AlertPreferencesComponent />
      </div>

      <!-- Empty State -->
      <div v-if="!dailyReport && !isLoading && selectedReport === 'daily'" class="text-center py-12">
        <FileText class="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p class="text-gray-400">No data available for selected date</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RotateCw, TrendingUp, DollarSign, Clock, AlertTriangle, FileText } from 'lucide-vue-next'
import { cashReportApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'
import VarianceAlertsComponent from '@/components/reports/VarianceAlerts.vue'
import AlertPreferencesComponent from '@/components/reports/AlertPreferences.vue'

const toast = useToast()

// State
const selectedReport = ref('daily')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const dailyReport = ref<any>(null)
const isLoading = ref(false)

// Methods
const loadDailyReport = async () => {
  isLoading.value = true
  try {
    dailyReport.value = await cashReportApi.getDailyReport(selectedDate.value)
  } catch (error: any) {
    console.error('Failed to load daily report:', error)
    toast.error('Failed to load daily report')
    dailyReport.value = null
  } finally {
    isLoading.value = false
  }
}

const refreshData = async () => {
  if (selectedReport.value === 'daily') {
    await loadDailyReport()
  }
  toast.success('Data refreshed')
}

// Lifecycle
onMounted(() => {
  loadDailyReport()
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
