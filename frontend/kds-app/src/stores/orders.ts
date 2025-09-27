/**
 * Orders Store - Centralized state management for POS orders
 * Handles order CRUD operations, real-time updates, and kitchen integration
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'

// Order Status Enum
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Order Types
export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  modifications?: string[]
}

export interface Order {
  id: string
  orderNumber: string
  tableNumber?: number
  customerName?: string
  customerPhone?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  kitchenNotes?: string
  specialRequests?: string
  createdAt: string
  updatedAt: string
  prepTime?: number
  servedAt?: string
  assignedStaff?: string
}

export interface OrderFilters {
  status?: OrderStatus[]
  dateRange?: { start: Date; end: Date }
  tableNumber?: number
  customerName?: string
  paymentStatus?: PaymentStatus[]
}

export const useOrdersStore = defineStore('orders', () => {
  const authStore = useAuthStore()
  const notification = useNotificationStore()

  // State
  const orders = ref<Order[]>([])
  const selectedOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const isConnected = ref(true)
  const filters = ref<OrderFilters>({})

  // WebSocket connection for real-time updates
  const wsConnection = ref<WebSocket | null>(null)

  // Computed Properties
  const pendingOrders = computed(() =>
    orders.value.filter(order => order.status === OrderStatus.PENDING)
  )

  const activeOrders = computed(() =>
    orders.value.filter(order =>
      [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)
    )
  )

  const todayOrders = computed(() => {
    const today = new Date().toDateString()
    return orders.value.filter(order =>
      new Date(order.createdAt).toDateString() === today
    )
  })

  const filteredOrders = computed(() => {
    let filtered = [...orders.value]

    if (filters.value.status && filters.value.status.length > 0) {
      filtered = filtered.filter(order => filters.value.status!.includes(order.status))
    }

    if (filters.value.tableNumber) {
      filtered = filtered.filter(order => order.tableNumber === filters.value.tableNumber)
    }

    if (filters.value.customerName) {
      const searchTerm = filters.value.customerName.toLowerCase()
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.value.paymentStatus && filters.value.paymentStatus.length > 0) {
      filtered = filtered.filter(order =>
        filters.value.paymentStatus!.includes(order.paymentStatus)
      )
    }

    if (filters.value.dateRange) {
      const { start, end } = filters.value.dateRange
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= start && orderDate <= end
      })
    }

    return filtered
  })

  const orderStats = computed(() => ({
    total: orders.value.length,
    pending: pendingOrders.value.length,
    active: activeOrders.value.length,
    today: todayOrders.value.length,
    revenue: todayOrders.value.reduce((sum, order) => sum + order.total, 0)
  }))

  // Actions
  const fetchOrders = async (params?: { limit?: number; offset?: number }) => {
    isLoading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const response = await fetch(`/api/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      orders.value = data.orders || []
      isConnected.value = true
    } catch (error) {
      console.error('Error fetching orders:', error)
      notification.error('Error', 'Failed to load orders')
      isConnected.value = false
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to create order')

      const newOrder = await response.json()
      orders.value.unshift(newOrder)
      notification.success('Order Created', `Order #${newOrder.orderNumber} created successfully`)

      return newOrder
    } catch (error) {
      console.error('Error creating order:', error)
      notification.error('Error', 'Failed to create order')
      throw error
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ status, notes })
      })

      if (!response.ok) throw new Error('Failed to update order status')

      // Optimistic update
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = status
        orders.value[orderIndex].updatedAt = new Date().toISOString()
        if (notes) orders.value[orderIndex].kitchenNotes = notes
        if (status === OrderStatus.SERVED) {
          orders.value[orderIndex].servedAt = new Date().toISOString()
        }
      }

      notification.success('Status Updated', `Order status updated to ${status}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      notification.error('Error', 'Failed to update order status')
      throw error
    }
  }

  const assignOrder = async (orderId: string, staffId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ assignedStaff: staffId })
      })

      if (!response.ok) throw new Error('Failed to assign order')

      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].assignedStaff = staffId
        orders.value[orderIndex].updatedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Error assigning order:', error)
      notification.error('Error', 'Failed to assign order')
      throw error
    }
  }

  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) throw new Error('Failed to cancel order')

      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = OrderStatus.CANCELLED
        orders.value[orderIndex].updatedAt = new Date().toISOString()
      }

      notification.success('Order Cancelled', 'Order has been cancelled')
    } catch (error) {
      console.error('Error cancelling order:', error)
      notification.error('Error', 'Failed to cancel order')
      throw error
    }
  }

  const printReceipt = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) throw new Error('Failed to print receipt')

      notification.success('Receipt', 'Receipt sent to printer')
    } catch (error) {
      console.error('Error printing receipt:', error)
      notification.error('Error', 'Failed to print receipt')
      throw error
    }
  }

  // Real-time WebSocket connection
  const connectWebSocket = () => {
    if (wsConnection.value) return

    const wsUrl = `ws://localhost:8000/ws/orders?token=${authStore.token}`
    wsConnection.value = new WebSocket(wsUrl)

    wsConnection.value.onopen = () => {
      console.log('Orders WebSocket connected')
      isConnected.value = true
    }

    wsConnection.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleRealtimeUpdate(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    wsConnection.value.onclose = () => {
      console.log('Orders WebSocket disconnected')
      isConnected.value = false
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000)
    }

    wsConnection.value.onerror = (error) => {
      console.error('Orders WebSocket error:', error)
      isConnected.value = false
    }
  }

  const disconnectWebSocket = () => {
    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
    }
  }

  const handleRealtimeUpdate = (data: any) => {
    switch (data.type) {
      case 'ORDER_CREATED':
        orders.value.unshift(data.order)
        notification.info('New Order', `Order #${data.order.orderNumber} received`)
        break

      case 'ORDER_UPDATED':
        const index = orders.value.findIndex(order => order.id === data.order.id)
        if (index !== -1) {
          orders.value[index] = data.order
        }
        break

      case 'ORDER_STATUS_CHANGED':
        const orderIndex = orders.value.findIndex(order => order.id === data.orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = data.status
          orders.value[orderIndex].updatedAt = new Date().toISOString()
        }
        break
    }
  }

  // Filter management
  const setFilters = (newFilters: OrderFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  // Utility functions
  const getOrderById = (id: string) => {
    return orders.value.find(order => order.id === id)
  }

  const selectOrder = (order: Order | null) => {
    selectedOrder.value = order
  }

  return {
    // State
    orders,
    selectedOrder,
    isLoading,
    isConnected,
    filters,

    // Computed
    pendingOrders,
    activeOrders,
    todayOrders,
    filteredOrders,
    orderStats,

    // Actions
    fetchOrders,
    createOrder,
    updateOrderStatus,
    assignOrder,
    cancelOrder,
    printReceipt,
    connectWebSocket,
    disconnectWebSocket,
    setFilters,
    clearFilters,
    getOrderById,
    selectOrder
  }
})