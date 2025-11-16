/**
 * API Configuration - Centralized backend API configuration
 *
 * Manages:
 * - API base URLs
 * - Service endpoints
 * - Request/response interceptors
 * - Error handling
 * - Token management
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useToast } from 'vue-toastification'

// API Gateway URL (Spring Cloud Gateway)
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance for API calls
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    }

    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.status}:`, response.data)
    }
    return response
  },
  (error: AxiosError) => {
    const toast = useToast()

    // Extract error details
    const status = error.response?.status
    const message = (error.response?.data as any)?.message || error.message
    const errorData = error.response?.data

    // Handle specific error codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        console.error('[API] Unauthorized:', message)

        // Clear auth data
        localStorage.removeItem('auth_token')

        // Don't show toast for auth validation requests
        if (!error.config?.url?.includes('/auth/validate')) {
          toast.error('Session expired. Please login again.')
        }

        // Redirect to login (handled by router guard)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        break

      case 403:
        // Forbidden - insufficient permissions
        console.error('[API] Forbidden:', message)
        toast.error('Access denied. You don\'t have permission for this action.')
        break

      case 404:
        // Not found
        console.error('[API] Not found:', message)
        // Don't show toast for 404s, let components handle it
        break

      case 422:
        // Validation error
        console.error('[API] Validation error:', errorData)
        // Show validation errors
        if (Array.isArray((errorData as any)?.errors)) {
          (errorData as any).errors.forEach((err: string) => toast.error(err))
        } else {
          toast.error(message || 'Validation failed')
        }
        break

      case 500:
        // Server error
        console.error('[API] Server error:', message)
        toast.error('Server error. Please try again later.')
        break

      case 503:
        // Service unavailable
        console.error('[API] Service unavailable:', message)
        toast.error('Service temporarily unavailable. Please try again.')
        break

      default:
        // Network error or other
        if (!error.response) {
          console.error('[API] Network error:', error.message)
          toast.error('Network error. Please check your connection.')
        } else {
          console.error('[API] Error:', status, message)
          toast.error(message || 'An error occurred')
        }
    }

    return Promise.reject(error)
  }
)

/**
 * API Service Endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints (User Service via Gateway)
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    validateToken: '/api/auth/validate',
    refreshToken: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
    health: '/api/auth/health'
  },

  // User endpoints (User Service via Gateway)
  user: {
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    changePassword: '/api/users/password',
    deleteAccount: '/api/users/account'
  },

  // Menu endpoints (Inventory Service via Gateway)
  menu: {
    public: '/api/menu/public',
    categories: '/api/menu/categories',
    items: '/api/menu/items',
    itemById: (id: string) => `/api/menu/items/${id}`,
    featured: '/api/menu/featured',
    search: '/api/menu/search'
  },

  // Order endpoints (Order Service via Gateway)
  orders: {
    create: '/api/orders',
    list: '/api/orders',
    getById: (id: string) => `/api/orders/${id}`,
    update: (id: string) => `/api/orders/${id}`,
    cancel: (id: string) => `/api/orders/${id}/cancel`,
    track: (id: string) => `/api/orders/${id}/track`,
    history: '/api/orders/history',
    active: '/api/orders/active'
  },

  // Payment endpoints (Order Service via Gateway)
  payment: {
    createIntent: '/api/payments/intent',
    confirm: '/api/payments/confirm',
    methods: '/api/payments/methods',
    addMethod: '/api/payments/methods',
    removeMethod: (id: string) => `/api/payments/methods/${id}`
  },

  // Analytics endpoints (Analytics Service via Gateway)
  analytics: {
    userStats: '/api/analytics/user/stats',
    popularItems: '/api/analytics/popular-items',
    recommendations: '/api/analytics/recommendations'
  },

  // QR Code endpoints (Order Service via Gateway)
  qr: {
    generatePayment: '/api/qr/payment',
    verifyPayment: '/api/qr/payment/verify',
    tableScan: '/api/qr/table'
  }
} as const

/**
 * Generic API request wrapper
 */
export async function apiRequest<T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * API helper methods
 */
export const api = {
  // GET request
  get: <T = any>(url: string, config?: any) =>
    apiRequest<T>('get', url, undefined, config),

  // POST request
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiRequest<T>('post', url, data, config),

  // PUT request
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiRequest<T>('put', url, data, config),

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiRequest<T>('patch', url, data, config),

  // DELETE request
  delete: <T = any>(url: string, config?: any) =>
    apiRequest<T>('delete', url, undefined, config)
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/actuator/health', {
      timeout: 5000 // 5 seconds
    })
    return response.status === 200
  } catch (error) {
    console.error('[API] Backend health check failed:', error)
    return false
  }
}

/**
 * Get backend service status
 */
export async function getServiceStatus(): Promise<{
  gateway: boolean
  userService: boolean
  orderService: boolean
  inventoryService: boolean
}> {
  const status = {
    gateway: false,
    userService: false,
    orderService: false,
    inventoryService: false
  }

  try {
    // Check gateway
    const gatewayHealth = await apiClient.get('/actuator/health', { timeout: 3000 })
    status.gateway = gatewayHealth.status === 200

    // Check user service
    try {
      const userHealth = await apiClient.get(API_ENDPOINTS.auth.health, { timeout: 3000 })
      status.userService = userHealth.status === 200
    } catch {}

    // Check other services (add as needed)

  } catch (error) {
    console.error('[API] Service status check failed:', error)
  }

  return status
}

export default api
