<!--
  Staff Performance Dashboard - Comprehensive staff analytics
  Displays performance metrics, rankings, and achievements
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Staff Performance</h2>
        <p class="text-slate-600 mt-1">Track employee productivity and achievements</p>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Period Selector -->
        <select
          v-model="selectedPeriod"
          @change="fetchPerformanceData"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>

        <button
          @click="exportPerformanceData"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download class="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>

    <!-- Custom Date Range -->
    <div v-if="selectedPeriod === 'custom'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
          <input
            v-model="customRange.start"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">End Date</label>
          <input
            v-model="customRange.end"
            type="date"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <button
        @click="fetchPerformanceData"
        class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Apply Custom Range
      </button>
    </div>

    <!-- Top Performers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Top Sales -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <Trophy class="w-8 h-8" />
          <span class="text-sm font-medium opacity-90">Top Sales</span>
        </div>
        <div v-if="topPerformers.sales" class="space-y-2">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {{ getInitials(topPerformers.sales.userName) }}
            </div>
            <div>
              <div class="font-semibold">{{ topPerformers.sales.userName }}</div>
              <div class="text-sm opacity-90">{{ formatCurrency(topPerformers.sales.totalSales) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Speed -->
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <Zap class="w-8 h-8" />
          <span class="text-sm font-medium opacity-90">Fastest Service</span>
        </div>
        <div v-if="topPerformers.speed" class="space-y-2">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {{ getInitials(topPerformers.speed.userName) }}
            </div>
            <div>
              <div class="font-semibold">{{ topPerformers.speed.userName }}</div>
              <div class="text-sm opacity-90">{{ topPerformers.speed.avgTime }}s avg</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Accuracy -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <Target class="w-8 h-8" />
          <span class="text-sm font-medium opacity-90">Best Accuracy</span>
        </div>
        <div v-if="topPerformers.accuracy" class="space-y-2">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {{ getInitials(topPerformers.accuracy.userName) }}
            </div>
            <div>
              <div class="font-semibold">{{ topPerformers.accuracy.userName }}</div>
              <div class="text-sm opacity-90">{{ topPerformers.accuracy.accuracy }}% accurate</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Table -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Rank</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Employee</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Orders</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Sales</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Avg Order Value</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Hours Worked</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Accuracy</th>
              <th class="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="(perf, index) in sortedPerformance"
              :key="perf.userId"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                  <component
                    :is="getRankIcon(index + 1)"
                    :class="getRankColor(index + 1)"
                    class="w-5 h-5"
                  />
                  <span class="font-medium text-slate-900">#{index + 1}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :style="{ backgroundColor: getUserColor(perf.userId) }"
                  >
                    {{ getInitials(getUserName(perf.userId)) }}
                  </div>
                  <div>
                    <div class="font-medium text-slate-900">{{ getUserName(perf.userId) }}</div>
                    <div class="text-sm text-slate-500">{{ getUserRole(perf.userId) }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="text-slate-900">{{ perf.metrics.ordersProcessed }}</span>
              </td>
              <td class="py-4 px-6">
                <span class="text-slate-900 font-medium">{{ formatCurrency(perf.metrics.totalSales) }}</span>
              </td>
              <td class="py-4 px-6">
                <span class="text-slate-900">{{ formatCurrency(perf.metrics.averageOrderValue) }}</span>
              </td>
              <td class="py-4 px-6">
                <span class="text-slate-900">{{ perf.metrics.hoursWorked.toFixed(1) }}h</span>
                <span v-if="perf.metrics.overtimeHours > 0" class="text-xs text-amber-600 ml-1">
                  +{{ perf.metrics.overtimeHours.toFixed(1) }}h
                </span>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full"
                      :class="getAccuracyColor(perf.metrics.accuracy)"
                      :style="{ width: `${perf.metrics.accuracy}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ perf.metrics.accuracy }}%</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <button
                  @click="viewDetails(perf)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Performance Details Modal -->
    <div v-if="selectedPerformance" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedPerformance = null">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                :style="{ backgroundColor: getUserColor(selectedPerformance.userId) }"
              >
                {{ getInitials(getUserName(selectedPerformance.userId)) }}
              </div>
              <div>
                <h3 class="text-xl font-semibold text-slate-900">{{ getUserName(selectedPerformance.userId) }}</h3>
                <p class="text-slate-600">{{ formatDateRange(selectedPerformance.period) }}</p>
              </div>
            </div>
            <button
              @click="selectedPerformance = null"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X class="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ selectedPerformance.metrics.ordersProcessed }}</div>
              <div class="text-sm text-blue-700 mt-1">Orders</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ formatCurrency(selectedPerformance.metrics.totalSales) }}</div>
              <div class="text-sm text-green-700 mt-1">Total Sales</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">{{ selectedPerformance.metrics.hoursWorked.toFixed(1) }}h</div>
              <div class="text-sm text-purple-700 mt-1">Hours Worked</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-amber-600">{{ selectedPerformance.metrics.accuracy }}%</div>
              <div class="text-sm text-amber-700 mt-1">Accuracy</div>
            </div>
          </div>

          <!-- Additional Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 class="text-sm font-medium text-slate-900 mb-3">Performance Metrics</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Average Order Value</span>
                  <span class="font-medium text-slate-900">{{ formatCurrency(selectedPerformance.metrics.averageOrderValue) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Average Transaction Time</span>
                  <span class="font-medium text-slate-900">{{ selectedPerformance.metrics.averageTransactionTime }}s</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Shifts Completed</span>
                  <span class="font-medium text-slate-900">{{ selectedPerformance.metrics.shiftsCompleted }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Overtime Hours</span>
                  <span class="font-medium text-amber-600">{{ selectedPerformance.metrics.overtimeHours.toFixed(1) }}h</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-slate-900 mb-3">Customer Service</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Refunds Processed</span>
                  <span class="font-medium text-slate-900">{{ selectedPerformance.metrics.refundsProcessed }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-600">Refund Amount</span>
                  <span class="font-medium text-red-600">{{ formatCurrency(selectedPerformance.metrics.refundAmount) }}</span>
                </div>
                <div v-if="selectedPerformance.metrics.customerSatisfaction" class="flex items-center justify-between">
                  <span class="text-slate-600">Customer Satisfaction</span>
                  <span class="font-medium text-slate-900">{{ selectedPerformance.metrics.customerSatisfaction.toFixed(1) }}/5.0</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="selectedPerformance.achievements.length > 0" class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-3">Achievements</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="achievement in selectedPerformance.achievements"
                :key="achievement"
                class="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"
              >
                <Award class="w-4 h-4 mr-1" />
                {{ achievement }}
              </span>
            </div>
          </div>

          <!-- Issues -->
          <div v-if="selectedPerformance.issues.length > 0">
            <h4 class="text-sm font-medium text-slate-900 mb-3">Performance Issues</h4>
            <div class="space-y-2">
              <div
                v-for="issue in selectedPerformance.issues"
                :key="issue.id"
                class="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-red-900">{{ formatIssueType(issue.type) }}</span>
                  <span class="text-xs text-red-700">{{ formatDate(issue.date) }}</span>
                </div>
                <p class="text-sm text-red-800">{{ issue.description }}</p>
                <span
                  v-if="issue.resolved"
                  class="inline-flex items-center mt-2 text-xs text-green-700"
                >
                  <CheckCircle class="w-3 h-3 mr-1" />
                  Resolved {{ formatDate(issue.resolvedAt!) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore, type StaffPerformance } from '@/stores/users'
import {
  Trophy,
  Zap,
  Target,
  Download,
  Award,
  CheckCircle,
  X,
  Medal,
  Star
} from 'lucide-vue-next'

const usersStore = useUsersStore()

// State
const selectedPeriod = ref('month')
const customRange = ref({ start: '', end: '' })
const selectedPerformance = ref<StaffPerformance | null>(null)
const performanceData = ref<StaffPerformance[]>([])

// Computed
const sortedPerformance = computed(() => {
  return [...performanceData.value].sort((a, b) => b.metrics.totalSales - a.metrics.totalSales)
})

const topPerformers = computed(() => {
  const sorted = [...performanceData.value]

  return {
    sales: sorted.sort((a, b) => b.metrics.totalSales - a.metrics.totalSales)[0],
    speed: sorted.sort((a, b) => a.metrics.averageTransactionTime - b.metrics.averageTransactionTime)[0],
    accuracy: sorted.sort((a, b) => b.metrics.accuracy - a.metrics.accuracy)[0]
  }
})

// Methods
const fetchPerformanceData = async () => {
  const { start, end } = getPeriodDates()

  // Fetch for all users
  await usersStore.fetchAllStaffPerformance(start, end)

  // Convert Map to array
  performanceData.value = Array.from(usersStore.staffPerformance.values())
}

const getPeriodDates = (): { start: string; end: string } => {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date()

  switch (selectedPeriod.value) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'custom':
      return {
        start: customRange.value.start,
        end: customRange.value.end
      }
  }

  return { start: start.toISOString(), end }
}

const exportPerformanceData = () => {
  const csv = convertToCSV(performanceData.value)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `staff-performance-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const convertToCSV = (data: StaffPerformance[]): string => {
  const headers = ['Employee', 'Orders', 'Total Sales', 'Avg Order Value', 'Hours Worked', 'Accuracy', 'Overtime']
  const rows = data.map(perf => [
    getUserName(perf.userId),
    perf.metrics.ordersProcessed,
    perf.metrics.totalSales,
    perf.metrics.averageOrderValue,
    perf.metrics.hoursWorked.toFixed(2),
    perf.metrics.accuracy,
    perf.metrics.overtimeHours.toFixed(2)
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

const viewDetails = (perf: StaffPerformance) => {
  selectedPerformance.value = perf
}

const getUserName = (userId: string): string => {
  const user = usersStore.users.find(u => u.id === userId)
  return user?.name || 'Unknown User'
}

const getUserRole = (userId: string): string => {
  const user = usersStore.users.find(u => u.id === userId)
  return user?.role || ''
}

const getUserColor = (userId: string): string => {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
  const index = usersStore.users.findIndex(u => u.id === userId)
  return colors[index % colors.length]
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return Medal
  if (rank === 2) return Star
  if (rank === 3) return Award
  return null
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-500'
  if (rank === 2) return 'text-slate-400'
  if (rank === 3) return 'text-amber-600'
  return 'text-slate-300'
}

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 95) return 'bg-green-500'
  if (accuracy >= 85) return 'bg-blue-500'
  if (accuracy >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateRange = (period: { start: string; end: string }): string => {
  const start = new Date(period.start).toLocaleDateString()
  const end = new Date(period.end).toLocaleDateString()
  return `${start} - ${end}`
}

const formatIssueType = (type: string): string => {
  return type.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Lifecycle
onMounted(() => {
  fetchPerformanceData()
})
</script>
