/**
 * API service for Spring Boot microservices backend
 * Communicates with API Gateway (port 8080)
 * Handles authentication, menu/inventory, and orders
 */

import axios, { AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import { useToast } from 'vue-toastification'
import { useNetworkStore } from '@/stores/network'
import { formatCurrency } from '@/utils/currency'

// API Configuration - Spring Boot API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 60000, // 60 seconds for slow networks
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
    const networkStore = useNetworkStore()

    if (!error.response) {
      // Network error - probably offline
      networkStore.setOnline(false)
      console.error('Network error:', error.message)
      toast.error('Network error. Please check your connection.')
    } else {
      // HTTP error
      console.error('API error:', error.response.status, error.response.data)

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token')
        toast.error('Session expired. Please log in again.')
      }
    }

    return Promise.reject(error)
  }
)

// Generic API response interface (Spring Boot format)
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  timestamp?: string
  status?: number
}

// Menu/Inventory API (Inventory Service via API Gateway)
export const menuApi = {
  /**
   * Get all categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/categories?activeOnly=true')
      return response.data || []
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  },

  /**
   * Get menu items (optionally filtered by category)
   */
  async getMenuItems(categoryId?: number): Promise<any[]> {
    try {
      let url = '/api/menu-items?availableOnly=true'
      if (categoryId) {
        url = `/api/menu-items/category/${categoryId}`
      }
      const response = await apiClient.get(url)
      return response.data || []
    } catch (error: any) {
      console.error('Failed to fetch menu items:', error)
      return []
    }
  },

  /**
   * Get featured menu items
   */
  async getFeaturedItems(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/menu-items/featured')
      return response.data || []
    } catch (error: any) {
      console.error('Failed to fetch featured items:', error)
      return []
    }
  },

  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/menu-items/search?name=${encodeURIComponent(query)}`)
      return response.data || []
    } catch (error: any) {
      console.error('Failed to search menu items:', error)
      return []
    }
  },

  /**
   * Get menu item by ID
   */
  async getMenuItem(id: number): Promise<any | null> {
    try {
      const response = await apiClient.get(`/api/menu-items/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch menu item:', error)
      return null
    }
  },

  /**
   * Get public menu (categories with items)
   */
  async getPublicMenu(): Promise<{ categories: any[] }> {
    try {
      const categories = await this.getCategories()
      const categoriesWithItems = await Promise.all(
        categories.map(async (category) => {
          const items = await this.getMenuItems(category.id)
          return { ...category, menuItems: items }
        })
      )
      return { categories: categoriesWithItems }
    } catch (error: any) {
      console.error('Failed to fetch public menu:', error)
      return { categories: [] }
    }
  }
}

// Orders API (Order Service via API Gateway)
export const ordersApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: {
    userId: number
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
    items: Array<{
      menuItemId: number
      menuItemName: string
      menuItemSku?: string
      quantity: number
      unitPrice: number
      specialInstructions?: string
    }>
    tableNumber?: string
    deliveryAddress?: string
    deliveryInstructions?: string
    deliveryFee?: number
    notes?: string
    paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'ONLINE'
    taxAmount?: number
    discountAmount?: number
  }): Promise<any> {
    try {
      const response = await apiClient.post('/api/orders', orderData)
      return response.data
    } catch (error: any) {
      console.error('Failed to create order:', error)
      throw error
    }
  },

  /**
   * Get order by ID
   */
  async getOrder(id: number): Promise<any | null> {
    try {
      const response = await apiClient.get(`/api/orders/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch order:', error)
      return null
    }
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<any | null> {
    try {
      const response = await apiClient.get(`/api/orders/number/${orderNumber}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch order:', error)
      return null
    }
  },

  /**
   * Get my orders (current user)
   */
  async getMyOrders(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/orders/my')
      return response.data || []
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      return []
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number, reason?: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/cancel`, null, {
        params: { reason: reason || 'Cancelled by customer' }
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to cancel order:', error)
      throw error
    }
  },

  /**
   * Track order status (for public tracking)
   */
  async trackOrder(orderNumber: string): Promise<any | null> {
    return this.getOrderByNumber(orderNumber)
  }
}

// Authentication API (User Service via API Gateway)
export const authApi = {
  /**
   * Register new user
   */
  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<{ token: string; user: any }> {
    try {
      const response = await apiClient.post('/api/auth/register', userData)
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return response.data
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  /**
   * Login user
   */
  async login(credentials: {
    email: string
    password: string
  }): Promise<{ token: string; user: any }> {
    try {
      const response = await apiClient.post('/api/auth/login', credentials)
      const { token, user } = response.data
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      return response.data
    } catch (error: any) {
      console.error('Login failed:', error)
      throw error
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token')
  }
}

// Health check API
export const healthApi = {
  /**
   * Check API health and connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/actuator/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

// Utility functions
export const apiUtils = {
  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return formatCurrency(amount)
  },

  /**
   * Calculate order total
   */
  calculateOrderTotal(items: Array<{ unitPrice: number; quantity: number }>, taxAmount = 0, discountAmount = 0, deliveryFee = 0): number {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    return subtotal + taxAmount - discountAmount + deliveryFee
  }
}

// Export configured axios instance for direct use if needed
export { apiClient }

// Default export with all APIs
export default {
  menu: menuApi,
  orders: ordersApi,
  auth: authApi,
  health: healthApi,
  utils: apiUtils
}
