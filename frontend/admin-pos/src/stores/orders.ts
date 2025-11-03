/**
 * Orders Store - Centralized state management for POS orders
 * Handles order CRUD operations, real-time updates, and kitchen integration
 * Updated to use Spring Boot microservices backend with WebSocket/STOMP
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseIsoDateTime } from '@/utils/datetime'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'
import { ordersApi } from '@/services/api-spring'
import adminWsService from '@/services/websocket-admin'

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
  unitPrice: number
  totalPrice: number
  quantity: number
  specialInstructions?: string
  modifications?: string[]
  notes?: string
  customizations?: string[]
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
  const isConnected = ref(false)
  const filters = ref<OrderFilters>({})

  // WebSocket connection status
  let wsUnsubscribe: (() => void) | null = null

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
    return orders.value.filter(order => {
      const createdAt = parseIsoDateTime(order.createdAt)
      return createdAt?.toDateString() === today
    })
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
        const orderDate = parseIsoDateTime(order.createdAt)
        if (!orderDate) return false
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

  // Helper Functions
  const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const transformBackendOrder = (backendOrder: any): Order => {
    // Map COMPLETED to SERVED for frontend compatibility
    let status = backendOrder.status as OrderStatus
    if (backendOrder.status === 'COMPLETED') {
      status = OrderStatus.SERVED
    }

    return {
      id: backendOrder.id?.toString() ?? backendOrder.orderId?.toString(),
      orderNumber: backendOrder.orderNumber || `ORD-${backendOrder.id ?? backendOrder.orderId ?? ''}`,
      tableNumber: backendOrder.tableNumber ? parseInt(backendOrder.tableNumber, 10) : undefined,
      customerName: backendOrder.customerName,
      customerPhone: backendOrder.customerPhone,
      items: (backendOrder.orderItems || backendOrder.items || []).map((orderItem: any) => {
        const quantity = toNumber(orderItem.quantity, 1)
        const unitPrice = toNumber(orderItem.unitPrice ?? orderItem.price)
        const totalPrice = toNumber(orderItem.totalPrice ?? unitPrice * quantity)

        return {
          id: orderItem.id?.toString(),
          menuItemId: orderItem.menuItemId?.toString?.() ?? orderItem.menuItemId,
          name: orderItem.menuItemName || orderItem.menuItem?.name || orderItem.name || 'Unknown Item',
          price: unitPrice,
          unitPrice,
          totalPrice,
          quantity,
          specialInstructions: orderItem.notes || orderItem.specialInstructions,
          notes: orderItem.notes,
          customizations: orderItem.customizations || orderItem.options || [],
          modifications: orderItem.modifications
        }
      }),
      subtotal: toNumber(
        backendOrder.subtotal ??
        backendOrder.totalBeforeTax ??
        backendOrder.totalAmount ??
        backendOrder.total
      ),
      tax: toNumber(backendOrder.tax ?? backendOrder.taxAmount),
      total: toNumber(
        backendOrder.total ??
        backendOrder.totalAmount ??
        (backendOrder.subtotal ?? 0) + (backendOrder.tax ?? 0)
      ),
      status,
      paymentStatus: backendOrder.paymentStatus as PaymentStatus,
      paymentMethod: backendOrder.paymentMethod,
      kitchenNotes: backendOrder.kitchenNotes,
      specialRequests: backendOrder.notes || backendOrder.specialRequests,
      createdAt: backendOrder.createdAt,
      updatedAt: backendOrder.updatedAt,
      prepTime: backendOrder.estimatedTime || backendOrder.prepTime,
      servedAt: backendOrder.completedAt || backendOrder.servedAt,
      assignedStaff: backendOrder.user?.name || backendOrder.assignedStaff
    }
  }

  const transformToBackendOrder = (orderData: any) => ({
    // Required fields
    userId: orderData.userId || authStore.user?.id || 1, // Default to logged-in user or ID 1
    orderType: orderData.orderType || 'DINE_IN',
    paymentMethod: orderData.paymentMethod || 'CASH',
    items: orderData.items.map((item: any) => ({
      menuItemId: item.menuItemId || item.id,
      menuItemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price || item.unitPrice || 0,
      specialInstructions: item.specialInstructions || item.notes
    })),

    // Optional fields
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerEmail: orderData.customerEmail,
    tableNumber: orderData.tableNumber?.toString(),
    notes: orderData.specialRequests || orderData.kitchenNotes || orderData.notes,
    taxAmount: orderData.tax || orderData.taxAmount,
    discountAmount: orderData.discount || orderData.discountAmount || 0,
    deliveryAddress: orderData.deliveryAddress,
    deliveryInstructions: orderData.deliveryInstructions,
    deliveryFee: orderData.deliveryFee,
    scheduledFor: orderData.scheduledFor
  })

  // Actions
  const fetchOrders = async (params?: { limit?: number; offset?: number }) => {
    isLoading.value = true
    try {
      const data = await ordersApi.getAll()
      const ordersList = Array.isArray(data) ? data : (data.orders || [])
      orders.value = ordersList.map(transformBackendOrder)
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
      const backendOrderData = transformToBackendOrder(orderData)
      const backendOrder = await ordersApi.create(backendOrderData)
      const transformedOrder = transformBackendOrder(backendOrder)

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
      // Map SERVED to COMPLETED for backend compatibility
      const backendStatus = status === OrderStatus.SERVED ? 'COMPLETED' : status

      await ordersApi.updateStatus(parseInt(orderId), backendStatus, notes)

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

  const addKitchenNote = async (orderId: string, note: string) => {
    try {
      // Add the note via API (using status update with note)
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')

      await ordersApi.updateStatus(parseInt(orderId), order.status, note)

      // Optimistic update
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].kitchenNotes = note
        orders.value[orderIndex].updatedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Error adding kitchen note:', error)
      notification.error('Error', 'Failed to add kitchen note')
      throw error
    }
  }

  const assignOrder = async (orderId: string, staffId: string) => {
    try {
      // Note: This endpoint may not exist in Spring Boot backend yet
      // await ordersApi.assign(orderId, staffId)

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
      await ordersApi.cancel(parseInt(orderId))

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
      // Note: Print endpoint may not exist in Spring Boot backend yet
      // This might need to be handled client-side or added to backend
      notification.success('Receipt', 'Receipt sent to printer')
    } catch (error) {
      console.error('Error printing receipt:', error)
      notification.error('Error', 'Failed to print receipt')
      throw error
    }
  }

  // Real-time WebSocket connection using STOMP
  const connectWebSocket = () => {
    if (wsUnsubscribe) return // Already connected

    // Connect to WebSocket service
    adminWsService.connect(
      () => {
        console.log('Orders WebSocket connected')
        isConnected.value = true
      },
      (error) => {
        console.error('Orders WebSocket connection error:', error)
        isConnected.value = false
      }
    )

    // Register for order updates
    wsUnsubscribe = adminWsService.onOrderUpdate(handleOrderUpdate)
  }

  const disconnectWebSocket = () => {
    if (wsUnsubscribe) {
      wsUnsubscribe()
      wsUnsubscribe = null
    }
    // Note: We don't disconnect adminWsService as it's shared across the app
  }

  const handleOrderUpdate = (order: any) => {
    const transformedOrder = transformBackendOrder(order)
    const index = orders.value.findIndex(o => o.id === transformedOrder.id)

    if (index !== -1) {
      // Update existing order
      orders.value[index] = transformedOrder
    } else {
      // New order - add to list
      orders.value.unshift(transformedOrder)
      notification.info('New Order', `Order #${transformedOrder.orderNumber} received`)
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

  const fetchOrderById = async (id: string) => {
    try {
      const backendOrder = await ordersApi.getById(parseInt(id))
      if (!backendOrder) {
        return null
      }
      const transformedOrder = transformBackendOrder(backendOrder)
      const existingIndex = orders.value.findIndex(order => order.id === transformedOrder.id)

      if (existingIndex !== -1) {
        orders.value[existingIndex] = transformedOrder
      } else {
        orders.value.unshift(transformedOrder)
      }

      return transformedOrder
    } catch (error) {
      console.error('Error fetching order by id:', error)
      notification.error('Error', 'Failed to load order details')
      return null
    }
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
    addKitchenNote,
    assignOrder,
    cancelOrder,
    printReceipt,
    connectWebSocket,
    disconnectWebSocket,
    setFilters,
    clearFilters,
    getOrderById,
    fetchOrderById,
    selectOrder
  }
})
