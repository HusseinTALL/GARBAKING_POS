/**
 * API service layer for Garbaking Kiosk App
 * Handles all HTTP requests to the backend API with error handling and TypeScript types
 */
import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import type { MenuItem, MenuCategory, Order, OrderMode, PaymentMethod } from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.message)
        return Promise.reject(error)
      }
    )
  }

  // Menu endpoints - Using the public menu endpoint for better performance
  async getPublicMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const response = await this.api.get('/menu/public')
    const data = response.data.data || response.data

    // Extract categories and flatten all items from nested structure
    const categories: MenuCategory[] = data.categories || []
    const items: MenuItem[] = []

    categories.forEach((category: MenuCategory) => {
      if (category.menuItems && Array.isArray(category.menuItems)) {
        items.push(...category.menuItems)
      }
    })

    return { categories, items }
  }

  async getCategories(): Promise<MenuCategory[]> {
    const response = await this.api.get('/menu/categories')
    // Backend wraps response in { success, data, message }
    return response.data.data || response.data
  }

  async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    const params = categoryId ? { categoryId } : {}
    const response = await this.api.get('/menu/items', { params })
    // Backend wraps response in { success, data, message }
    return response.data.data || response.data
  }

  async getMenuItem(id: string): Promise<MenuItem> {
    const response = await this.api.get(`/menu/items/${id}`)
    // Backend wraps response in { success, data, message }
    return response.data.data || response.data
  }

  // Order endpoints
  async createOrder(orderData: {
    mode: OrderMode
    items: Array<{
      menuItemId: string
      quantity: number
      customizations: Array<{
        customizationId: string
        optionId: string
      }>
      notes?: string
    }>
    paymentMethod: PaymentMethod
  }): Promise<Order> {
    const response = await this.api.post('/orders', orderData)
    return response.data
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.api.get(`/orders/${orderId}`)
    return response.data
  }

  async getOrderStatus(orderId: string): Promise<{ status: string; estimatedReadyTime?: string }> {
    const response = await this.api.get(`/orders/${orderId}/status`)
    return response.data
  }

  // Payment endpoints
  async processPayment(paymentData: {
    orderId: string
    method: PaymentMethod
    amount: number
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const response = await this.api.post('/payments/process', paymentData)
    return response.data
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch {
      return false
    }
  }
}

export default new ApiService()
