/**
 * Order Store
 * Manages order creation, history, and tracking
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
  customizations?: any
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  deliveryFee: number
  total: number
  customerInfo: {
    name: string
    phone: string
    email?: string
  }
  deliveryAddress?: {
    street: string
    city: string
    zipCode: string
    instructions?: string
  }
  paymentMethod: {
    type: 'card' | 'cash' | 'mobile'
    last4?: string
  }
  deliveryTime: {
    type: 'asap' | 'scheduled'
    estimatedTime?: string
    scheduledDate?: string
    scheduledTime?: string
  }
  createdAt: Date
  updatedAt: Date
  estimatedDelivery?: Date
  promoCode?: string
}

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeOrders = computed(() => {
    return orders.value.filter(o =>
      ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(o.status)
    )
  })

  const orderHistory = computed(() => {
    return orders.value.filter(o =>
      [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(o.status)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  // Actions
  const createOrder = async (orderData: {
    items: OrderItem[]
    subtotal: number
    tax: number
    discount: number
    deliveryFee: number
    total: number
    customerInfo: any
    deliveryAddress?: any
    paymentMethod: any
    deliveryTime: any
    promoCode?: string
  }): Promise<Order> => {
    loading.value = true
    error.value = null

    try {
      // Generate order number
      const orderNumber = generateOrderNumber()

      // Create order object
      const order: Order = {
        id: Date.now().toString(),
        orderNumber,
        status: OrderStatus.PENDING,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        discount: orderData.discount,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        customerInfo: orderData.customerInfo,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        deliveryTime: orderData.deliveryTime,
        createdAt: new Date(),
        updatedAt: new Date(),
        promoCode: orderData.promoCode
      }

      // Calculate estimated delivery time
      if (orderData.deliveryTime.type === 'asap') {
        const estimated = new Date()
        estimated.setMinutes(estimated.getMinutes() + 30)
        order.estimatedDelivery = estimated
        order.deliveryTime.estimatedTime = '30-40 minutes'
      } else {
        // For scheduled orders
        const [datePart] = orderData.deliveryTime.scheduledDate.split('T')
        const timePart = orderData.deliveryTime.scheduledTime
        order.estimatedDelivery = new Date(`${datePart} ${timePart}`)
      }

      // API call (mock for now)
      // const response = await axios.post(`${API_BASE_URL}/orders`, order)
      // const createdOrder = response.data

      // Add to orders
      orders.value.unshift(order)
      currentOrder.value = order

      // Store in localStorage
      localStorage.setItem('orders', JSON.stringify(orders.value))
      localStorage.setItem('current_order', JSON.stringify(order))

      return order
    } catch (err: any) {
      console.error('Failed to create order:', err)
      error.value = err.response?.data?.message || 'Failed to create order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOrders = async () => {
    loading.value = true
    error.value = null

    try {
      // const response = await axios.get(`${API_BASE_URL}/orders`)
      // orders.value = response.data

      // Load from localStorage for now
      const stored = localStorage.getItem('orders')
      if (stored) {
        orders.value = JSON.parse(stored)
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err)
      error.value = err.response?.data?.message || 'Failed to load orders'
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (orderId: string): Promise<Order | null> => {
    loading.value = true
    error.value = null

    try {
      // const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
      // return response.data

      // Find in local orders
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        currentOrder.value = order
        return order
      }

      return null
    } catch (err: any) {
      console.error('Failed to fetch order:', err)
      error.value = err.response?.data?.message || 'Failed to load order'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status })

      // Update locally
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date()

        if (currentOrder.value?.id === orderId) {
          currentOrder.value.status = status
        }

        // Update localStorage
        localStorage.setItem('orders', JSON.stringify(orders.value))
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err)
      throw err
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, OrderStatus.CANCELLED)
    } catch (err) {
      throw err
    }
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
    localStorage.removeItem('current_order')
  }

  const loadCurrentOrder = () => {
    const stored = localStorage.getItem('current_order')
    if (stored) {
      currentOrder.value = JSON.parse(stored)
    }
  }

  // Helper functions
  const generateOrderNumber = (): string => {
    const prefix = 'ORD'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}-${timestamp}-${random}`
  }

  const getOrderStatusColor = (status: OrderStatus): string => {
    const colors = {
      [OrderStatus.PENDING]: 'gray',
      [OrderStatus.CONFIRMED]: 'blue',
      [OrderStatus.PREPARING]: 'yellow',
      [OrderStatus.READY]: 'purple',
      [OrderStatus.OUT_FOR_DELIVERY]: 'orange',
      [OrderStatus.DELIVERED]: 'green',
      [OrderStatus.CANCELLED]: 'red'
    }
    return colors[status] || 'gray'
  }

  const getOrderStatusLabel = (status: OrderStatus): string => {
    const labels = {
      [OrderStatus.PENDING]: 'Pending',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PREPARING]: 'Preparing',
      [OrderStatus.READY]: 'Ready',
      [OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled'
    }
    return labels[status] || status
  }

  // Initialize
  loadCurrentOrder()
  fetchOrders()

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,

    // Computed
    activeOrders,
    orderHistory,

    // Actions
    createOrder,
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    cancelOrder,
    clearCurrentOrder,
    loadCurrentOrder,

    // Helpers
    getOrderStatusColor,
    getOrderStatusLabel
  }
})
