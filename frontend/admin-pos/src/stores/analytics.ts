/**
 * Analytics and reporting store for POS system
 * Handles sales data, performance metrics, and business intelligence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsApi } from '@/services/api-spring'

// Types
export interface SalesData {
  period: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalItems: number
  totalCustomers: number
  revenue: {
    gross: number
    net: number
    tax: number
    discounts: number
    refunds: number
  }
  breakdown: {
    cash: number
    card: number
    mobileMoney: number
    credit: number
  }
}

export interface ProductAnalytics {
  productId: string
  productName: string
  category: string
  quantitySold: number
  revenue: number
  profit: number
  profitMargin: number
  averagePrice: number
  timesOrdered: number
  percentageOfTotal: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface CategoryAnalytics {
  categoryId: string
  categoryName: string
  quantitySold: number
  revenue: number
  profit: number
  orderCount: number
  percentageOfTotal: number
  topProducts: ProductAnalytics[]
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface StaffPerformance {
  staffId: string
  staffName: string
  role: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  hoursWorked: number
  salesPerHour: number
  customerRating?: number
  efficiency: number
  trend: 'up' | 'down' | 'stable'
}

export interface CustomerAnalytics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrdersPerCustomer: number
  customerLifetimeValue: number
  retentionRate: number
  demographics: {
    ageGroups: Record<string, number>
    genderDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }
}

export interface TimeAnalytics {
  hour: number
  period: string
  orders: number
  revenue: number
  averageOrderValue: number
  popularItems: string[]
  staffCount: number
  efficiency: number
}

export interface ComparisonData {
  current: SalesData
  previous: SalesData
  change: {
    sales: number
    orders: number
    aov: number
    customers: number
  }
  growth: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
}

export interface InventoryAnalytics {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  fastMovingItems: ProductAnalytics[]
  slowMovingItems: ProductAnalytics[]
  stockValue: number
  turnoverRate: number
  reorderSuggestions: {
    productId: string
    productName: string
    currentStock: number
    suggestedOrder: number
    priority: 'high' | 'medium' | 'low'
  }[]
}

export interface ReportConfig {
  id: string
  name: string
  type: ReportType
  schedule: ReportSchedule
  format: 'PDF' | 'Excel' | 'CSV'
  recipients: string[]
  filters: Record<string, any>
  isActive: boolean
  lastGenerated?: string
  nextScheduled?: string
}

export enum ReportType {
  DAILY_SALES = 'DAILY_SALES',
  WEEKLY_SUMMARY = 'WEEKLY_SUMMARY',
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  PRODUCT_ANALYSIS = 'PRODUCT_ANALYSIS',
  STAFF_PERFORMANCE = 'STAFF_PERFORMANCE',
  INVENTORY_REPORT = 'INVENTORY_REPORT',
  CUSTOMER_INSIGHTS = 'CUSTOMER_INSIGHTS',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY'
}

export enum ReportSchedule {
  MANUAL = 'MANUAL',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const salesData = ref<SalesData | null>(null)
  const productAnalytics = ref<ProductAnalytics[]>([])
  const categoryAnalytics = ref<CategoryAnalytics[]>([])
  const staffPerformance = ref<StaffPerformance[]>([])
  const customerAnalytics = ref<CustomerAnalytics | null>(null)
  const timeAnalytics = ref<TimeAnalytics[]>([])
  const comparisonData = ref<ComparisonData | null>(null)
  const inventoryAnalytics = ref<InventoryAnalytics | null>(null)
  const reportConfigs = ref<ReportConfig[]>([])

  const selectedPeriod = ref<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('today')
  const customDateRange = ref({ start: '', end: '' })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const topSellingProducts = computed(() =>
    productAnalytics.value
      .slice()
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10)
  )

  const mostProfitableProducts = computed(() =>
    productAnalytics.value
      .slice()
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
  )

  const topCategories = computed(() =>
    categoryAnalytics.value
      .slice()
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  )

  const topPerformingStaff = computed(() =>
    staffPerformance.value
      .slice()
      .sort((a, b) => b.salesPerHour - a.salesPerHour)
      .slice(0, 5)
  )

  const peakHours = computed(() =>
    timeAnalytics.value
      .slice()
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3)
  )

  const salesTrend = computed(() => {
    if (!comparisonData.value) return null

    const { current, previous } = comparisonData.value
    const salesChange = ((current.totalSales - previous.totalSales) / previous.totalSales) * 100

    return {
      direction: salesChange > 0 ? 'up' : salesChange < 0 ? 'down' : 'stable',
      percentage: Math.abs(salesChange),
      value: current.totalSales - previous.totalSales
    }
  })

  const kpiMetrics = computed(() => {
    if (!salesData.value) return null

    return {
      totalRevenue: salesData.value.totalSales,
      totalOrders: salesData.value.totalOrders,
      averageOrderValue: salesData.value.averageOrderValue,
      conversionRate: customerAnalytics.value
        ? (salesData.value.totalOrders / customerAnalytics.value.totalCustomers) * 100
        : 0,
      profitMargin: salesData.value.revenue.net / salesData.value.revenue.gross * 100,
      customerSatisfaction: staffPerformance.value.length > 0
        ? staffPerformance.value.reduce((sum, staff) => sum + (staff.customerRating || 0), 0) / staffPerformance.value.length
        : 0
    }
  })

  // Dashboard-specific state
  const dashboardData = ref<any>(null)
  const menuPerformance = ref<any[]>([])
  const peakHoursData = ref<any>(null)
  const paymentMethodsData = ref<any>(null)
  const customerInsightsData = ref<any>(null)

  // Actions
  const fetchDashboardData = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const data = await analyticsApi.getDashboardData()
      dashboardData.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('Dashboard fetch error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchSalesData = async (period: string, dateRange?: { start: string; end: string }): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const params: any = {}

      if (dateRange?.start && dateRange?.end) {
        params.startDate = dateRange.start
        params.endDate = dateRange.end
      }

      const data = await analyticsApi.getSalesData(params)
      salesData.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchMenuPerformance = async (days: number = 30): Promise<boolean> => {
    try {
      const data = await analyticsApi.getMenuPerformance(days)
      menuPerformance.value = data.menuItems || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchPeakHours = async (days: number = 7): Promise<boolean> => {
    try {
      const data = await analyticsApi.getPeakHours(days)
      peakHoursData.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchPaymentMethods = async (days: number = 30): Promise<boolean> => {
    try {
      const data = await analyticsApi.getPaymentMethods(days)
      paymentMethodsData.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCustomerInsights = async (days: number = 30): Promise<boolean> => {
    try {
      const data = await analyticsApi.getCustomerInsights(days)
      customerInsightsData.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchProductAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getProductAnalytics(period)
      productAnalytics.value = data.products || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCategoryAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getCategoryAnalytics(period)
      categoryAnalytics.value = data.categories || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchStaffPerformance = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getStaffPerformance(period)
      staffPerformance.value = data.staff || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCustomerAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getCustomerAnalytics(period)
      customerAnalytics.value = data.customers || data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchTimeAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getTimeAnalytics(period)
      timeAnalytics.value = data.timeData || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchComparisonData = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getComparisonData(period)
      comparisonData.value = data.comparison || data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchInventoryAnalytics = async (): Promise<boolean> => {
    try {
      const data = await analyticsApi.getInventoryAnalytics()
      inventoryAnalytics.value = data.inventory || data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const generateReport = async (reportType: ReportType, config: any): Promise<string | null> => {
    try {
      const data = await analyticsApi.generateReport(reportType, config)
      return data.reportUrl || data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    }
  }

  const scheduleReport = async (config: Omit<ReportConfig, 'id'>): Promise<boolean> => {
    try {
      const data = await analyticsApi.scheduleReport(config)
      const newReport = data.report || data
      reportConfigs.value.push(newReport)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchReportConfigs = async (): Promise<boolean> => {
    try {
      const data = await analyticsApi.getReportConfigs()
      reportConfigs.value = data.configs || data || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const exportData = async (
    type: 'sales' | 'products' | 'staff' | 'customers' | 'inventory' = 'sales',
    format: 'CSV' | 'Excel' | 'PDF' = 'CSV',
    period: string = 'today'
  ): Promise<boolean> => {
    try {
      const params: any = {
        type,
        format: format.toLowerCase(),
        period
      }

      // Add custom date range if applicable
      if (selectedPeriod.value === 'custom' && customDateRange.value.start && customDateRange.value.end) {
        params.startDate = customDateRange.value.start
        params.endDate = customDateRange.value.end
      }

      const response = await analyticsApi.exportData(params)

      // Determine MIME type and extension based on format
      const mimeTypes: Record<string, string> = {
        'CSV': 'text/csv',
        'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'PDF': 'application/pdf'
      }

      const extensions: Record<string, string> = {
        'CSV': 'csv',
        'Excel': 'xlsx',
        'PDF': 'pdf'
      }

      // Handle file download
      const blob = new Blob([response.data], { type: mimeTypes[format] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.${extensions[format]}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('Export error:', err)
      return false
    }
  }

  // New comparison methods for YoY and MoM
  const fetchYearOverYearComparison = async (): Promise<any | null> => {
    try {
      const data = await analyticsApi.getYearOverYearComparison()
      return data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('YoY comparison error:', err)
      return null
    }
  }

  const fetchMonthOverMonthComparison = async (): Promise<any | null> => {
    try {
      const data = await analyticsApi.getMonthOverMonthComparison()
      return data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('MoM comparison error:', err)
      return null
    }
  }

  const fetchCustomComparison = async (
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
  ): Promise<any | null> => {
    try {
      const data = await analyticsApi.getCustomComparison({
        startDate1,
        endDate1,
        startDate2,
        endDate2
      })
      return data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('Custom comparison error:', err)
      return null
    }
  }

  const loadAllAnalytics = async (period: string = 'today'): Promise<boolean> => {
    isLoading.value = true

    try {
      const dateRange = selectedPeriod.value === 'custom' ? customDateRange.value : undefined

      // Load dashboard-specific data
      await fetchDashboardData()

      // Silently handle 404s for endpoints that don't exist yet
      await Promise.allSettled([
        fetchSalesData(period, dateRange).catch(err => {
          if (err.response?.status !== 404) console.error('Sales data error:', err)
        }),
        fetchMenuPerformance(30).catch(err => {
          if (err.response?.status !== 404) console.error('Menu performance error:', err)
        }),
        fetchPeakHours(7).catch(err => {
          if (err.response?.status !== 404) console.error('Peak hours error:', err)
        }),
        fetchPaymentMethods(30).catch(err => {
          if (err.response?.status !== 404) console.error('Payment methods error:', err)
        }),
        fetchCustomerInsights(30).catch(err => {
          if (err.response?.status !== 404) console.error('Customer insights error:', err)
        }),
        fetchProductAnalytics(period).catch(err => {
          if (err.response?.status !== 404) console.error('Product analytics error:', err)
        }),
        fetchCategoryAnalytics(period).catch(err => {
          if (err.response?.status !== 404) console.error('Category analytics error:', err)
        }),
        fetchStaffPerformance(period).catch(err => {
          if (err.response?.status !== 404) console.error('Staff performance error:', err)
        }),
        fetchCustomerAnalytics(period).catch(err => {
          if (err.response?.status !== 404) console.error('Customer analytics error:', err)
        }),
        fetchTimeAnalytics(period).catch(err => {
          if (err.response?.status !== 404) console.error('Time analytics error:', err)
        }),
        fetchComparisonData(period).catch(err => {
          if (err.response?.status !== 404) console.error('Comparison data error:', err)
        }),
        fetchInventoryAnalytics().catch(err => {
          if (err.response?.status !== 404) console.error('Inventory analytics error:', err)
        })
      ])

      return true
    } catch (err) {
      console.error('Failed to load analytics:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refreshAnalytics = async (): Promise<void> => {
    await loadAllAnalytics(selectedPeriod.value)
  }

  const setPeriod = async (period: typeof selectedPeriod.value): Promise<void> => {
    selectedPeriod.value = period
    await loadAllAnalytics(period)
  }

  const setCustomDateRange = async (start: string, end: string): Promise<void> => {
    customDateRange.value = { start, end }
    selectedPeriod.value = 'custom'
    await loadAllAnalytics('custom')
  }

  const clearError = () => {
    error.value = null
  }

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} FCFA`
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    // State
    salesData,
    productAnalytics,
    categoryAnalytics,
    staffPerformance,
    customerAnalytics,
    timeAnalytics,
    comparisonData,
    inventoryAnalytics,
    reportConfigs,
    selectedPeriod,
    customDateRange,
    isLoading,
    error,

    // Dashboard-specific state
    dashboardData,
    menuPerformance,
    peakHoursData,
    paymentMethodsData,
    customerInsightsData,

    // Computed
    topSellingProducts,
    mostProfitableProducts,
    topCategories,
    topPerformingStaff,
    peakHours,
    salesTrend,
    kpiMetrics,

    // Actions
    fetchDashboardData,
    fetchSalesData,
    fetchMenuPerformance,
    fetchPeakHours,
    fetchPaymentMethods,
    fetchCustomerInsights,
    fetchProductAnalytics,
    fetchCategoryAnalytics,
    fetchStaffPerformance,
    fetchCustomerAnalytics,
    fetchTimeAnalytics,
    fetchComparisonData,
    fetchInventoryAnalytics,
    generateReport,
    scheduleReport,
    fetchReportConfigs,
    exportData,
    loadAllAnalytics,
    refreshAnalytics,
    setPeriod,
    setCustomDateRange,
    clearError,
    // New comparison methods
    fetchYearOverYearComparison,
    fetchMonthOverMonthComparison,
    fetchCustomComparison,

    // Helpers
    formatCurrency,
    formatPercentage,
    calculateGrowth
  }
})