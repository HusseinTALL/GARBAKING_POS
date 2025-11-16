/**
 * Order Store - State management for orders
 * Manages order history, filtering, sorting, and real-time updates
 * Integrated with Spring Boot Order Service via API Gateway
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderStatus, OrderType, LoadingState } from '@/types'
import { api, API_ENDPOINTS } from '@/services/apiConfig'
import { useCartStore } from './cart'

export interface OrderFilters {
  status?: OrderStatus | 'ALL'
  orderType?: OrderType | 'ALL'
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
}

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loadingState = ref<LoadingState>('idle')
  const error = ref<string | null>(null)
  const filters = ref<OrderFilters>({
    status: 'ALL',
    orderType: 'ALL'
  })

  // Getters / Computed
  const isLoading = computed(() => loadingState.value === 'loading')

  const hasOrders = computed(() => orders.value.length > 0)

  const activeOrders = computed(() =>
    orders.value.filter(order =>
      !['SERVED', 'CANCELLED'].includes(order.status)
    )
  )

  const completedOrders = computed(() =>
    orders.value.filter(order =>
      order.status === 'SERVED'
    )
  )

  const cancelledOrders = computed(() =>
    orders.value.filter(order =>
      order.status === 'CANCELLED'
    )
  )

  const filteredOrders = computed(() => {
    let result = [...orders.value]

    // Filter by status
    if (filters.value.status && filters.value.status !== 'ALL') {
      result = result.filter(order => order.status === filters.value.status)
    }

    // Filter by order type
    if (filters.value.orderType && filters.value.orderType !== 'ALL') {
      result = result.filter(order => order.orderType === filters.value.orderType)
    }

    // Filter by date range
    if (filters.value.dateRange) {
      const { start, end } = filters.value.dateRange
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= start && orderDate <= end
      })
    }

    // Filter by search query (order number or item names)
    if (filters.value.searchQuery && filters.value.searchQuery.trim()) {
      const query = filters.value.searchQuery.toLowerCase().trim()
      result = result.filter(order => {
        // Search in order number
        if (order.orderNumber.toLowerCase().includes(query)) {
          return true
        }

        // Search in item names
        const hasMatchingItem = order.orderItems.some(item =>
          item.menuItem.name.toLowerCase().includes(query)
        )

        return hasMatchingItem
      })
    }

    // Sort by date (newest first)
    result.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return result
  })

  const ordersByStatus = computed(() => {
    const grouped: Record<string, Order[]> = {
      PENDING: [],
      CONFIRMED: [],
      PREPARING: [],
      READY: [],
      SERVED: [],
      CANCELLED: []
    }

    orders.value.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order)
      }
    })

    return grouped
  })

  const recentOrders = computed(() =>
    orders.value.slice(0, 5)
  )

  // Actions

  /**
   * Create a new order
   */
  async function createOrder(orderData: {
    items: Array<{
      menuItemId: string
      quantity: number
      customizations?: string[]
      notes?: string
    }>
    deliveryAddress?: {
      street: string
      city: string
      coordinates?: { lat: number; lng: number }
    }
    paymentMethod: string
    notes?: string
    orderType?: string
    customerName?: string
    customerPhone?: string
    customerEmail?: string
  }) {
    loadingState.value = 'loading'
    error.value = null

    try {
      const response = await api.post<{ order: Order; orderNumber: string }>(
        API_ENDPOINTS.orders.create,
        {
          items: orderData.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            customizations: item.customizations || [],
            notes: item.notes
          })),
          deliveryAddress: orderData.deliveryAddress,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes,
          orderType: orderData.orderType || 'DELIVERY',
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail
        }
      )

      if (response && response.order) {
        currentOrder.value = response.order

        // Add to orders list
        orders.value.unshift(response.order)

        loadingState.value = 'success'

        return response
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('[Order] Failed to create order:', err)
      error.value = err.message || 'Failed to create order'
      loadingState.value = 'error'
      throw err
    }
  }

  /**
   * Fetch order history for a customer
   */
  async function fetchOrderHistory(customerPhone: string) {
    if (!customerPhone) {
      console.warn('[Order] No customer phone provided for order history')
      return
    }

    loadingState.value = 'loading'
    error.value = null

    try {
      const response = await api.get<{ orders: Order[]; count: number }>(
        API_ENDPOINTS.orders.history,
        { params: { phone: customerPhone } }
      )

      if (response && Array.isArray(response.orders)) {
        // Transform orders to ensure consistent data structure
        const transformedOrders = response.orders.map((order: any) => ({
          ...order,
          orderItems: (order.items || order.orderItems || []).map((item: any) => ({
            ...item,
            name: item.menuItemName || item.name || 'Unknown Item',
            menuItem: item.menuItem || {
              id: item.menuItemId,
              name: item.menuItemName || item.name,
              imageUrl: item.menuItemImageUrl || null,
              sku: item.menuItemSku || '',
              price: item.unitPrice,
              categoryId: '',
              isAvailable: true,
              isActive: true
            }
          })),
          total: order.totalAmount || order.total || 0
        }))

        orders.value = transformedOrders
        loadingState.value = 'success'

        console.log(`[Order] Loaded ${orders.value.length} orders for ${customerPhone}`)
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        orders.value = response as Order[]
        loadingState.value = 'success'
      } else {
        throw new Error('Invalid order history data received')
      }
    } catch (err: any) {
      console.error('[Order] Failed to fetch order history:', err)
      error.value = err.message || 'Failed to load order history'
      loadingState.value = 'error'
    }
  }

  /**
   * Fetch order by order number (for tracking)
   */
  async function fetchOrderByNumber(orderNumber: string) {
    loadingState.value = 'loading'
    error.value = null

    try {
      const response = await api.get<Order>(
        API_ENDPOINTS.orders.track(orderNumber)
      )

      if (response) {
        currentOrder.value = response

        // Update in orders list if it exists
        const index = orders.value.findIndex(o => o.orderNumber === orderNumber)
        if (index !== -1) {
          orders.value[index] = response
        } else {
          // Add to beginning of orders list
          orders.value.unshift(response)
        }

        loadingState.value = 'success'
        return response
      } else {
        throw new Error('Order not found')
      }
    } catch (err: any) {
      console.error('[Order] Failed to fetch order:', err)
      error.value = err.message || 'Failed to load order'
      loadingState.value = 'error'
      throw err
    }
  }

  /**
   * Cancel an order
   */
  async function cancelOrder(orderNumber: string, reason: string = 'Cancelled by customer') {
    try {
      const response = await api.post<{ order: Order; message: string }>(
        API_ENDPOINTS.orders.cancel(orderNumber),
        { reason }
      )

      if (response && response.order) {
        // Update order status in store
        const order = orders.value.find(o => o.orderNumber === orderNumber)
        if (order) {
          order.status = 'CANCELLED' as OrderStatus
        }

        if (currentOrder.value?.orderNumber === orderNumber) {
          currentOrder.value.status = 'CANCELLED' as OrderStatus
        }

        console.log(`[Order] Order ${orderNumber} cancelled successfully`)
        return true
      } else {
        throw new Error('Failed to cancel order')
      }
    } catch (err: any) {
      console.error('[Order] Failed to cancel order:', err)
      error.value = err.message || 'Failed to cancel order'
      throw err
    }
  }

  function updateOrderStatus(orderNumber: string, status: OrderStatus, additionalData?: Partial<Order>) {
    const order = orders.value.find(o => o.orderNumber === orderNumber)
    if (order) {
      order.status = status

      if (additionalData) {
        Object.assign(order, additionalData)
      }
    }

    if (currentOrder.value?.orderNumber === orderNumber) {
      currentOrder.value.status = status

      if (additionalData) {
        Object.assign(currentOrder.value, additionalData)
      }
    }
  }

  function setFilters(newFilters: Partial<OrderFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function clearFilters() {
    filters.value = {
      status: 'ALL',
      orderType: 'ALL',
      searchQuery: ''
    }
  }

  function setSearchQuery(query: string) {
    filters.value.searchQuery = query
  }

  function reorderOrder(order: Order) {
    const cartStore = useCartStore()

    // Clear current cart
    cartStore.clearCart()

    // Add all items from the order to cart
    order.orderItems.forEach(item => {
      const cartItem = {
        menuItemId: String(item.menuItemId),
        id: String(item.menuItemId),
        name: item.menuItem.name,
        price: item.unitPrice,
        imageUrl: item.menuItem.imageUrl || null,
        notes: item.notes || '',
        sku: item.menuItem.sku
      }

      cartStore.addItem(cartItem, item.quantity)
    })

    // Set customer info if available
    if (order.customerName || order.customerPhone) {
      cartStore.setCustomerInfo({
        name: order.customerName || '',
        phone: order.customerPhone,
        tableNumber: order.tableNumber,
        orderType: order.orderType
      })
    }

    return order.orderItems.length
  }

  function clearCurrentOrder() {
    currentOrder.value = null
  }

  function clearOrders() {
    orders.value = []
    currentOrder.value = null
    error.value = null
    loadingState.value = 'idle'
  }

  return {
    // State
    orders,
    currentOrder,
    loadingState,
    error,
    filters,

    // Getters
    isLoading,
    hasOrders,
    activeOrders,
    completedOrders,
    cancelledOrders,
    filteredOrders,
    ordersByStatus,
    recentOrders,

    // Actions
    createOrder,
    fetchOrderHistory,
    fetchOrderByNumber,
    cancelOrder,
    updateOrderStatus,
    setFilters,
    clearFilters,
    setSearchQuery,
    reorderOrder,
    clearCurrentOrder,
    clearOrders
  }
})
