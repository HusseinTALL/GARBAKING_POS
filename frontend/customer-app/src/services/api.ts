/**
 * API service for communicating with the backend
 * Handles HTTP requests, error handling, and offline scenarios
 */

import axios, { AxiosResponse, AxiosError } from 'axios'
import { useToast } from 'vue-toastification'
import { useNetworkStore } from '@/stores/network'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const LOCAL_API_URL = 'http://192.168.4.1' // Local restaurant network

// Create axios instance
const apiClient = axios.create({
  timeout: 10000,
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
      return await makeRequest('/local/menu', { method: 'GET' })
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
    tableNumber?: string
    orderType: string
    orderItems: Array<{
      menuItemId: string
      quantity: number
      notes?: string
    }>
    notes?: string
  }): Promise<ApiResponse<{ order: any }>> {
    try {
      // Try local endpoint first for offline capability
      return await makeRequest('/local/orders', {
        method: 'POST',
        data: {
          ...orderData,
          clientOrderId: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          storeId: 'store_001',
          createdAt: new Date().toISOString()
        }
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
  }
}

// Health check API
export const healthApi = {
  /**
   * Check API health and connectivity
   */
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    try {
      return await makeRequest('/health', { method: 'GET' })
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