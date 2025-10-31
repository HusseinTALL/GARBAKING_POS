/**
 * Analytics and reporting store for POS system
 * Handles sales data, performance metrics, and business intelligence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  analyticsApi,
  type CategoryAnalyticsDto,
  type ComparisonDataDto,
  type CustomerAnalyticsDto,
  type CustomerInsightsResponseDto,
  type DashboardAnalyticsDto,
  type InventoryAnalyticsDto,
  type MenuPerformanceResponseDto,
  type PaymentMethodAnalyticsDto,
  type PeakHoursResponseDto,
  type ProductAnalyticsDto,
  type ReportConfigDto,
  type SalesDataDto,
  type StaffPerformanceDto,
  type TimeAnalyticsDto
} from '@/services/api-spring'

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
  const salesData = ref<SalesDataDto | null>(null)
  const productAnalytics = ref<ProductAnalyticsDto[]>([])
  const categoryAnalytics = ref<CategoryAnalyticsDto[]>([])
  const staffPerformance = ref<StaffPerformanceDto[]>([])
  const customerAnalytics = ref<CustomerAnalyticsDto | null>(null)
  const timeAnalytics = ref<TimeAnalyticsDto[]>([])
  const comparisonData = ref<ComparisonDataDto | null>(null)
  const inventoryAnalytics = ref<InventoryAnalyticsDto | null>(null)
  const reportConfigs = ref<ReportConfigDto[]>([])

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
    const previousSales = previous.totalSales || 0
    if (!previousSales) {
      return {
        direction: current.totalSales > 0 ? 'up' : 'stable',
        percentage: current.totalSales > 0 ? 100 : 0,
        value: current.totalSales - previousSales
      }
    }

    const salesChange = ((current.totalSales - previousSales) / previousSales) * 100

    return {
      direction: salesChange > 0 ? 'up' : salesChange < 0 ? 'down' : 'stable',
      percentage: Math.abs(salesChange),
      value: current.totalSales - previousSales
    }
  })

  const kpiMetrics = computed(() => {
    if (!salesData.value) return null

    const revenue = salesData.value.revenue
    const gross = revenue.gross || 0
    const net = revenue.net || 0
    const totalCustomers = customerAnalytics.value?.totalCustomers || 0

    return {
      totalRevenue: salesData.value.totalSales,
      totalOrders: salesData.value.totalOrders,
      averageOrderValue: salesData.value.averageOrderValue,
      conversionRate:
        totalCustomers > 0 ? (salesData.value.uniqueCustomers / totalCustomers) * 100 : 0,
      profitMargin: gross > 0 ? (net / gross) * 100 : 0,
      customerSatisfaction: staffPerformance.value.length > 0
        ? staffPerformance.value.reduce((sum, staff) => sum + (staff.customerRating || 0), 0) /
          staffPerformance.value.length
        : 0
    }
  })

  // Dashboard-specific state
  const dashboardData = ref<DashboardAnalyticsDto | null>(null)
  const menuPerformanceSummary = ref<MenuPerformanceResponseDto | null>(null)
  const peakHoursSummary = ref<PeakHoursResponseDto | null>(null)
  const paymentMethodsData = ref<PaymentMethodAnalyticsDto | null>(null)
  const customerInsightsData = ref<CustomerInsightsResponseDto | null>(null)

  const menuPerformanceItems = computed(() => menuPerformanceSummary.value?.menuItems ?? [])
  const peakHoursData = computed<TimeAnalyticsDto[]>(
    () => peakHoursSummary.value?.peakHours ?? []
  )

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
      menuPerformanceSummary.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchPeakHours = async (days: number = 7): Promise<boolean> => {
    try {
      const data = await analyticsApi.getPeakHours(days)
      peakHoursSummary.value = data
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
      productAnalytics.value = data.products || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCategoryAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getCategoryAnalytics(period)
      categoryAnalytics.value = data.categories || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchStaffPerformance = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getStaffPerformance(period)
      staffPerformance.value = data.staff || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchCustomerAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getCustomerAnalytics(period)
      customerAnalytics.value = data.customers
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchTimeAnalytics = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getTimeAnalytics(period)
      timeAnalytics.value = data.timeData || []
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchComparisonData = async (period: string): Promise<boolean> => {
    try {
      const data = await analyticsApi.getComparisonData(period)
      comparisonData.value = data.comparison
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchInventoryAnalytics = async (): Promise<boolean> => {
    try {
      const data = await analyticsApi.getInventoryAnalytics()
      inventoryAnalytics.value = data.inventory
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const generateReport = async (reportType: ReportType, config: any): Promise<string | null> => {
    try {
      const data = await analyticsApi.generateReport(reportType, config)
      return data.reportUrl || null
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return null
    }
  }

  const scheduleReport = async (config: Omit<ReportConfigDto, 'id'>): Promise<boolean> => {
    try {
      const data = await analyticsApi.scheduleReport(config)
      if (data.report) {
        reportConfigs.value.push(data.report)
      }
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      return false
    }
  }

  const fetchReportConfigs = async (): Promise<boolean> => {
    try {
      const data = await analyticsApi.getReportConfigs()
      reportConfigs.value = data.configs || []
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
  const fetchYearOverYearComparison = async (): Promise<ComparisonDataDto | null> => {
    try {
      const data = await analyticsApi.getYearOverYearComparison()
      return data.comparison
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
      console.error('YoY comparison error:', err)
      return null
    }
  }

  const fetchMonthOverMonthComparison = async (): Promise<ComparisonDataDto | null> => {
    try {
      const data = await analyticsApi.getMonthOverMonthComparison()
      return data.comparison
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
  ): Promise<ComparisonDataDto | null> => {
    try {
      const data = await analyticsApi.getCustomComparison({
        startDate1,
        endDate1,
        startDate2,
        endDate2
      })
      return data.comparison
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
    menuPerformanceSummary,
    paymentMethodsData,
    customerInsightsData,

    // Derived collections
    menuPerformanceItems,
    peakHoursData,

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