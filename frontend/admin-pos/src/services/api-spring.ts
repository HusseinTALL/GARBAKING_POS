/**
 * API service for Spring Boot microservices backend (Admin POS)
 * Communicates with API Gateway (port 8080)
 * Handles authentication, menu/inventory management, and order management
 */

import axios from 'axios'
import type {
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig
} from 'axios'
import { useToast } from 'vue-toastification'
import type { KitchenOrder } from '@/stores/kitchen'
import type { PaymentMethod } from '@/stores/payment'

// API Configuration - Spring Boot API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  }
})

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return fallback
}

export const mapOrderDtoToKitchenOrder = (order: any): KitchenOrder => {
  const status = normalizeString(order?.status, 'CONFIRMED').toUpperCase() as KitchenOrder['status']
  const priority = normalizeString(order?.priority, 'NORMAL').toUpperCase() as KitchenOrder['priority']

  const orderItems = Array.isArray(order?.orderItems) ? order.orderItems : []

  return {
    id: normalizeString(order?.id ?? order?.orderId),
    orderNumber: normalizeString(order?.orderNumber ?? `ORD-${order?.id ?? ''}`),
    customerName: order?.customerName ?? undefined,
    tableNumber: normalizeString(order?.tableNumber ?? '').trim() !== ''
      ? normalizeString(order?.tableNumber)
      : undefined,
    orderType: normalizeString(order?.orderType ?? 'DINE_IN'),
    status,
    priority,
    total: toNumber(order?.total ?? order?.totalAmount, 0),
    createdAt: order?.createdAt ?? new Date().toISOString(),
    estimatedTime: order?.estimatedTime ?? order?.prepTime ?? undefined,
    actualTime: order?.actualTime ?? undefined,
    kitchenNotes: order?.kitchenNotes ?? order?.notes ?? undefined,
    orderItems: orderItems.map((item: any) => {
      const itemStatus = normalizeString(item?.status ?? 'PENDING').toUpperCase() as KitchenOrder['orderItems'][number]['status']
      const menuItem = item?.menuItem ?? {}

      return {
        id: normalizeString(item?.id ?? `${order?.id ?? 'order'}-${item?.menuItemId ?? 'item'}`),
        quantity: toNumber(item?.quantity, 0),
        menuItem: {
          id: normalizeString(menuItem?.id ?? item?.menuItemId ?? item?.id),
          name: normalizeString(menuItem?.name ?? item?.name ?? 'Unknown Item'),
          price: toNumber(menuItem?.price ?? item?.unitPrice ?? item?.price, 0),
          prepTime: menuItem?.prepTime ?? item?.prepTime ?? undefined,
          station: menuItem?.station ?? item?.station ?? undefined,
        },
        totalPrice: toNumber(item?.totalPrice ?? (item?.unitPrice ?? item?.price) * toNumber(item?.quantity, 1), 0),
        notes: item?.notes ?? item?.kitchenNotes ?? undefined,
        status: itemStatus,
        kitchenNotes: item?.kitchenNotes ?? undefined,
        prepStartTime: item?.prepStartTime ?? item?.startedAt ?? undefined,
        prepCompleteTime: item?.prepCompleteTime ?? item?.completedAt ?? undefined,
        assignedStation: item?.assignedStation ?? menuItem?.station ?? undefined,
      }
    }),
    isHeld: Boolean(order?.isHeld ?? false),
    heldReason: order?.heldReason ?? undefined,
    heldAt: order?.heldAt ?? undefined,
  }
}

export const mapPaymentMethodDto = (method: any): PaymentMethod => ({
  id: normalizeString(method?.id ?? method?.paymentMethodId ?? method?.code),
  name: normalizeString(method?.name ?? method?.code ?? 'Unknown'),
  type: normalizeString(method?.type ?? method?.paymentType ?? 'CASH').toUpperCase() as PaymentMethod['type'],
  displayName: normalizeString(method?.displayName ?? method?.name ?? method?.code ?? 'Payment Method'),
  icon: Array.isArray(method?.icon)
    ? method.icon
    : method?.icon
      ? [normalizeString(method.icon)]
      : [],
  color: normalizeString(method?.color ?? '#0ea5e9'),
  enabled: Boolean(method?.enabled ?? method?.active ?? true),
  requiresAuth: Boolean(method?.requiresAuth ?? false),
  processingFee: method?.processingFee ?? method?.fee ?? undefined,
  minAmount: method?.minAmount ?? undefined,
  maxAmount: method?.maxAmount ?? undefined,
  config: method?.config ?? method?.metadata ?? {},
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor for error handling and automatic token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const toast = useToast()
    const originalRequest = error.config as any

    if (!error.response) {
      console.error('Network error:', error.message)
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle 401 errors (unauthorized - token expired)
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
          }
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('auth_token')
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Attempt to refresh the token
        const response = await apiClient.post('/api/auth/refresh', { refreshToken })
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data

        if (newAccessToken) {
          localStorage.setItem('auth_token', newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
          }
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken

          // Process queued requests
          processQueue(null, newAccessToken)

          // Retry original request
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        processQueue(refreshError, null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    console.error('API error:', error.response.status, error.response.data)

    return Promise.reject(error)
  }
)

// Authentication API (User Service via API Gateway)
export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/api/auth/login', credentials)
    const { token, refreshToken, user } = response.data
    if (token) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken || token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    return response.data
  },

  async register(userData: { name: string; email: string; password: string; phone?: string; role?: string }) {
    const response = await apiClient.post('/api/auth/register', userData)
    const { token, refreshToken, user } = response.data
    if (token) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken || token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    return response.data
  },

  async logout(reason?: string) {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('pos_auth_token')
      localStorage.removeItem('pos_refresh_token')
      localStorage.removeItem('pos_user')
      localStorage.removeItem('pos_last_verified')
    }
  },

  async refresh(refreshToken: string) {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken })
    const { token, refreshToken: newRefreshToken, user } = response.data
    if (token) {
      localStorage.setItem('auth_token', token)
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      }
      localStorage.setItem('user', JSON.stringify(user))
    }
    return response.data
  },

  async verify() {
    const response = await apiClient.get('/api/auth/verify')
    return response.data
  },

  async getMe() {
    const response = await apiClient.get('/api/users/me')
    return response.data
  },

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token')
  }
}

