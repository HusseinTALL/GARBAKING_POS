/**
 * Orders Store - Centralized state management for POS orders
 * Handles order CRUD operations, real-time updates, and kitchen integration
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'
import { io, Socket } from 'socket.io-client'

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

  // Socket.IO connection for real-time updates
  const socketConnection = ref<Socket | null>(null)

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

      const headers: HeadersInit = {}
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch(`http://localhost:3001/api/orders?${queryParams.toString()}`, {
        headers
      })

      if (!response.ok) throw new Error('Failed to fetch orders')

      const result = await response.json()

      // Transform backend order structure to frontend structure
      if (result.success && result.data?.orders) {
        orders.value = result.data.orders.map((backendOrder: any) => ({
          id: backendOrder.id,
          orderNumber: backendOrder.orderNumber,
          tableNumber: backendOrder.tableNumber ? parseInt(backendOrder.tableNumber) : undefined,
          customerName: backendOrder.customerName,
          customerPhone: backendOrder.customerPhone,
          // Transform orderItems to items
          items: (backendOrder.orderItems || []).map((orderItem: any) => ({
            id: orderItem.id,
            menuItemId: orderItem.menuItemId,
            name: orderItem.menuItem?.name || 'Unknown Item',
            price: orderItem.unitPrice,
            quantity: orderItem.quantity,
            totalPrice: orderItem.totalPrice,
            specialInstructions: orderItem.notes
          })),
          subtotal: backendOrder.subtotal,
          tax: backendOrder.tax,
          total: backendOrder.total,
          status: backendOrder.status as OrderStatus,
          paymentStatus: backendOrder.paymentStatus as PaymentStatus,
          paymentMethod: backendOrder.paymentMethod,
          kitchenNotes: backendOrder.kitchenNotes,
          specialRequests: backendOrder.notes,
          createdAt: backendOrder.createdAt,
          updatedAt: backendOrder.updatedAt,
          prepTime: backendOrder.estimatedTime,
          servedAt: backendOrder.completedAt,
          assignedStaff: backendOrder.user?.name
        }))
      } else {
        orders.value = []
      }

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
      // Transform frontend order format to backend format
      const backendOrderData = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        tableNumber: orderData.tableNumber?.toString(),
        orderType: orderData.orderType || 'DINE_IN',
        notes: orderData.specialRequests || orderData.kitchenNotes,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        // Transform 'items' to 'orderItems' with correct structure
        orderItems: orderData.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          notes: item.specialInstructions
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total,
        status: orderData.status
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Only include Authorization header if token exists
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(backendOrderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const result = await response.json()
      const backendOrder = result.data.order

      // Transform the new order to match frontend structure
      const transformedOrder = {
        id: backendOrder.id,
        orderNumber: backendOrder.orderNumber,
        tableNumber: backendOrder.tableNumber ? parseInt(backendOrder.tableNumber) : undefined,
        customerName: backendOrder.customerName,
        customerPhone: backendOrder.customerPhone,
        items: (backendOrder.orderItems || []).map((orderItem: any) => ({
          id: orderItem.id,
          menuItemId: orderItem.menuItemId,
          name: orderItem.menuItem?.name || 'Unknown Item',
          price: orderItem.unitPrice,
          quantity: orderItem.quantity,
          totalPrice: orderItem.totalPrice,
          specialInstructions: orderItem.notes
        })),
        subtotal: backendOrder.subtotal,
        tax: backendOrder.tax,
        total: backendOrder.total,
        status: backendOrder.status as OrderStatus,
        paymentStatus: backendOrder.paymentStatus as PaymentStatus,
        paymentMethod: backendOrder.paymentMethod,
        kitchenNotes: backendOrder.kitchenNotes,
        specialRequests: backendOrder.notes,
        createdAt: backendOrder.createdAt,
        updatedAt: backendOrder.updatedAt,
        prepTime: backendOrder.estimatedTime,
        servedAt: backendOrder.completedAt,
        assignedStaff: backendOrder.user?.name
      }

      orders.value.unshift(transformedOrder)
      notification.success('Order Created', `Order #${transformedOrder.orderNumber} created successfully`)

      return transformedOrder
    } catch (error) {
      console.error('Error creating order:', error)
      notification.error('Error', error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Only include Authorization header if token exists
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, kitchenNotes: notes })
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
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Only include Authorization header if token exists
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers,
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
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Only include Authorization header if token exists
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers,
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
      const headers: HeadersInit = {}

      // Only include Authorization header if token exists
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        headers
      })

      if (!response.ok) throw new Error('Failed to print receipt')

      notification.success('Receipt', 'Receipt sent to printer')
    } catch (error) {
      console.error('Error printing receipt:', error)
      notification.error('Error', 'Failed to print receipt')
      throw error
    }
  }

  // Real-time Socket.IO connection with enhanced reconnection
  const connectWebSocket = () => {
    if (socketConnection.value?.connected) return

    const token = authStore.token
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    socketConnection.value = io('http://localhost:3001', {
      auth: {
        token
      },
      query: {
        clientType: 'admin-pos'
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    })

    socketConnection.value.on('connect', () => {
      console.log('✅ Orders WebSocket connected')
      isConnected.value = true
      notification.success('Connected', 'Real-time updates enabled')
    })

    socketConnection.value.on('disconnect', (reason) => {
      console.log('❌ Orders WebSocket disconnected:', reason)
      isConnected.value = false

      // If server disconnected us, try to reconnect
      if (reason === 'io server disconnect') {
        socketConnection.value?.connect()
      }
    })

    socketConnection.value.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message)
      isConnected.value = false
      notification.error('Connection Error', 'Real-time updates unavailable')
    })

    socketConnection.value.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`)
      notification.success('Reconnected', 'Real-time updates restored')
      // Refresh orders after reconnect to sync state
      fetchOrders()
    })

    socketConnection.value.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`)
    })

    socketConnection.value.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error)
    })

    socketConnection.value.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts')
      notification.error('Connection Failed', 'Please refresh the page')
    })

    // Listen for order events
    socketConnection.value.on('order_updated', (data) => {
      handleRealtimeUpdate({ type: 'ORDER_UPDATED', order: data.order })
    })

    socketConnection.value.on('new_order', (orderData) => {
      handleRealtimeUpdate({ type: 'ORDER_CREATED', order: orderData })
    })

    socketConnection.value.on('order_status_changed', (data) => {
      handleRealtimeUpdate({ type: 'ORDER_STATUS_CHANGED', orderId: data.orderId, status: data.status })
    })
  }

  const disconnectWebSocket = () => {
    if (socketConnection.value) {
      socketConnection.value.disconnect()
      socketConnection.value = null
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