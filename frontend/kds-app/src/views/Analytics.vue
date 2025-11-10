<!--
  Analytics and reporting dashboard for restaurant management
  Comprehensive business intelligence and performance metrics
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold">Analyses & Rapports</h1>
          <div v-if="salesData" class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm text-gray-400">Données à jour</span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Period Selector -->
          <select
            v-model="selectedPeriod"
            @change="handlePeriodChange"
            class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
            <option value="custom">Période personnalisée</option>
          </select>

          <!-- Custom Date Range -->
          <div v-if="selectedPeriod === 'custom'" class="flex items-center space-x-2">
            <input
              v-model="customDateRange.start"
              type="date"
              class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200"
            />
            <span class="text-gray-400">-</span>
            <input
              v-model="customDateRange.end"
              type="date"
              class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200"
            />
            <button
              @click="applyCustomRange"
              class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Appliquer
            </button>
          </div>

          <!-- Actions -->
          <button
            @click="refreshAnalytics"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RotateCcw :class="{ 'animate-spin': isLoading }" class="w-4 h-4" />
          </button>

          <button
            @click="showExportModal = true"
            class="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download class="w-4 h-4 mr-2" /> Exporter
          </button>

          <button
            @click="showReportModal = true"
            class="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 class="w-4 h-4 mr-2" /> Rapport
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-6 gap-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="bg-gray-900 rounded-lg p-4 text-center border border-gray-700"
        >
          <div :class="['text-2xl font-bold', kpi.color]">{{ kpi.value }}</div>
          <div class="text-sm text-gray-400">{{ kpi.label }}</div>
          <div v-if="kpi.trend" :class="[
            'text-xs mt-1 flex items-center justify-center',
            kpi.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
          ]">
            <ArrowUp v-if="kpi.trend.direction === 'up'" class="w-4 h-4 mr-1" />
            <ArrowDown v-else class="w-4 h-4 mr-1" />
            {{ kpi.trend.percentage.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full flex">
        <!-- Charts Section -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Chart Tabs -->
          <div class="flex-none bg-gray-800 border-b border-gray-700 px-6">
            <nav class="flex space-x-8">
              <button
                v-for="tab in chartTabs"
                :key="tab.id"
                @click="activeChartTab = tab.id"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors',
                  activeChartTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                ]"
              >
                <component :is="tab.icon" class="w-4 h-4 mr-2" />
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Chart Content -->
          <div class="flex-1 p-6 overflow-auto">
            <div v-if="activeChartTab === 'sales'" class="space-y-6">
              <div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 class="text-lg font-semibold mb-4">Évolution des ventes</h3>
                <div class="h-64 flex items-center justify-center text-gray-400">
                  <LineChart class="w-16 h-16 mb-2" />
                  <p>Graphique des ventes (Chart.js sera intégré)</p>
                </div>
              </div>
            </div>

            <!-- More tabs (products, staff, time...) follow same dark styling -->
          </div>
        </div>

        <!-- Insights Panel -->
        <div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <!-- Quick Insights -->
          <div class="flex-none p-6 border-b border-gray-700">
            <h3 class="text-lg font-semibold mb-4">Insights rapides</h3>
            <div class="space-y-3">
              <div
                v-for="insight in quickInsights"
                :key="insight.id"
                :class="[
                  'p-3 rounded-lg border-l-4',
                  insight.type === 'success' ? 'bg-green-900 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-900 border-yellow-500' :
                  insight.type === 'error' ? 'bg-red-900 border-red-500' :
                  'bg-blue-900 border-blue-500'
                ]"
              >
                <div class="flex items-start space-x-2">
                  <component :is="getInsightIcon(insight.icon)" class="mt-0.5" />
                  <div>
                    <p class="font-medium text-sm">{{ insight.title }}</p>
                    <p class="text-gray-400 text-xs">{{ insight.message }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alerts -->
          <div v-if="alerts.length > 0" class="flex-none p-6 border-b border-gray-700">
            <h4 class="font-medium mb-3">Alertes</h4>
            <div class="space-y-2">
              <div
                v-for="alert in alerts"
                :key="alert.id"
                :class="[
                  'p-3 rounded-lg',
                  alert.type === 'error' ? 'bg-red-900 border border-red-600' :
                  alert.type === 'warning' ? 'bg-yellow-900 border border-yellow-600' :
                  'bg-blue-900 border border-blue-600'
                ]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-medium text-sm">{{ alert.title }}</p>
                    <p class="text-xs text-gray-400">{{ alert.message }}</p>
                  </div>
                  <button v-if="alert.action" class="text-xs text-blue-400 hover:text-blue-300">
                    {{ alert.action }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Export -->
          <div class="flex-1 p-6">
            <h4 class="font-medium mb-3">Export rapide</h4>
            <div class="space-y-2">
              <button
                v-for="action in exportActions"
                :key="action.label"
                @click="exportData(action.type, action.format)"
                class="w-full text-left px-3 py-2 text-sm rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-700 transition-colors flex items-center"
              >
                <component :is="action.icon" class="w-4 h-4 mr-2" :class="action.iconColor" />
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">Exporter les données</h3>
        <p class="text-gray-400 mb-4">Fonctionnalité d'export en cours de développement</p>
        <button
          @click="showExportModal = false"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">Générer un rapport</h3>
        <p class="text-gray-400 mb-4">Fonctionnalité de rapport en cours de développement</p>
        <button
          @click="showReportModal = false"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { storeToRefs } from 'pinia'
import {
  RotateCcw,
  Download,
  BarChart3,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  LineChart,
  Box,
  Users,
  Clock,
  UserCheck,
  Warehouse,
  FileText,
  FilePlus,
  FileImage
} from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const {
  salesData,
  salesTrend,
  kpiMetrics,
  selectedPeriod,
  customDateRange,
  isLoading
} = storeToRefs(analyticsStore)

const activeChartTab = ref('sales')
const showExportModal = ref(false)
const showReportModal = ref(false)

const chartTabs = [
  { id: 'sales', label: 'Ventes', icon: LineChart },
  { id: 'products', label: 'Produits', icon: Box },
  { id: 'staff', label: 'Personnel', icon: Users },
  { id: 'time', label: 'Temps', icon: Clock },
  { id: 'customers', label: 'Clients', icon: UserCheck },
  { id: 'inventory', label: 'Stock', icon: Warehouse }
]

const kpis = computed(() => [
  { label: "Chiffre d'affaires", value: formatCurrency(kpiMetrics.value?.totalRevenue || 0), color: "text-green-400", trend: salesTrend.value },
  { label: "Commandes", value: kpiMetrics.value?.totalOrders || 0, color: "text-blue-400" },
  { label: "Panier moyen", value: formatCurrency(kpiMetrics.value?.averageOrderValue || 0), color: "text-indigo-400" },
  { label: "Taux de conversion", value: (kpiMetrics.value?.conversionRate || 0).toFixed(1) + "%", color: "text-purple-400" },
  { label: "Marge bénéficiaire", value: (kpiMetrics.value?.profitMargin || 0).toFixed(1) + "%", color: "text-yellow-400" },
  { label: "Satisfaction client", value: (kpiMetrics.value?.customerSatisfaction || 0).toFixed(1) + "/5", color: "text-pink-400" }
])

const quickInsights = computed(() => {
  const list:any[] = []
  if (salesTrend.value) {
    list.push({
      id: 'sales-trend',
      type: salesTrend.value.direction === 'up' ? 'success' : 'warning',
      title: 'Tendance des ventes',
      message: `${salesTrend.value.direction === 'up' ? 'Augmentation' : 'Diminution'} de ${salesTrend.value.percentage.toFixed(1)}%`,
      icon: salesTrend.value.direction === 'up' ? 'trending-up' : 'trending-down'
    })
  }
  return list
})

const alerts = computed(() => [])
const exportActions = [
  { label: "Ventes (CSV)", type: "sales", format: "CSV", icon: FileText, iconColor: "text-green-400" },
  { label: "Produits (Excel)", type: "products", format: "Excel", icon: FilePlus, iconColor: "text-green-400" },
  { label: "Personnel (PDF)", type: "staff", format: "PDF", icon: FileImage, iconColor: "text-red-400" }
]

const formatCurrency = (amount:number) => analyticsStore.formatCurrency(amount)

const getInsightIcon = (iconName:string) => {
  const map:any = { 'trending-up': TrendingUp, 'trending-down': TrendingDown, clock: Clock }
  return map[iconName] || FileText
}

const handlePeriodChange = async () => {
  if (selectedPeriod.value !== 'custom') await analyticsStore.setPeriod(selectedPeriod.value)
}
const applyCustomRange = async () => {
  if (customDateRange.value.start && customDateRange.value.end) {
    await analyticsStore.setCustomDateRange(customDateRange.value.start, customDateRange.value.end)
  }
}
const refreshAnalytics = async () => { await analyticsStore.refreshAnalytics() }
const exportData = async (type:string, format:string) => {
  await analyticsStore.exportData(type as any, format as any, selectedPeriod.value)
}

onMounted(async () => {
  await analyticsStore.loadAllAnalytics(selectedPeriod.value)
  setInterval(() => { if (!isLoading.value) analyticsStore.refreshAnalytics() }, 300000)
})
</script>

<style scoped>
/* Custom animations for chart transitions */
.chart-enter-active,
.chart-leave-active {
  transition: all 0.3s ease;
}

.chart-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.chart-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