// Users API (User Service)
export const usersApi = {
  async getAllUsers() {
    const response = await apiClient.get('/api/users')
    return response.data || []
  },

  async getUserById(id: number | string) {
    const response = await apiClient.get(`/api/users/${id}`)
    return response.data
  },

  async getUsersByRole(role: string) {
    const response = await apiClient.get(`/api/users/role/${role}`)
    return response.data || []
  },

  async createUser(userData: any) {
    const response = await apiClient.post('/api/users', userData)
    return response.data
  },

  async updateUser(id: number | string, userData: any) {
    const response = await apiClient.put(`/api/users/${id}`, userData)
    return response.data
  },

  async deleteUser(id: number | string) {
    await apiClient.delete(`/api/users/${id}`)
  },

  async updatePermissions(userId: string, permissions: string[]) {
    const response = await apiClient.put(`/api/users/${userId}/permissions`, { permissions })
    return response.data
  },

  async getPerformance(userId: string, params?: any) {
    const response = await apiClient.get(`/api/users/${userId}/performance`, { params })
    return response.data
  },

  async getAllPerformance(params?: any) {
    const response = await apiClient.get('/api/users/performance', { params })
    return response.data
  }
}

// Categories API (Inventory Service)
export const categoriesApi = {
  async getAll(activeOnly = false) {
    const url = activeOnly ? '/api/categories?activeOnly=true' : '/api/categories'
    const response = await apiClient.get(url)
    return response.data || []
  },

  async getById(id: string | number) {
    const response = await apiClient.get(`/api/categories/${id}`)
    return response.data
  },

  async create(categoryData: any) {
    const response = await apiClient.post('/api/categories', categoryData)
    return response.data
  },

  async update(id: number, categoryData: any) {
    const response = await apiClient.put(`/api/categories/${id}`, categoryData)
    return response.data
  },

  async delete(id: number) {
    await apiClient.delete(`/api/categories/${id}`)
  },

  async getCategoriesWithCounts() {
    const response = await apiClient.get('/api/categories/with-counts')
    return response.data || []
  }
}

