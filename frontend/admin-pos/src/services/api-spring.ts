/**
 * API service for Spring Boot microservices backend (Admin POS)
 * Communicates with API Gateway (port 8080)
 * Handles authentication, menu/inventory management, and order management
 */

import axios from 'axios'
import type { AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import { useToast } from 'vue-toastification'

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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const toast = useToast()

    if (!error.response) {
      console.error('Network error:', error.message)
      toast.error('Network error. Please check your connection.')
    } else {
      console.error('API error:', error.response.status, error.response.data)

      if (error.response.status === 401) {
        localStorage.removeItem('auth_token')
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Authentication API (User Service via API Gateway)
export const authApi = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials)
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async register(userData: { name: string; email: string; password: string; phone?: string; role?: string }) {
    try {
      const response = await apiClient.post('/api/auth/register', userData)
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async logout(reason?: string) {
    try {
      await apiClient.post('/api/auth/logout', { reason })
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
    try {
      const response = await apiClient.post('/api/auth/refresh', { refreshToken })
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async verify() {
    try {
      const response = await apiClient.get('/api/auth/verify')
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async getMe() {
    try {
      const response = await apiClient.get('/api/users/me')
      return response.data
    } catch (error: any) {
      throw error
    }
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

  async getById(id: number) {
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
  }
}

// Orders API (Order Service)
export const ordersApi = {
  async getAll() {
    const response = await apiClient.get('/api/orders')
    return response.data || []
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

  async updateStatus(orderId: number, status: string, reason?: string) {
    const response = await apiClient.put(`/api/orders/${orderId}/status`, {
      status,
      reason
    })
    return response.data
  },

  async updatePayment(orderId: number, paymentData: any) {
    const response = await apiClient.put(`/api/orders/${orderId}/payment`, paymentData)
    return response.data
  },

  async cancel(orderId: number, reason?: string) {
    const response = await apiClient.post(`/api/orders/${orderId}/cancel`, null, {
      params: { reason: reason || 'Cancelled by staff' }
    })
    return response.data
  },

  async delete(id: number) {
    await apiClient.delete(`/api/orders/${id}`)
  }
}

// Statistics/Analytics API
// Analytics API (Analytics Service - To be implemented)
// NOTE: These endpoints are not yet fully implemented in Spring Boot backend
// Some endpoints may aggregate data from existing services
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

  async getDashboardData() {
    const response = await apiClient.get('/api/analytics/dashboard')
    return response.data
  },

  async getSalesData(params?: { startDate?: string; endDate?: string }) {
    const response = await apiClient.get('/api/analytics/sales', { params })
    return response.data
  },

  async getMenuPerformance(days: number = 30) {
    const response = await apiClient.get('/api/analytics/menu-performance', {
      params: { days }
    })
    return response.data
  },

  async getPeakHours(days: number = 7) {
    const response = await apiClient.get('/api/analytics/peak-hours', {
      params: { days }
    })
    return response.data
  },

  async getPaymentMethods(days: number = 30) {
    const response = await apiClient.get('/api/analytics/payment-methods', {
      params: { days }
    })
    return response.data
  },

  async getCustomerInsights(days: number = 30) {
    const response = await apiClient.get('/api/analytics/customer-insights', {
      params: { days }
    })
    return response.data
  },

  async getProductAnalytics(period: string) {
    const response = await apiClient.get('/api/analytics/products', {
      params: { period }
    })
    return response.data
  },

  async getCategoryAnalytics(period: string) {
    const response = await apiClient.get('/api/analytics/categories', {
      params: { period }
    })
    return response.data
  },

  async getStaffPerformance(period: string) {
    const response = await apiClient.get('/api/analytics/staff', {
      params: { period }
    })
    return response.data
  },

  async getCustomerAnalytics(period: string) {
    const response = await apiClient.get('/api/analytics/customers', {
      params: { period }
    })
    return response.data
  },

  async getTimeAnalytics(period: string) {
    const response = await apiClient.get('/api/analytics/time', {
      params: { period }
    })
    return response.data
  },

  async getComparisonData(period: string) {
    const response = await apiClient.get('/api/analytics/comparison', {
      params: { period }
    })
    return response.data
  },

  async getInventoryAnalytics() {
    const response = await apiClient.get('/api/analytics/inventory')
    return response.data
  },

  async generateReport(reportType: string, config: any) {
    const response = await apiClient.post('/api/analytics/reports/generate', {
      type: reportType,
      config
    })
    return response.data
  },

  async scheduleReport(config: any) {
    const response = await apiClient.post('/api/analytics/reports/schedule', config)
    return response.data
  },

  async getReportConfigs() {
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

  async enrollCustomer(payload: any) {
    const response = await apiClient.post('/api/loyalty/enroll', payload)
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

  async awardPoints(payload: any) {
    const response = await apiClient.post('/api/loyalty/points/award', payload)
    return response.data
  },

  async redeemPoints(payload: any) {
    const response = await apiClient.post('/api/loyalty/points/redeem', payload)
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

  async getCampaigns() {
    const response = await apiClient.get('/api/loyalty/campaigns')
    return response.data
  },

  async getAnalytics(params?: any) {
    const response = await apiClient.get('/api/loyalty/analytics', { params })
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

// Tables API (Table Service - To be implemented)
// NOTE: These endpoints are not yet implemented in Spring Boot backend
export const tablesApi = {
  async getAll() {
    const response = await apiClient.get('/api/tables')
    return response.data
  },

  async updateStatus(tableId: string, payload: { status: string; notes?: string }) {
    const response = await apiClient.patch(`/api/tables/${tableId}/status`, payload)
    return response.data
  },

  async assignOrder(tableId: string, orderId: string) {
    const response = await apiClient.post(`/api/tables/${tableId}/assign-order`, { orderId })
    return response.data
  },

  async clearTable(tableId: string) {
    const response = await apiClient.post(`/api/tables/${tableId}/clear`)
    return response.data
  },

  async createReservation(tableId: string, reservation: any) {
    const response = await apiClient.post(`/api/tables/${tableId}/reservations`, reservation)
    return response.data
  },

  async updateReservation(tableId: string, reservationId: string, updates: any) {
    const response = await apiClient.patch(`/api/tables/${tableId}/reservations/${reservationId}`, updates)
    return response.data
  },

  async seatReservation(tableId: string, reservationId: string) {
    const response = await apiClient.post(`/api/tables/${tableId}/reservations/${reservationId}/seat`)
    return response.data
  },

  async updatePosition(tableId: string, position: { x: number; y: number }) {
    const response = await apiClient.patch(`/api/tables/${tableId}/position`, { position })
    return response.data
  },

  async bulkUpdateStatus(tableIds: string[], status: string) {
    const response = await apiClient.patch('/api/tables/bulk-status', { tableIds, status })
    return response.data
  }
}

// Floor Plans API (Table Service - To be implemented)
// NOTE: These endpoints are not yet implemented in Spring Boot backend
export const floorPlansApi = {
  async getActive() {
    const response = await apiClient.get('/api/floor-plans/active')
    return response.data
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

// Payment API (Payment Service - To be implemented)
// NOTE: These endpoints are not yet implemented in Spring Boot backend
// They need to be created in a new Payment Service microservice
export const paymentApi = {
  async getPaymentMethods() {
    const response = await apiClient.get('/api/payment/methods')
    return response.data
  },

  async processPayment(payload: any) {
    const response = await apiClient.post('/api/payment/process', payload)
    return response.data
  },

  async processSplitPayment(payload: any) {
    const response = await apiClient.post('/api/payment/process-split', payload)
    return response.data
  },

  async refundPayment(transactionId: string, amount: number, reason?: string) {
    const response = await apiClient.post(`/api/payment/refund/${transactionId}`, {
      amount,
      reason
    })
    return response.data
  },

  async openCashDrawer(staffId: string, startingAmount: number) {
    const response = await apiClient.post('/api/payment/cash-drawer/open', {
      staffId,
      startingAmount
    })
    return response.data
  },

  async closeCashDrawer(drawerData: any) {
    const response = await apiClient.post('/api/payment/cash-drawer/close', drawerData)
    return response.data
  },

  async addCashTransaction(transaction: any) {
    const response = await apiClient.post('/api/payment/cash-drawer/transaction', transaction)
    return response.data
  },

  async printReceipt(transactionId: string) {
    const response = await apiClient.post(`/api/payment/receipt/${transactionId}`)
    return response.data
  },

  async getCashDrawerStatus() {
    const response = await apiClient.get('/api/payment/cash-drawer/status')
    return response.data
  },

  async getRecentTransactions(limit = 50) {
    const response = await apiClient.get(`/api/payment/transactions/recent?limit=${limit}`)
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
  payment: paymentApi
}
