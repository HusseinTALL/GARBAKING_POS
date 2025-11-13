/**
 * Order Store - State management for orders
 * Manages order history, filtering, sorting, and real-time updates
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderStatus, OrderType, LoadingState } from '@/types'
import { ordersApi } from '@/services/api'
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
  async function fetchOrderHistory(customerPhone: string) {
    if (!customerPhone) {
      console.warn('No customer phone provided for order history')
      return
    }

    loadingState.value = 'loading'
    error.value = null

    try {
      const response = await ordersApi.getCustomerOrderHistory(customerPhone)

      if (response.success && response.data) {
        // Transform orders to ensure consistent data structure
        const transformedOrders = (response.data.orders || []).map((order: any) => ({
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

        console.log(`Loaded ${orders.value.length} orders for ${customerPhone}`)
      } else {
        throw new Error(response.error || 'Failed to fetch order history')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load order history'
      loadingState.value = 'error'
      console.error('Error fetching order history:', err)
    }
  }

  async function fetchOrderByNumber(orderNumber: string) {
    loadingState.value = 'loading'
    error.value = null

    try {
      const response = await ordersApi.trackOrder(orderNumber)

      if (response.success && response.data?.order) {
        currentOrder.value = response.data.order

        // Update in orders list if it exists
        const index = orders.value.findIndex(o => o.orderNumber === orderNumber)
        if (index !== -1) {
          orders.value[index] = response.data.order
        } else {
          // Add to beginning of orders list
          orders.value.unshift(response.data.order)
        }

        loadingState.value = 'success'
      } else {
        throw new Error(response.error || 'Order not found')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load order'
      loadingState.value = 'error'
      console.error('Error fetching order:', err)
    }
  }

  async function cancelOrder(orderNumber: string, reason: string = 'Cancelled by customer') {
    try {
      const response = await ordersApi.cancelOrder(orderNumber, reason)

      if (response.success) {
        // Update order status in store
        const order = orders.value.find(o => o.orderNumber === orderNumber)
        if (order) {
          order.status = 'CANCELLED' as OrderStatus
        }

        if (currentOrder.value?.orderNumber === orderNumber) {
          currentOrder.value.status = 'CANCELLED' as OrderStatus
        }

        return true
      } else {
        throw new Error(response.error || 'Failed to cancel order')
      }
    } catch (err: any) {
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
