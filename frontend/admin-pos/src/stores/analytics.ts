/**
 * Analytics and reporting store for POS system
 * Handles sales data, performance metrics, and business intelligence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

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

  // Actions
  const fetchSalesData = async (period: string, dateRange?: { start: string; end: string }): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const params = { period, ...dateRange }
      const response = await axios.get('/api/analytics/sales', { params })

      if (response.data.success) {
        salesData.value = response.data.data.sales
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch sales data')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchProductAnalytics = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/products', { params: { period } })

      if (response.data.success) {
        productAnalytics.value = response.data.data.products || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch product analytics')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCategoryAnalytics = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/categories', { params: { period } })

      if (response.data.success) {
        categoryAnalytics.value = response.data.data.categories || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch category analytics')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchStaffPerformance = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/staff', { params: { period } })

      if (response.data.success) {
        staffPerformance.value = response.data.data.staff || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch staff performance')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCustomerAnalytics = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/customers', { params: { period } })

      if (response.data.success) {
        customerAnalytics.value = response.data.data.customers
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch customer analytics')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchTimeAnalytics = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/time', { params: { period } })

      if (response.data.success) {
        timeAnalytics.value = response.data.data.timeData || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch time analytics')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchComparisonData = async (period: string): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/comparison', { params: { period } })

      if (response.data.success) {
        comparisonData.value = response.data.data.comparison
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch comparison data')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchInventoryAnalytics = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/inventory')

      if (response.data.success) {
        inventoryAnalytics.value = response.data.data.inventory
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch inventory analytics')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const generateReport = async (reportType: ReportType, config: any): Promise<string | null> => {
    try {
      const response = await axios.post('/api/analytics/reports/generate', {
        type: reportType,
        config
      })

      if (response.data.success) {
        return response.data.data.reportUrl
      }

      throw new Error(response.data.error || 'Failed to generate report')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    }
  }

  const scheduleReport = async (config: Omit<ReportConfig, 'id'>): Promise<boolean> => {
    try {
      const response = await axios.post('/api/analytics/reports/schedule', config)

      if (response.data.success) {
        const newReport = response.data.data.report
        reportConfigs.value.push(newReport)
        return true
      }

      throw new Error(response.data.error || 'Failed to schedule report')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchReportConfigs = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/analytics/reports/configs')

      if (response.data.success) {
        reportConfigs.value = response.data.data.configs || []
        return true
      }

      throw new Error(response.data.error || 'Failed to fetch report configs')
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const exportData = async (
    dataType: 'sales' | 'products' | 'staff' | 'customers',
    format: 'CSV' | 'Excel' | 'PDF',
    period: string
  ): Promise<string | null> => {
    try {
      const response = await axios.post('/api/analytics/export', {
        dataType,
        format,
        period
      }, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${dataType}-${period}.${format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return url
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    }
  }

  const loadAllAnalytics = async (period: string = 'today'): Promise<boolean> => {
    isLoading.value = true

    try {
      const dateRange = selectedPeriod.value === 'custom' ? customDateRange.value : undefined

      // Silently handle 404s for endpoints that don't exist yet
      await Promise.allSettled([
        fetchSalesData(period, dateRange).catch(err => {
          if (err.response?.status !== 404) console.error('Sales data error:', err)
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

    // Computed
    topSellingProducts,
    mostProfitableProducts,
    topCategories,
    topPerformingStaff,
    peakHours,
    salesTrend,
    kpiMetrics,

    // Actions
    fetchSalesData,
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

    // Helpers
    formatCurrency,
    formatPercentage,
    calculateGrowth
  }
})