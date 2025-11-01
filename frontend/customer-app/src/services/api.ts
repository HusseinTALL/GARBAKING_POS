/**
 * API service for communicating with the backend
 * Handles HTTP requests, error handling, and offline scenarios
 */

import axios, { AxiosResponse, AxiosError } from 'axios'
import { useToast } from 'vue-toastification'
import { useNetworkStore } from '@/stores/network'
import { formatCurrency } from '@/utils/currency'
import { useMenuStore } from '@/stores/menu'

// API Configuration
const DEFAULT_GATEWAY_URL = 'http://localhost:8080'
const normalizeBase = (url: string) => (url ? url.replace(/\/$/, '') : '')
const LOCAL_API_URL = normalizeBase(
  import.meta.env.VITE_API_GATEWAY_URL ||
    import.meta.env.VITE_API_URL ||
    DEFAULT_GATEWAY_URL
)
const CLOUD_API_URL = normalizeBase(
  import.meta.env.VITE_API_CLOUD_URL || LOCAL_API_URL
)

// Create axios instance
const apiClient = axios.create({
  baseURL: LOCAL_API_URL || undefined,
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
  const baseUrl = useLocal ? LOCAL_API_URL : CLOUD_API_URL
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
    const response = await apiClient({
      url,
      method: options.method || 'GET',
      params: options.params,
      data: options.data,
      headers: options.headers
    })
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

// Recommendations API
export interface BudgetSuggestionRequest {
  budget: number
  preferences?: {
    dietary?: string[]
    timeOfDay?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    tags?: string[]
  }
  context?: {
    customerId?: string
    recentOrderIds?: string[]
    locale?: string
    partySize?: number
  }
}

export interface BudgetSuggestionItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  categoryName?: string
}

export interface BudgetSuggestionBundle {
  id: string
  title: string
  description?: string
  total: number
  savings?: number
  highlight?: string
  tags: string[]
  items: BudgetSuggestionItem[]
  source?: 'REMOTE' | 'LOCAL'
}

export interface BudgetSuggestionResponsePayload {
  success?: boolean
  generatedAt?: string
  suggestions?: BudgetSuggestionBundle[]
  message?: string
  error?: string
}

export const recommendationsApi = {
  /**
   * Request budget-based menu suggestions from the backend recommender
   */
  async getBudgetSuggestions(
    payload: BudgetSuggestionRequest
  ): Promise<ApiResponse<{ suggestions: BudgetSuggestionBundle[]; generatedAt?: string; message?: string }>> {
    try {
      const raw = await makeRequest<BudgetSuggestionResponsePayload>('/api/recommendations/budget', {
        method: 'POST',
        data: payload
      })

      const suggestions = Array.isArray(raw?.suggestions) ? raw!.suggestions! : []
      const success = typeof raw?.success === 'boolean' ? raw!.success! : suggestions.length > 0
      const message = raw?.message

      return {
        success,
        data: {
          suggestions,
          generatedAt: raw?.generatedAt,
          message
        },
        message,
        error: success ? undefined : raw?.error || message || 'Failed to load budget suggestions'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to load budget suggestions'
      }
    }
  }
}

// Orders API
const PAYMENT_METHOD_MAP: Record<string, string> = {
  MOBILE: 'MOBILE_MONEY',
  OTHER: 'ONLINE'
}

const getGuestUserId = (): number => {
  const raw = Number(import.meta.env.VITE_GUEST_USER_ID ?? '4')
  if (!Number.isNaN(raw) && raw > 0) {
    return raw
  }
  // Fallback to seeded customer user (see mock-data.sql)
  return 4
}

export const ordersApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: {
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    subtotal?: number
    taxAmount?: number
    discountAmount?: number
    deliveryFee?: number
    deliveryAddress?: string
    deliveryInstructions?: string
    scheduledFor?: string
    tableNumber?: string
    orderType: string
    items: Array<{
      menuItemId: string
      sku?: string
      name: string
      price: number
      quantity: number
      notes?: string
    }>
    notes?: string
    specialRequests?: string
    paymentMethod?: string
  }): Promise<ApiResponse<{ order: any; orderNumber: string }>> {
    try {
      const menuStore = useMenuStore()
      if (!menuStore.menuItems.length) {
        try {
          await menuStore.fetchMenu()
        } catch (error) {
          console.warn('Unable to refresh menu items before order submission', error)
        }
      }

      const normalizedItems = new Map<number, {
        menuItemId: number
        menuItemName: string
        menuItemSku?: string
        quantity: number
        unitPrice: number
        specialInstructions?: string
      }>()

      for (const item of orderData.items) {
        const rawId = String(item.menuItemId ?? '')
        let numericId = Number(rawId)
        let menuItem = menuStore.menuItems.find(menu => String(menu.id) === rawId)

        if (Number.isNaN(numericId) || !menuItem) {
          const fallbackMatch = menuStore.menuItems.find(menu =>
            menu.sku?.toLowerCase() === rawId.toLowerCase() ||
            menu.name.toLowerCase() === (item.name ?? '').toLowerCase()
          )

          if (fallbackMatch) {
            menuItem = fallbackMatch
            numericId = Number(fallbackMatch.id)
          }
        }

        if (Number.isNaN(numericId)) {
          return {
            success: false,
            error: `Article inconnu (${rawId})`
          }
        }

        const unitPrice = menuItem?.price ?? item.price

        if (typeof unitPrice !== 'number' || Number.isNaN(unitPrice)) {
          return {
            success: false,
            error: `Prix manquant pour l'article ${menuItem?.name ?? item.name}`
          }
        }

        const existing = normalizedItems.get(numericId)
        if (existing) {
          existing.quantity += item.quantity
          if (item.notes) {
            existing.specialInstructions = item.notes
          }
        } else {
          normalizedItems.set(numericId, {
            menuItemId: numericId,
            menuItemName: menuItem?.name ?? item.name,
            menuItemSku: menuItem?.sku ?? item.sku,
            quantity: item.quantity,
            unitPrice,
            specialInstructions: item.notes
          })
        }
      }

      const paymentMethod = orderData.paymentMethod || 'CASH'

      if (normalizedItems.size === 0) {
        return {
          success: false,
          error: 'Aucun article valide dans le panier'
        }
      }

      const payload = {
        orderType: orderData.orderType,
        userId: getGuestUserId(),
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        items: Array.from(normalizedItems.values()).map(item => ({
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          menuItemSku: item.menuItemSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          specialInstructions: item.specialInstructions
        })),
        taxAmount: orderData.taxAmount ?? 0,
        discountAmount: orderData.discountAmount ?? 0,
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        deliveryInstructions: orderData.deliveryInstructions,
        deliveryFee: orderData.deliveryFee ?? 0,
        notes: orderData.notes || orderData.specialRequests,
        tableNumber: orderData.tableNumber,
        scheduledFor: orderData.scheduledFor
      }

      const raw = await makeRequest<any>('/api/orders', {
        method: 'POST',
        data: payload
      })

      if (raw && typeof raw === 'object' && (raw as any).success !== undefined) {
        return raw
      }

      if (raw && typeof raw === 'object') {
        return {
          success: true,
          data: {
            order: raw,
            orderNumber: raw.orderNumber
          }
        }
      }

      return {
        success: false,
        error: 'Réponse inattendue du serveur'
      }
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
      const raw = await makeRequest<{ orders?: any[]; count?: number }>('/api/orders/customer/history', {
        method: 'GET',
        params: { phone }
      })

      if (raw && Array.isArray(raw.orders)) {
        return {
          success: true,
          data: {
            orders: raw.orders,
            count: typeof raw.count === 'number' ? raw.count : raw.orders.length
          }
        }
      }

      return {
        success: false,
        error: 'Réponse inattendue du serveur'
      }
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
    return formatCurrency(amount)
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