// Menu Items API (Inventory Service)
export const menuItemsApi = {
  async getAll(availableOnly = false) {
    const url = availableOnly ? '/api/menu-items?availableOnly=true' : '/api/menu-items'
    const response = await apiClient.get(url)
    return response.data || []
  },

  async getById(id: number) {
    const response = await apiClient.get(`/api/menu-items/${id}`)
    return response.data
  },

  async getByCategory(categoryId: number) {
    const response = await apiClient.get(`/api/menu-items/category/${categoryId}`)
    return response.data || []
  },

  async getFeatured() {
    const response = await apiClient.get('/api/menu-items/featured')
    return response.data || []
  },

  async getLowStock() {
    const response = await apiClient.get('/api/menu-items/low-stock')
    return response.data || []
  },

  async search(query: string) {
    const response = await apiClient.get(`/api/menu-items/search?name=${encodeURIComponent(query)}`)
    return response.data || []
  },

  async create(menuItemData: any) {
    const response = await apiClient.post('/api/menu-items', menuItemData)
    return response.data
  },

  async update(id: number, menuItemData: any) {
    const response = await apiClient.put(`/api/menu-items/${id}`, menuItemData)
    return response.data
  },

  async delete(id: number) {
    await apiClient.delete(`/api/menu-items/${id}`)
  },

  async adjustStock(menuItemId: number, quantity: number, reason?: string) {
    const response = await apiClient.post('/api/menu-items/stock/adjust', {
      menuItemId,
      quantity,
      reason
    })
    return response.data
  },

  async getPublic() {
    const response = await apiClient.get('/api/menu/public')
    return response.data || []
  },

  async uploadImage(menuItemId: number, file: File, primary: boolean = true) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('primary', String(primary))

    const response = await apiClient.post(`/api/menu-items/${menuItemId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async deleteImage(menuItemId: number, imageId: number) {
    await apiClient.delete(`/api/menu-items/${menuItemId}/images/${imageId}`)
  }
}

// Orders API (Order Service)
export const ordersApi = {
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/api/orders', { params })
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    if (Array.isArray(data?.orders)) {
      return data.orders
    }
    return data ? [data].flat() : []
  },

  async getById(id: number) {
    const response = await apiClient.get(`/api/orders/${id}`)
    return response.data
  },

  async getByOrderNumber(orderNumber: string) {
    const response = await apiClient.get(`/api/orders/number/${orderNumber}`)
    return response.data
  },

  async getByStatus(status: string) {
    const response = await apiClient.get(`/api/orders/status/${status}`)
    return response.data || []
  },

  async getActive() {
    const response = await apiClient.get('/api/orders/active')
    return response.data || []
  },

  async getToday() {
    const response = await apiClient.get('/api/orders/today')
    return response.data || []
  },

  async getByUserId(userId: number) {
    const response = await apiClient.get(`/api/orders/user/${userId}`)
    return response.data || []
  },

  async create(orderData: any) {
    const response = await apiClient.post('/api/orders', orderData)
    return response.data
  },

  async updateStatus(orderId: string | number, status: string, reason?: string) {
    const response = await apiClient.put(`/api/orders/${orderId}/status`, {
      status,
      reason
    })
    return response.data
  },

  async updatePayment(orderId: string | number, paymentData: any) {
    const response = await apiClient.put(`/api/orders/${orderId}/payment`, paymentData)
    return response.data
  },

  async cancel(orderId: string | number, reason?: string) {
    const response = await apiClient.post(`/api/orders/${orderId}/cancel`, null, {
      params: { reason: reason || 'Cancelled by staff' }
    })
    return response.data
  },

  async delete(id: string | number) {
    await apiClient.delete(`/api/orders/${id}`)
  }
}

// Statistics/Analytics API
// Analytics API (Analytics Service - To be implemented)
// NOTE: These endpoints are not yet fully implemented in Spring Boot backend
// Some endpoints may aggregate data from existing services
export interface SalesDataDto {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  uniqueCustomers: number
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

export interface ProductAnalyticsDto {
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
  trend: string
  trendPercentage: number
}

export interface CategoryAnalyticsDto {
  categoryId: string
  categoryName: string
  quantitySold: number
  revenue: number
  profit: number
  orderCount: number
  percentageOfTotal: number
  topProducts: ProductAnalyticsDto[]
  trend: string
  trendPercentage: number
}

export interface StaffPerformanceDto {
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
  trend: string
}

export interface CustomerAnalyticsDto {
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

export interface TimeAnalyticsDto {
  hour: number
  period: string
  orders: number
  revenue: number
  averageOrderValue: number
  popularItems: string[]
  staffCount: number
  efficiency: number
}

export interface ComparisonDataDto {
  current: SalesDataDto
  previous: SalesDataDto
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

export interface InventoryAnalyticsDto {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  fastMovingItems: ProductAnalyticsDto[]
  slowMovingItems: ProductAnalyticsDto[]
  stockValue: number
  turnoverRate: number
  reorderSuggestions: {
    productId: string
    productName: string
    currentStock: number
    suggestedOrder: number
    priority: string
  }[]
}

export interface DashboardComparisonDto {
  revenueChange: number
  ordersChange: number
}

export interface DashboardPeriodMetricsDto {
  orders: number
  revenue: number
  averageOrderValue: number
  comparison: DashboardComparisonDto
}

export interface ActiveOrdersSummaryDto {
  activeOrders: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
}

export interface DashboardAnalyticsDto {
  today: DashboardPeriodMetricsDto
  yesterday: DashboardPeriodMetricsDto
  orders: ActiveOrdersSummaryDto
  topMenuItems: ProductAnalyticsDto[]
}

export interface MenuPerformanceResponseDto {
  period: string
  menuItems: ProductAnalyticsDto[]
  totalOrders: number
}

export interface PeakHoursResponseDto {
  period: string
  peakHours: TimeAnalyticsDto[]
}

export interface PaymentMethodAnalyticsDto {
  period: string
  counts: Record<string, number>
  revenue: Record<string, number>
}

export interface CustomerInsightsResponseDto {
  period: string
  totalOrders: number
  averageOrderValue: number
  ordersByType: Record<string, number>
  ordersByStatus: Record<string, number>
  peakHours: { hour: number; label: string; orders: number }[] | any
  newCustomers: number
  returningCustomers: number
}

export interface ProductAnalyticsResponseDto {
  period: string
  products: ProductAnalyticsDto[]
}

export interface CategoryAnalyticsResponseDto {
  period: string
  categories: CategoryAnalyticsDto[]
}

export interface StaffPerformanceResponseDto {
  staff: StaffPerformanceDto[]
}

export interface CustomerAnalyticsResponseDto {
  customers: CustomerAnalyticsDto
}

export interface TimeAnalyticsResponseDto {
  period: string
  timeData: TimeAnalyticsDto[]
}

export interface ComparisonResponseDto {
  comparison: ComparisonDataDto
}

export interface InventoryAnalyticsResponseDto {
  inventory: InventoryAnalyticsDto
}

export interface GeneratedReportResponseDto {
  reportUrl: string
  type: string
  generatedAt: string
}

export interface ReportConfigDto {
  id: string
  name: string
  type: string
  schedule: string
  format: string
  recipients: string[]
  filters: Record<string, unknown>
  isActive: boolean
  lastGenerated: string | null
  nextScheduled: string | null
}

export interface ScheduledReportResponseDto {
  report: ReportConfigDto
}

export interface ReportConfigListResponseDto {
  configs: ReportConfigDto[]
}

export const analyticsApi = {
  async getDashboardStats() {
    // This can be implemented later with a dedicated analytics service
    // For now, we'll aggregate from existing endpoints
    try {
      const [todaysOrders, activeOrders, lowStockItems] = await Promise.all([
        ordersApi.getToday(),
        ordersApi.getActive(),
        menuItemsApi.getLowStock()
      ])

      const todaysRevenue = todaysOrders.reduce((sum: number, order: any) => {
        return sum + (order.totalAmount || 0)
      }, 0)

      const completedToday = todaysOrders.filter((o: any) => o.status === 'COMPLETED').length

      return {
        todaysOrders: todaysOrders.length,
        activeOrders: activeOrders.length,
        todaysRevenue,
        completedOrders: completedToday,
        lowStockItems: lowStockItems.length
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        todaysOrders: 0,
        activeOrders: 0,
        todaysRevenue: 0,
        completedOrders: 0,
        lowStockItems: 0
      }
    }
  },

  async getDashboardData(): Promise<DashboardAnalyticsDto> {
    const response = await apiClient.get('/api/analytics/dashboard')
    return response.data
  },

  async getSalesData(params?: { startDate?: string; endDate?: string }): Promise<SalesDataDto> {
    const response = await apiClient.get('/api/analytics/sales', { params })
    return response.data
  },

  async getMenuPerformance(days: number = 30): Promise<MenuPerformanceResponseDto> {
    const response = await apiClient.get('/api/analytics/menu-performance', {
      params: { days }
    })
    return response.data
  },

  async getPeakHours(days: number = 7): Promise<PeakHoursResponseDto> {
    const response = await apiClient.get('/api/analytics/peak-hours', {
      params: { days }
    })
    return response.data
  },

  async getPaymentMethods(days: number = 30): Promise<PaymentMethodAnalyticsDto> {
    const response = await apiClient.get('/api/analytics/payment-methods', {
      params: { days }
    })
    return response.data
  },

  async getCustomerInsights(days: number = 30): Promise<CustomerInsightsResponseDto> {
    const response = await apiClient.get('/api/analytics/customer-insights', {
      params: { days }
    })
    return response.data
  },

  async getProductAnalytics(period: string): Promise<ProductAnalyticsResponseDto> {
    const response = await apiClient.get('/api/analytics/products', {
      params: { period }
    })
    return response.data
  },

  async getCategoryAnalytics(period: string): Promise<CategoryAnalyticsResponseDto> {
    const response = await apiClient.get('/api/analytics/categories', {
      params: { period }
    })
    return response.data
  },

  async getStaffPerformance(period: string): Promise<StaffPerformanceResponseDto> {
    const response = await apiClient.get('/api/analytics/staff', {
      params: { period }
    })
    return response.data
  },

  async getCustomerAnalytics(period: string): Promise<CustomerAnalyticsResponseDto> {
    const response = await apiClient.get('/api/analytics/customers', {
      params: { period }
    })
    return response.data
  },

  async getTimeAnalytics(period: string): Promise<TimeAnalyticsResponseDto> {
    const response = await apiClient.get('/api/analytics/time', {
      params: { period }
    })
    return response.data
  },

  async getComparisonData(period: string): Promise<ComparisonResponseDto> {
    const response = await apiClient.get('/api/analytics/comparison', {
      params: { period }
    })
    return response.data
  },

  async getInventoryAnalytics(): Promise<InventoryAnalyticsResponseDto> {
    const response = await apiClient.get('/api/analytics/inventory')
    return response.data
  },

  async generateReport(reportType: string, config: any): Promise<GeneratedReportResponseDto> {
    const response = await apiClient.post('/api/analytics/reports/generate', {
      type: reportType,
      config
    })
    return response.data
  },

  async scheduleReport(config: any): Promise<ScheduledReportResponseDto> {
    const response = await apiClient.post('/api/analytics/reports/schedule', config)
    return response.data
  },

  async getReportConfigs(): Promise<ReportConfigListResponseDto> {
    const response = await apiClient.get('/api/analytics/reports/configs')
    return response.data
  },

  async exportData(params: {
    type: string;
    format: string;
    period: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/api/analytics/export', {
      params,
      responseType: 'blob'
    })
    return response
  },

  async getYearOverYearComparison() {
    const response = await apiClient.get('/api/analytics/comparison/yoy')
    return response.data
  },

  async getMonthOverMonthComparison() {
    const response = await apiClient.get('/api/analytics/comparison/mom')
    return response.data
  },

  async getCustomComparison(params: {
    startDate1: string;
    endDate1: string;
    startDate2: string;
    endDate2: string;
  }) {
    const response = await apiClient.get('/api/analytics/comparison/custom', {
      params
    })
    return response.data
  }
}

// Clock Entries API (User Service)
export const clockEntriesApi = {
  async clockIn(userId: string, location?: string, device?: string) {
    const response = await apiClient.post(`/api/users/${userId}/clock-in`, {
      location,
      device
    })
    return response.data
  },

  async clockOut(clockEntryId: string, notes?: string) {
    const response = await apiClient.post(`/api/clock-entries/${clockEntryId}/clock-out`, {
      notes
    })
    return response.data
  },

  async startBreak(clockEntryId: string) {
    const response = await apiClient.post(`/api/clock-entries/${clockEntryId}/break-start`)
    return response.data
  },

  async endBreak(clockEntryId: string) {
    const response = await apiClient.post(`/api/clock-entries/${clockEntryId}/break-end`)
    return response.data
  },

  async getEntries(params?: any) {
    const response = await apiClient.get('/api/clock-entries', { params })
    return response.data || []
  }
}

// Audit Logs API (User Service)
export const auditLogsApi = {
  async create(auditEntry: any) {
    await apiClient.post('/api/audit-logs', auditEntry)
  },

  async getLogs(filters?: any) {
    const response = await apiClient.get('/api/audit-logs', { params: filters })
    return response.data || []
  }
}

// Password Management API (User Service)
export const passwordApi = {
  async requestReset(email: string) {
    const response = await apiClient.post('/api/users/password-reset/request', { email })
    return response.data
  },

  async completeReset(token: string, newPassword: string) {
    const response = await apiClient.post('/api/users/password-reset/complete', {
      token,
      newPassword
    })
    return response.data
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const response = await apiClient.post(`/api/users/${userId}/change-password`, {
      currentPassword,
      newPassword
    })
    return response.data
  }
}

// Shifts API (Staff/User Service)
export const shiftsApi = {
  async startShift(staffId: string, cashDrawerStart?: number) {
    const response = await apiClient.post('/api/staff/shifts/start', {
      staffId,
      cashDrawerStart
    })
    return response.data
  },

  async endShift(shiftId: string, cashDrawerEnd?: number, notes?: string) {
    const response = await apiClient.post(`/api/staff/shifts/${shiftId}/end`, {
      cashDrawerEnd,
      notes
    })
    return response.data
  },

  async startBreak(shiftId: string) {
    const response = await apiClient.post(`/api/staff/shifts/${shiftId}/break/start`)
    return response.data
  },

  async endBreak(shiftId: string) {
    const response = await apiClient.post(`/api/staff/shifts/${shiftId}/break/end`)
    return response.data
  },

  async getActiveShift(staffId: string) {
    const response = await apiClient.get(`/api/staff/${staffId}/shifts/active`)
    return response.data
  }
}

// Preferences API (User Service)
export const preferencesApi = {
  async updatePreferences(userId: string, preferences: any) {
    const response = await apiClient.patch(`/api/staff/${userId}/preferences`, preferences)
    return response.data
  }
}

// Loyalty API (Loyalty Service - To be implemented)
// NOTE: These endpoints are not yet implemented in Spring Boot backend
export const loyaltyApi = {
  async getPrograms() {
    const response = await apiClient.get('/api/loyalty/programs')
    return response.data
  },

  async createProgram(program: any) {
    const response = await apiClient.post('/api/loyalty/programs', program)
    return response.data
  },

  async updateProgram(programId: string, updates: any) {
    const response = await apiClient.put(`/api/loyalty/programs/${programId}`, updates)
    return response.data
  },

  async deleteProgram(programId: string) {
    const response = await apiClient.delete(`/api/loyalty/programs/${programId}`)
    return response.data
  },

  async getProgramTiers(programId: string) {
    const response = await apiClient.get(`/api/loyalty/programs/${programId}/tiers`)
    return response.data
  },

  async enrollCustomer(customerId: string, payload: any) {
    const response = await apiClient.post(`/api/loyalty/customer/${customerId}/join`, payload)
    return response.data
  },

  async getCustomers(filters?: any) {
    const response = await apiClient.get('/api/loyalty/customers', { params: filters })
    return response.data
  },

  async getCustomerDetails(customerId: string) {
    const response = await apiClient.get(`/api/loyalty/customers/${customerId}`)
    return response.data
  },

  async getCustomerRewards(customerId: string, params?: any) {
    const response = await apiClient.get(`/api/loyalty/customer/${customerId}/rewards`, { params })
    return response.data
  },

  async getCustomerRedemptions(customerId: string, params?: any) {
    const response = await apiClient.get(`/api/loyalty/customer/${customerId}/redemptions`, { params })
    return response.data
  },

  async awardPoints(customerId: string, payload: any) {
    const response = await apiClient.post(`/api/loyalty/customer/${customerId}/award`, payload)
    return response.data
  },

  async awardPointsForOrder(orderId: string) {
    const response = await apiClient.post(`/api/loyalty/order/${orderId}/award-points`)
    return response.data
  },

  async redeemPoints(customerId: string, payload: any) {
    const response = await apiClient.post(`/api/loyalty/customer/${customerId}/redeem`, payload)
    return response.data
  },

  async applyRedemption(orderId: string, payload: any) {
    const response = await apiClient.post(`/api/loyalty/order/${orderId}/apply-redemption`, payload)
    return response.data
  },

  async adjustPoints(payload: any) {
    const response = await apiClient.post('/api/loyalty/points/adjust', payload)
    return response.data
  },

  async getPointsHistory(customerId: string) {
    const response = await apiClient.get(`/api/loyalty/points/history/${customerId}`)
    return response.data
  },

  async getAllRewards(params?: any) {
    const response = await apiClient.get('/api/loyalty/rewards', { params })
    return response.data
  },

  async reverseReward(rewardId: string) {
    const response = await apiClient.post(`/api/loyalty/rewards/${rewardId}/reverse`)
    return response.data
  },

  async getAllRedemptions(params?: any) {
    const response = await apiClient.get('/api/loyalty/redemptions', { params })
    return response.data
  },

  async updateRedemptionStatus(redemptionId: string, status: string) {
    const response = await apiClient.patch(`/api/loyalty/redemptions/${redemptionId}`, { status })
    return response.data
  },

  async createTier(programId: string, tier: any) {
    const response = await apiClient.post(`/api/loyalty/programs/${programId}/tiers`, tier)
    return response.data
  },

  async updateTier(tierId: string, updates: any) {
    const response = await apiClient.put(`/api/loyalty/tiers/${tierId}`, updates)
    return response.data
  },

  async deleteTier(tierId: string) {
    const response = await apiClient.delete(`/api/loyalty/tiers/${tierId}`)
    return response.data
  },

  async createCampaign(campaign: any) {
    const response = await apiClient.post('/api/loyalty/campaigns', campaign)
    return response.data
  },

  async updateCampaign(campaignId: string, updates: any) {
    const response = await apiClient.put(`/api/loyalty/campaigns/${campaignId}`, updates)
    return response.data
  },

  async deleteCampaign(campaignId: string) {
    const response = await apiClient.delete(`/api/loyalty/campaigns/${campaignId}`)
    return response.data
  },

  async getCampaigns(params?: any) {
    const response = await apiClient.get('/api/loyalty/campaigns', { params })
    return response.data
  },

  async getAllCampaigns(params?: any) {
    const response = await apiClient.get('/api/loyalty/campaigns/all', { params })
    return response.data
  },

  async getAnalyticsOverview(params?: any) {
    const response = await apiClient.get('/api/loyalty/analytics/overview', { params })
    return response.data
  },

  async getCustomerAnalytics(params?: any) {
    const response = await apiClient.get('/api/loyalty/analytics/customers', { params })
    return response.data
  },

  async getRedemptionAnalytics(params?: any) {
    const response = await apiClient.get('/api/loyalty/analytics/redemptions', { params })
    return response.data
  },

  async exportData(type: string, params?: any) {
    const response = await apiClient.get(`/api/loyalty/export/${type}`, {
      params,
      responseType: 'blob'
    })
    return response
  }
}

export interface DiningTableDto {
  id: number
  label: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY'
}

export interface FloorSectionDto {
  id: number
  name: string
  tables: DiningTableDto[]
}

export interface ReservationDto {
  id: number
  tableId: number
  customerName: string
  contact: string
  startTime: string
  endTime: string
  partySize: number
  status: 'REQUESTED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED'
}

export interface ReservationRequestDto {
  tableId: number
  customerName: string
  contact: string
  startTime: string
  endTime: string
  partySize: number
}

export interface ReservationStatusUpdateDto {
  status: 'REQUESTED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED'
}

export interface TableStatusUpdateDto {
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY'
}

export const tablesApi = {
  async getLayout(): Promise<FloorSectionDto[]> {
    const response = await apiClient.get('/api/tables/layout')
    return response.data
  },

  async updateStatus(tableId: number, payload: TableStatusUpdateDto): Promise<DiningTableDto> {
    const response = await apiClient.put(`/api/tables/${tableId}/status`, payload)
    return response.data
  },

  async createReservation(reservation: ReservationRequestDto): Promise<ReservationDto> {
    const response = await apiClient.post('/api/tables/reservations', reservation)
    return response.data
  },

  async listReservations(): Promise<ReservationDto[]> {
    const response = await apiClient.get('/api/tables/reservations')
    return response.data
  },

  async updateReservationStatus(
    reservationId: number,
    payload: ReservationStatusUpdateDto
  ): Promise<ReservationDto> {
    const response = await apiClient.put(`/api/tables/reservations/${reservationId}/status`, payload)
    return response.data
  },

  async getActiveReservation(tableId: number, at: string): Promise<ReservationDto | null> {
    const response = await apiClient.get('/api/tables/reservations/active', {
      params: { tableId, at }
    })
    return response.data ?? null
  }
}

export const floorPlansApi = {
  async getLayout(): Promise<FloorSectionDto[]> {
    return tablesApi.getLayout()
  }
}

// Receipts API (Receipt Service - To be implemented)
// NOTE: These endpoints are not yet fully implemented in Spring Boot backend
export const receiptsApi = {
  async getTemplates() {
    const response = await apiClient.get('/api/receipts/templates')
    return response.data
  },

  async printReceipt(printJob: any) {
    const response = await apiClient.post('/api/receipts/print', printJob)
    return response.data
  },

  async printDirect(payload: { content: string; config: any }) {
    const response = await apiClient.post('/api/receipts/print-direct', payload)
    return response.data
  },

  async getPrinterStatus() {
    const response = await apiClient.get('/api/receipts/printer/status')
    return response.data
  },

  async archiveReceipt(archive: any) {
    const response = await apiClient.post('/api/receipts/archive', archive)
    return response.data
  },

  async getArchive(filters?: any) {
    const response = await apiClient.get('/api/receipts/archive', { params: filters })
    return response.data
  }
}

// Printers API (Printer Service - To be implemented)
// NOTE: These endpoints are not yet implemented in Spring Boot backend
export const printersApi = {
  async getAll() {
    const response = await apiClient.get('/api/printers')
    return response.data
  },

  async create(printer: any) {
    const response = await apiClient.post('/api/printers', printer)
    return response.data
  },

  async update(printerId: string, updates: any) {
    const response = await apiClient.put(`/api/printers/${printerId}`, updates)
    return response.data
  },

  async delete(printerId: string) {
    const response = await apiClient.delete(`/api/printers/${printerId}`)
    return response.data
  },

  async test(printerId: string) {
    const response = await apiClient.post(`/api/printers/${printerId}/test`)
    return response.data
  }
}

// Payment API (Operations Service)
// Payment processing, methods, transactions
export const paymentApi = {
  // Payment Methods Management
  async getPaymentMethods() {
    const response = await apiClient.get('/api/payments/methods')
    const methods = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.methods)
        ? response.data.methods
        : []
    return methods.map(mapPaymentMethodDto)
  },

  async getPaymentMethod(code: string) {
    const response = await apiClient.get(`/api/payments/methods/${code}`)
    return mapPaymentMethodDto(response.data)
  },

  async updatePaymentMethod(code: string, payload: any) {
    const response = await apiClient.put(`/api/payments/methods/${code}`, payload)
    return mapPaymentMethodDto(response.data)
  },

  // Payment Processing
  async processPayment(payload: {
    orderId: string
    amount: number
    paymentMethod: string
    tipAmount?: number
    cashDrawerSessionId?: number
  }) {
    const response = await apiClient.post('/api/payments/charges', payload)
    return response.data
  },

  async refundPayment(transactionId: number, amount: number) {
    const response = await apiClient.post('/api/payments/refunds', {
      transactionId,
      amount
    })
    return response.data
  },

  // Transaction Queries
  async getTransaction(id: number) {
    const response = await apiClient.get(`/api/payments/transactions/${id}`)
    return response.data
  },

  async getTransactionByReference(reference: string) {
    const response = await apiClient.get(`/api/payments/transactions/reference/${reference}`)
    return response.data
  },

  async getTransactionsByOrder(orderId: string) {
    const response = await apiClient.get(`/api/payments/transactions/order/${orderId}`)
    return response.data
  },

  async getTransactionsBySession(sessionId: number) {
    const response = await apiClient.get(`/api/payments/transactions/session/${sessionId}`)
    return response.data
  },

  async getAllTransactions() {
    const response = await apiClient.get('/api/payments/transactions')
    return response.data
  },

  // Analytics
  async getPaymentBreakdown() {
    const response = await apiClient.get('/api/payments/breakdown')
    return response.data
  },

  async getPaymentBreakdownForSession(sessionId: number) {
    const response = await apiClient.get(`/api/payments/breakdown/session/${sessionId}`)
    return response.data
  }
}

// Cash Drawer API (Operations Service)
// Cash drawer lifecycle management, sessions, reconciliation
export const cashDrawerApi = {
  // Cash Drawer Management
  async registerDrawer(payload: {
    name: string
    terminalId: string
    location?: string
  }) {
    const response = await apiClient.post('/api/cash-drawer/register', payload)
    return response.data
  },

  async getAllDrawers() {
    const response = await apiClient.get('/api/cash-drawer')
    return response.data
  },

  async getDrawer(drawerId: number) {
    const response = await apiClient.get(`/api/cash-drawer/${drawerId}`)
    return response.data
  },

  async getDrawerByTerminal(terminalId: string) {
    const response = await apiClient.get(`/api/cash-drawer/terminal/${terminalId}`)
    return response.data
  },

  async getDrawersByLocation(location: string) {
    const response = await apiClient.get(`/api/cash-drawer/location/${location}`)
    return response.data
  },

  // Session Management
  async openSession(drawerId: number, payload: {
    userId: number
    startingCash: number
    denominationCounts?: Record<string, number>
  }) {
    const response = await apiClient.post(`/api/cash-drawer/${drawerId}/open`, payload)
    return response.data
  },

  async closeSession(sessionId: number, payload: {
    userId: number
    countedCash: number
    denominationCounts?: Record<string, number>
    notes?: string
  }) {
    const response = await apiClient.post(`/api/cash-drawer/sessions/${sessionId}/close`, payload)
    return response.data
  },

  async getCurrentSession(drawerId: number) {
    const response = await apiClient.get(`/api/cash-drawer/${drawerId}/current-session`)
    return response.data
  },

  async getSessionsByDrawer(drawerId: number) {
    const response = await apiClient.get(`/api/cash-drawer/${drawerId}/sessions`)
    return response.data
  },

  async getSessionsByUser(userId: number) {
    const response = await apiClient.get(`/api/cash-drawer/sessions/user/${userId}`)
    return response.data
  },

  // Cash Transactions
  async recordCashDrop(sessionId: number, payload: {
    amount: number
    userId: number
    notes?: string
  }) {
    const response = await apiClient.post(`/api/cash-drawer/sessions/${sessionId}/drop`, payload)
    return response.data
  },

  async recordCashPayout(sessionId: number, payload: {
    amount: number
    userId: number
    notes: string
  }) {
    const response = await apiClient.post(`/api/cash-drawer/sessions/${sessionId}/payout`, payload)
    return response.data
  },

  async recordNoSale(sessionId: number, userId: number) {
    const response = await apiClient.post(`/api/cash-drawer/sessions/${sessionId}/no-sale`, null, {
      params: { userId }
    })
    return response.data
  },

  async getSessionTransactions(sessionId: number) {
    const response = await apiClient.get(`/api/cash-drawer/sessions/${sessionId}/transactions`)
    return response.data
  },

  async getTransactionsByType(type: string) {
    const response = await apiClient.get(`/api/cash-drawer/transactions/type/${type}`)
    return response.data
  },

  // Reconciliation
  async getReconciliation(sessionId: number) {
    const response = await apiClient.get(`/api/cash-drawer/sessions/${sessionId}/reconciliation`)
    return response.data
  },

  async getReconciliationsByStatus(status: string) {
    const response = await apiClient.get(`/api/cash-drawer/reconciliations/status/${status}`)
    return response.data
  },

  async getReconciliationsByDateRange(start: string, end: string) {
    const response = await apiClient.get('/api/cash-drawer/reconciliations', {
      params: { start, end }
    })
    return response.data
  },

  // Statistics
  async getSessionStatistics(sessionId: number) {
    const response = await apiClient.get(`/api/cash-drawer/sessions/${sessionId}/statistics`)
    return response.data
  },

  async getCurrentBalance(sessionId: number) {
    const response = await apiClient.get(`/api/cash-drawer/sessions/${sessionId}/balance`)
    return response.data
  },

  async getDenominationCounts(sessionId: number, countType: 'OPENING' | 'CLOSING') {
    const response = await apiClient.get(`/api/cash-drawer/sessions/${sessionId}/denominations`, {
      params: { countType }
    })
    return response.data
  }
}

export const uploadApi = {
  async uploadMenuItemImage(
    menuItemId: string | number,
    formData: FormData,
    options?: { onUploadProgress?: (event: AxiosProgressEvent) => void }
  ) {
    const config: AxiosRequestConfig<FormData> = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options?.onUploadProgress,
    }
    const response = await apiClient.post(`/api/menu-items/${menuItemId}/images`, formData, config)
    return response.data
  },

  async fetchMenuItemImages(menuItemId: string | number) {
    const response = await apiClient.get(`/api/menu-items/${menuItemId}`)
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    return Array.isArray(data?.images) ? data.images : []
  },

  async deleteMenuItemImage(menuItemId: string | number, imageId: string | number) {
    await apiClient.delete(`/api/menu-items/${menuItemId}/images/${imageId}`)
  },

  async uploadLegacyImage(
    formData: FormData,
    options?: { onUploadProgress?: (event: AxiosProgressEvent) => void }
  ) {
    const config: AxiosRequestConfig<FormData> = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options?.onUploadProgress,
    }
    const response = await apiClient.post('/api/upload/image', formData, config)
    return response.data
  },

  async deleteLegacyImage(url: string) {
    const response = await apiClient.delete('/api/upload/image', {
      data: { url },
    })
    return response.data
  }
}

// Export axios instance
export { apiClient }

// Default export
export default {
  auth: authApi,
  users: usersApi,
  categories: categoriesApi,
  menuItems: menuItemsApi,
  orders: ordersApi,
  analytics: analyticsApi,
  shifts: shiftsApi,
  preferences: preferencesApi,
  clockEntries: clockEntriesApi,
  auditLogs: auditLogsApi,
  password: passwordApi,
  loyalty: loyaltyApi,
  tables: tablesApi,
  floorPlans: floorPlansApi,
  receipts: receiptsApi,
  printers: printersApi,
  payment: paymentApi,
  cashDrawer: cashDrawerApi,
  upload: uploadApi
}
