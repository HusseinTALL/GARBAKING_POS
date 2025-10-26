/**
 * API service for communicating with the backend
 * Handles HTTP requests, error handling, and offline scenarios
 */

import axios, { AxiosResponse, AxiosError } from 'axios'
import { useToast } from 'vue-toastification'
import { useNetworkStore } from '@/stores/network'

// API Configuration
// Use relative URLs to leverage Vite proxy in development
// Vite proxy forwards /api/* requests to backend (localhost:3001)
const API_BASE_URL = ''
const LOCAL_API_URL = ''

// Create axios instance
const apiClient = axios.create({
  timeout: 60000, // 60 seconds - increased for slow networks and heavy menu loads
  headers: {
    'Content-Type': 'application/json',
  }
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const toast = useToast()
    const networkStore = useNetworkStore()

    if (!error.response) {
      // Network error - probably offline
      networkStore.setOnline(false)
      console.error('Network error:', error.message)
    } else {
      // HTTP error
      console.error('API error:', error.response.status, error.response.data)
    }

    return Promise.reject(error)
  }
)

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Helper function to determine API endpoint
const getApiUrl = (endpoint: string, useLocal = true): string => {
  const baseUrl = useLocal ? LOCAL_API_URL : API_BASE_URL
  return `${baseUrl}${endpoint}`
}

// Helper function to make API calls with fallback
const makeRequest = async <T>(
  endpoint: string,
  options: any = {},
  useLocal = true
): Promise<ApiResponse<T>> => {
  try {
    const url = getApiUrl(endpoint, useLocal)
    const response = await apiClient({ url, ...options })
    return response.data
  } catch (error: any) {
    // If local request fails, try cloud API as fallback
    if (useLocal && error.code === 'ECONNREFUSED') {
      console.log('Local API unavailable, trying cloud API...')
      return makeRequest(endpoint, options, false)
    }

    throw error
  }
}

// Menu API
export const menuApi = {
  /**
   * Get public menu (categories with menu items)
   */
  async getPublicMenu(): Promise<ApiResponse<{ categories: any[] }>> {
    try {
      return await makeRequest('/api/menu/public', { method: 'GET' })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch menu'
      }
    }
  },

  /**
   * Get menu categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    try {
      return await makeRequest('/api/menu/categories', { method: 'GET' })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch categories'
      }
    }
  },

  /**
   * Get menu items with filtering
   */
  async getMenuItems(params?: {
    categoryId?: string
    search?: string
    available?: boolean
  }): Promise<ApiResponse<{ menuItems: any[] }>> {
    try {
      return await makeRequest('/api/menu/items', {
        method: 'GET',
        params
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch menu items'
      }
    }
  }
}

// Orders API
export const ordersApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: {
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    tableNumber?: string
    orderType: string
    items: Array<{
      menuItemId: string
      sku?: string
      name?: string
      price?: number
      quantity: number
      notes?: string
    }>
    notes?: string
    specialRequests?: string
    paymentMethod?: string
  }): Promise<ApiResponse<{ order: any; orderNumber: string }>> {
    try {
      // Transform items to orderItems format expected by backend
      // Backend only needs: menuItemId, quantity, notes
      const orderItems = orderData.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes || undefined
      }))

      // Prepare payload for public order endpoint
      const payload = {
        storeId: import.meta.env.VITE_STORE_ID || 'store_001',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        tableNumber: orderData.tableNumber,
        orderType: orderData.orderType,
        orderItems, // Use transformed orderItems
        notes: orderData.notes || orderData.specialRequests, // Combine notes
        paymentMethod: orderData.paymentMethod || 'CASH'
      }

      // Call public order endpoint (no auth required)
      return await makeRequest('/api/orders/public', {
        method: 'POST',
        data: payload
      })
    } catch (error: any) {
      // Add to offline queue if request fails
      const networkStore = useNetworkStore()
      const orderId = `offline-${Date.now()}`
      networkStore.addPendingSync(orderId)

      return {
        success: false,
        error: error.message || 'Failed to create order'
      }
    }
  },

  /**
   * Get order status by order number
   */
  async getOrderStatus(orderNumber: string): Promise<ApiResponse<{ order: any }>> {
    try {
      return await makeRequest(`/api/orders/status/${orderNumber}`, {
        method: 'GET'
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch order status'
      }
    }
  },

  /**
   * Track order by number (for customer use)
   */
  async trackOrder(orderNumber: string): Promise<ApiResponse<{ order: any }>> {
    try {
      return await makeRequest(`/api/orders/track/${orderNumber}`, {
        method: 'GET'
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to track order'
      }
    }
  },

  /**
   * Get customer order history by phone number
   */
  async getCustomerOrderHistory(phone: string): Promise<ApiResponse<{ orders: any[]; count: number }>> {
    try {
      return await makeRequest('/api/orders/customer/history', {
        method: 'GET',
        params: { phone }
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch order history'
      }
    }
  },

  /**
   * Cancel an order by order number
   */
  async cancelOrder(orderNumber: string, reason?: string): Promise<ApiResponse<{ order: any; message: string }>> {
    try {
      return await makeRequest(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        data: { reason: reason || 'Cancelled by customer' }
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to cancel order'
      }
    }
  }
}

// Health check API
export const healthApi = {
  /**
   * Check API health and connectivity
   */
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    try {
      return await makeRequest('/api/health', { method: 'GET' })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed'
      }
    }
  },

  /**
   * Check local network connectivity
   */
  async checkLocalConnectivity(): Promise<boolean> {
    try {
      const response = await axios.get(`${LOCAL_API_URL}/health`, {
        timeout: 3000
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

// Utility functions
export const apiUtils = {
  /**
   * Check if we're on the local restaurant network
   */
  isLocalNetwork(): boolean {
    const hostname = window.location.hostname
    return hostname === '192.168.4.1' || hostname.startsWith('192.168.4.')
  },

  /**
   * Get appropriate API base URL
   */
  getBaseUrl(): string {
    return this.isLocalNetwork() ? LOCAL_API_URL : API_BASE_URL
  },

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return `${amount.toLocaleString()} FCFA`
  },

  /**
   * Generate unique client ID for offline orders
   */
  generateClientOrderId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(): string {
    return `idem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export configured axios instance for direct use if needed
export { apiClient }

// Default export with all APIs
export default {
  menu: menuApi,
  orders: ordersApi,
  health: healthApi,
  utils: apiUtils
}