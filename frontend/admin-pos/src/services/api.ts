/**
 * API service for backend communication
 * Centralized HTTP client with authentication, error handling, and request/response interceptors
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export class ApiService {
  private axiosInstance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds - increased for analytics queries and slow networks
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and request ID
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        const token = authStore.token

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        if (!config.headers['x-request-id']) {
          config.headers['x-request-id'] = this.generateRequestId()
        }

        // Add timestamp to prevent caching
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          }
        }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url} [${config.headers['x-request-id']}]`)
        return config
      },
      (error) => {
        console.error('[API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle common responses
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)

        // Handle non-JSON responses
        if (typeof response.data === 'string') {
          return response
        }

        // Validate API response format
        if (typeof response.data === 'object' && response.data !== null) {
          if (!('success' in response.data)) {
            console.warn('[API] Response missing success field:', response.data)
          }
        }

        return response
      },
      (error: AxiosError<ApiResponse>) => {
        return this.handleError(error)
      }
    )
  }

  /**
   * Generate a unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors are retryable
      return true
    }

    const status = error.response.status
    // Retry on server errors and gateway timeouts
    return status === 408 || status === 429 || status === 500 ||
           status === 502 || status === 503 || status === 504
  }

  /**
   * Retry a request with exponential backoff
   */
  private async retryRequest<T>(
    request: () => Promise<AxiosResponse<T>>,
    maxRetries: number = 3,
    currentRetry: number = 0
  ): Promise<AxiosResponse<T>> {
    try {
      return await request()
    } catch (error: any) {
      if (currentRetry >= maxRetries || !this.isRetryableError(error)) {
        throw error
      }

      // Calculate delay with exponential backoff: 2^retry * 1000ms
      const delay = Math.pow(2, currentRetry) * 1000
      console.log(`[API] Retrying request (${currentRetry + 1}/${maxRetries}) after ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryRequest(request, maxRetries, currentRetry + 1)
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<ApiResponse>): Promise<never> {
    const authStore = useAuthStore()

    console.error('[API] Response error:', error.response?.status, error.response?.data)

    // Handle network errors
    if (!error.response) {
      const networkError: ApiError = {
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        code: 'NETWORK_ERROR'
      }
      return Promise.reject(networkError)
    }

    const { status, data } = error.response

    // Handle authentication errors
    if (status === 401) {
      authStore.logout()
      const authError: ApiError = {
        message: 'Session expirée. Veuillez vous reconnecter.',
        code: 'UNAUTHORIZED',
        status
      }
      return Promise.reject(authError)
    }

    // Handle permission errors
    if (status === 403) {
      const permissionError: ApiError = {
        message: 'Accès refusé. Permissions insuffisantes.',
        code: 'FORBIDDEN',
        status
      }
      return Promise.reject(permissionError)
    }

    // Handle validation errors
    if (status === 422) {
      const validationError: ApiError = {
        message: data?.error || 'Données invalides',
        code: 'VALIDATION_ERROR',
        status,
        details: data?.data
      }
      return Promise.reject(validationError)
    }

    // Handle server errors
    if (status >= 500) {
      const serverError: ApiError = {
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        code: 'SERVER_ERROR',
        status
      }
      return Promise.reject(serverError)
    }

    // Handle other client errors
    const apiError: ApiError = {
      message: data?.error || error.message || 'Une erreur est survenue',
      code: data?.code || 'API_ERROR',
      status
    }

    return Promise.reject(apiError)
  }

  /**
   * Generic GET request with retry logic
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.axiosInstance.get<ApiResponse<T>>(url, config)
    )
    return response.data
  }

  /**
   * Generic POST request with retry logic (only for idempotent operations)
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // POST requests are not retried by default to avoid duplicate submissions
    // Use postWithRetry() for idempotent POST operations
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * POST request with retry for idempotent operations
   */
  public async postWithRetry<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    )
    return response.data
  }

  /**
   * Generic PUT request with retry logic
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.axiosInstance.put<ApiResponse<T>>(url, data, config)
    )
    return response.data
  }

  /**
   * Generic PATCH request with retry logic
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.axiosInstance.patch<ApiResponse<T>>(url, data, config)
    )
    return response.data
  }

  /**
   * Generic DELETE request with retry logic
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.axiosInstance.delete<ApiResponse<T>>(url, config)
    )
    return response.data
  }

  /**
   * Upload file
   */
  public async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    }

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, config)
    return response.data
  }

  /**
   * Download file
   */
  public async download(url: string, filename?: string): Promise<void> {
    const response = await this.axiosInstance.get(url, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  // Authentication endpoints
  public auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post('/auth/login', credentials),

    logout: () =>
      this.post('/auth/logout'),

    refresh: () =>
      this.post('/auth/refresh'),

    me: () =>
      this.get('/auth/me'),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      this.put('/auth/password', data),

    updateProfile: (data: any) =>
      this.put('/auth/profile', data)
  }

  // Orders endpoints
  public orders = {
    list: (params?: any) =>
      this.get('/orders', { params }),

    get: (id: string) =>
      this.get(`/orders/${id}`),

    create: (data: any) =>
      this.post('/orders', data),

    update: (id: string, data: any) =>
      this.put(`/orders/${id}`, data),

    updateStatus: (id: string, status: string, notes?: string) =>
      this.patch(`/orders/${id}/status`, { status, notes }),

    cancel: (id: string, reason: string) =>
      this.patch(`/orders/${id}/cancel`, { reason }),

    delete: (id: string) =>
      this.delete(`/orders/${id}`)
  }

  // Tables endpoints
  public tables = {
    list: () =>
      this.get('/tables'),

    get: (id: string) =>
      this.get(`/tables/${id}`),

    updateStatus: (id: string, status: string, notes?: string) =>
      this.patch(`/tables/${id}/status`, { status, notes }),

    assignOrder: (tableId: string, orderId: string) =>
      this.post(`/tables/${tableId}/assign`, { orderId }),

    clearTable: (id: string) =>
      this.post(`/tables/${id}/clear`),

    move: (id: string, position: { x: number; y: number }) =>
      this.patch(`/tables/${id}/position`, { position }),

    getFloorPlan: () =>
      this.get('/tables/floor-plan'),

    createReservation: (tableId: string, data: any) =>
      this.post(`/tables/${tableId}/reservations`, data),

    updateReservation: (tableId: string, reservationId: string, data: any) =>
      this.put(`/tables/${tableId}/reservations/${reservationId}`, data)
  }

  // Payments endpoints
  public payments = {
    methods: () =>
      this.get('/payment/methods'),

    process: (data: any) =>
      this.post('/payment/process', data),

    processSplit: (data: any) =>
      this.post('/payment/process-split', data),

    refund: (transactionId: string, data: { amount: number; reason: string }) =>
      this.post(`/payment/refund/${transactionId}`, data),

    transactions: (params?: any) =>
      this.get('/payment/transactions/recent', { params }),

    cashDrawer: {
      status: () =>
        this.get('/payment/cash-drawer/status'),

      open: (startingAmount: number) =>
        this.post('/payment/cash-drawer/open', { startingAmount }),

      close: (countedAmount: number, notes?: string) =>
        this.post('/payment/cash-drawer/close', { countedAmount, notes }),

      addTransaction: (data: any) =>
        this.post('/payment/cash-drawer/transaction', data)
    }
  }

  // Receipts endpoints
  public receipts = {
    templates: () =>
      this.get('/receipts/templates'),

    print: (data: any) =>
      this.post('/receipts/print', data),

    printDirect: (data: any) =>
      this.post('/receipts/print-direct', data),

    printReceipt: (transactionId: string) =>
      this.post(`/receipts/receipt/${transactionId}`),

    printerStatus: () =>
      this.get('/receipts/printer/status')
  }

  // Analytics endpoints
  public analytics = {
    sales: (params: any) =>
      this.get('/analytics/sales', { params }),

    products: (params: any) =>
      this.get('/analytics/products', { params }),

    categories: (params: any) =>
      this.get('/analytics/categories', { params }),

    staff: (params: any) =>
      this.get('/analytics/staff', { params }),

    customers: (params: any) =>
      this.get('/analytics/customers', { params }),

    time: (params: any) =>
      this.get('/analytics/time', { params }),

    comparison: (params: any) =>
      this.get('/analytics/comparison', { params }),

    inventory: () =>
      this.get('/analytics/inventory'),

    export: (data: any) =>
      this.post('/analytics/export', data, { responseType: 'blob' }),

    reports: {
      generate: (data: any) =>
        this.post('/analytics/reports/generate', data),

      schedule: (data: any) =>
        this.post('/analytics/reports/schedule', data),

      configs: () =>
        this.get('/analytics/reports/configs')
    }
  }

  // Menu/Products endpoints
  public menu = {
    categories: () =>
      this.get('/menu/categories'),

    items: (params?: any) =>
      this.get('/menu/items', { params }),

    getItem: (id: string) =>
      this.get(`/menu/items/${id}`),

    createItem: (data: any) =>
      this.post('/menu/items', data),

    updateItem: (id: string, data: any) =>
      this.put(`/menu/items/${id}`, data),

    deleteItem: (id: string) =>
      this.delete(`/menu/items/${id}`),

    updateAvailability: (id: string, isAvailable: boolean) =>
      this.patch(`/menu/items/${id}/availability`, { isAvailable }),

    public: () =>
      this.get('/menu/public'),

    createCategory: (data: any) =>
      this.post('/menu/categories', data),

    updateCategory: (id: string, data: any) =>
      this.put(`/menu/categories/${id}`, data),

    deleteCategory: (id: string) =>
      this.delete(`/menu/categories/${id}`)
  }

  // Staff endpoints
  public staff = {
    list: () =>
      this.get('/staff'),

    get: (id: string) =>
      this.get(`/staff/${id}`),

    create: (data: any) =>
      this.post('/staff', data),

    update: (id: string, data: any) =>
      this.put(`/staff/${id}`, data),

    delete: (id: string) =>
      this.delete(`/staff/${id}`),

    clockIn: (data: any) =>
      this.post('/staff/clock-in', data),

    clockOut: (data: any) =>
      this.post('/staff/clock-out', data),

    shifts: (params?: any) =>
      this.get('/staff/shifts', { params })
  }

  // Settings endpoints
  public settings = {
    get: () =>
      this.get('/settings'),

    update: (data: any) =>
      this.put('/settings', data),

    backup: () =>
      this.post('/settings/backup'),

    restore: (file: File) =>
      this.upload('/settings/restore', file)
  }

  /**
   * Get the base URL
   */
  public getBaseURL(): string {
    return this.baseURL
  }

  /**
   * Update authorization header
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      this.axiosInstance.defaults.headers.Authorization = `Bearer ${token}`
    } else {
      delete this.axiosInstance.defaults.headers.Authorization
    }
  }

  /**
   * Get raw axios instance for custom requests
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Create singleton instance
export const apiService = new ApiService()

export default apiService