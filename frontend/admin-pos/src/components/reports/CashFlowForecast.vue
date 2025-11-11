<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { TrendingUp, Calendar, BarChart3, RefreshCw, Download, FileSpreadsheet } from 'lucide-vue-next'
import { cashReportApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const toast = useToast()

// State
const isLoading = ref(false)
const isExporting = ref(false)
const forecast = ref<any>(null)
const daysAhead = ref(7)
const historicalDays = ref(30)

// Chart data
const chartData = computed(() => {
  if (!forecast.value || !forecast.value.forecastDays) {
    return {
      labels: [],
      datasets: []
    }
  }

  const labels = forecast.value.forecastDays.map((day: any) => {
    const date = new Date(day.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Forecast Sales',
        data: forecast.value.forecastDays.map((day: any) => day.forecastSales),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Forecast Balance',
        data: forecast.value.forecastDays.map((day: any) => day.forecastBalance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Net Flow',
        data: forecast.value.forecastDays.map((day: any) => day.forecastNetFlow),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#e5e7eb',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: '#1f2937',
      titleColor: '#f3f4f6',
      bodyColor: '#d1d5db',
      borderColor: '#374151',
      borderWidth: 1,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#374151'
      },
      ticks: {
        color: '#9ca3af',
        callback: function(value: any) {
          return '$' + value.toLocaleString()
        }
      }
    },
    x: {
      grid: {
        color: '#374151'
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  }
}

const loadForecast = async () => {
  isLoading.value = true
  try {
    forecast.value = await cashReportApi.getForecast(daysAhead.value, historicalDays.value)
  } catch (error: any) {
    console.error('Failed to load forecast:', error)
    toast.error('Failed to load cash flow forecast')
    forecast.value = null
  } finally {
    isLoading.value = false
  }
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-400'
  if (confidence >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 80) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Low'
}

const exportToExcel = async () => {
  isExporting.value = true
  try {
    const blob = await cashReportApi.exportForecastToExcel(daysAhead.value, historicalDays.value)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cash-flow-forecast_${daysAhead.value}days.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Excel forecast downloaded successfully')
  } catch (error: any) {
    console.error('Failed to export forecast:', error)
    toast.error('Failed to export forecast to Excel')
  } finally {
    isExporting.value = false
  }
}

watch([daysAhead, historicalDays], () => {
  loadForecast()
})

onMounted(() => {
  loadForecast()
})

defineExpose({ refresh: loadForecast })
</script>

<template>
  <div class="space-y-6">
    <!-- Configuration Panel -->
    <div class="bg-gray-800 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp :size="24" class="text-blue-400" />
          Cash Flow Forecast
        </h3>
        <div class="flex items-center gap-2">
          <button
            v-if="forecast"
            @click="exportToExcel"
            :disabled="isExporting"
            class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet :size="16" />
            {{ isExporting ? 'Exporting...' : 'Export Excel' }}
          </button>
          <button
            @click="loadForecast"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Forecast Period (days)</label>
          <select
            v-model.number="daysAhead"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="7">7 Days</option>
            <option :value="14">14 Days</option>
            <option :value="30">30 Days</option>
            <option :value="60">60 Days</option>
            <option :value="90">90 Days</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Historical Data (days)</label>
          <select
            v-model.number="historicalDays"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="7">7 Days</option>
            <option :value="14">14 Days</option>
            <option :value="30">30 Days</option>
            <option :value="60">60 Days</option>
            <option :value="90">90 Days</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-gray-800 rounded-lg p-12 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
      <p class="text-gray-400">Generating forecast...</p>
    </div>

    <!-- Forecast Summary -->
    <div v-if="forecast && !isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500">
        <p class="text-green-400 text-sm font-medium mb-1">Current Balance</p>
        <p class="text-3xl font-bold text-green-400">
          ${{ forecast.currentBalance?.toFixed(2) || '0.00' }}
        </p>
        <p class="text-xs text-green-300 mt-1">Starting point</p>
      </div>

      <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500">
        <p class="text-blue-400 text-sm font-medium mb-1">Projected Balance</p>
        <p class="text-3xl font-bold text-blue-400">
          ${{ forecast.projectedEndingBalance?.toFixed(2) || '0.00' }}
        </p>
        <p class="text-xs text-blue-300 mt-1">In {{ daysAhead }} days</p>
      </div>

      <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-500">
        <p class="text-purple-400 text-sm font-medium mb-1">Avg Daily Sales</p>
        <p class="text-3xl font-bold text-purple-400">
          ${{ forecast.avgDailySales?.toFixed(2) || '0.00' }}
        </p>
        <p class="text-xs text-purple-300 mt-1">Historical average</p>
      </div>

      <div class="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-500">
        <p class="text-yellow-400 text-sm font-medium mb-1">Total Forecast Sales</p>
        <p class="text-3xl font-bold text-yellow-400">
          ${{ forecast.totalForecastSales?.toFixed(2) || '0.00' }}
        </p>
        <p class="text-xs text-yellow-300 mt-1">Next {{ daysAhead }} days</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="forecast && !isLoading" class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 :size="20" class="text-blue-400" />
        Forecast Visualization
      </h4>
      <div class="h-96">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Forecast Table -->
    <div v-if="forecast && !isLoading" class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar :size="20" class="text-purple-400" />
        Daily Forecast Breakdown
      </h4>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-400 text-sm border-b border-gray-700">
              <th class="pb-3">Date</th>
              <th class="pb-3">Sales</th>
              <th class="pb-3">Refunds</th>
              <th class="pb-3">Drops</th>
              <th class="pb-3">Net Flow</th>
              <th class="pb-3">Balance</th>
              <th class="pb-3">Confidence</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(day, index) in forecast.forecastDays"
              :key="index"
              class="border-b border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <td class="py-3 text-white">
                {{ new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
              </td>
              <td class="py-3 text-green-400">${{ day.forecastSales?.toFixed(2) || '0.00' }}</td>
              <td class="py-3 text-red-400">${{ day.forecastRefunds?.toFixed(2) || '0.00' }}</td>
              <td class="py-3 text-blue-400">${{ day.forecastDrops?.toFixed(2) || '0.00' }}</td>
              <td class="py-3 text-purple-400">${{ day.forecastNetFlow?.toFixed(2) || '0.00' }}</td>
              <td class="py-3 text-white font-medium">${{ day.forecastBalance?.toFixed(2) || '0.00' }}</td>
              <td class="py-3">
                <span :class="['font-medium', getConfidenceColor(day.confidence)]">
                  {{ day.confidence }}% ({{ getConfidenceLabel(day.confidence) }})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Trend Analysis -->
    <div v-if="forecast && !isLoading" class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-white mb-4">Trend Analysis</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-gray-400 text-sm mb-2">Sales Trend</p>
          <p :class="['text-2xl font-bold', forecast.salesTrend >= 0 ? 'text-green-400' : 'text-red-400']">
            {{ forecast.salesTrend >= 0 ? '+' : '' }}${{ forecast.salesTrend?.toFixed(2) || '0.00' }} / day
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ forecast.salesTrend >= 0 ? 'Increasing' : 'Decreasing' }} trend
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-gray-400 text-sm mb-2">Cash Flow Trend</p>
          <p :class="['text-2xl font-bold', forecast.flowTrend >= 0 ? 'text-green-400' : 'text-red-400']">
            {{ forecast.flowTrend >= 0 ? '+' : '' }}${{ forecast.flowTrend?.toFixed(2) || '0.00' }} / day
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ forecast.flowTrend >= 0 ? 'Positive' : 'Negative' }} momentum
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!forecast && !isLoading" class="bg-gray-800 rounded-lg p-12 text-center">
      <TrendingUp :size="48" class="mx-auto text-gray-600 mb-4" />
      <p class="text-gray-400">No forecast data available</p>
      <p class="text-sm text-gray-500 mt-2">Try adjusting the forecast parameters</p>
    </div>
  </div>
</template>

<style scoped>
.bg-gray-750 {
  background-color: #2d3748;
}
</style>
