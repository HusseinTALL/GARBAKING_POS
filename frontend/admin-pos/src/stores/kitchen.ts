/**
 * Kitchen Display System store
 * Manages kitchen orders, stations, messaging, and prep time tracking
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ordersApi, mapOrderDtoToKitchenOrder } from '@/services/api-spring'

// Types
export interface KitchenStation {
  id: string
  name: string
  type: 'GRILL' | 'FRYER' | 'SALAD' | 'DRINKS' | 'DESSERTS' | 'PREP'
  color: string
  activeOrders: number
}

export interface KitchenMessage {
  id: string
  orderId?: string
  stationId?: string
  fromUser: string
  message: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  createdAt: string
  read: boolean
}

export interface PrepTimeTracking {
  itemId: string
  stationId: string
  startedAt: string
  estimatedTime: number
  actualTime?: number
  completedAt?: string
}

export interface OrderItem {
  id: string
  quantity: number
  menuItem: {
    id: string
    name: string
    price: number
    prepTime?: number
    station?: string
  }
  totalPrice: number
  notes?: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'
  kitchenNotes?: string
  prepStartTime?: string
  prepCompleteTime?: string
  assignedStation?: string
}

export interface KitchenOrder {
  id: string
  orderNumber: string
  customerName?: string
  tableNumber?: string
  orderType: string
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'HELD'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  total: number
  createdAt: string
  estimatedTime?: number
  actualTime?: number
  kitchenNotes?: string
  orderItems: OrderItem[]
  isHeld: boolean
  heldReason?: string
  heldAt?: string
}

const KITCHEN_STATIONS: KitchenStation[] = [
  { id: 'grill', name: 'Grill Station', type: 'GRILL', color: '#ef4444', activeOrders: 0 },
  { id: 'fryer', name: 'Fryer Station', type: 'FRYER', color: '#f59e0b', activeOrders: 0 },
  { id: 'salad', name: 'Salad Station', type: 'SALAD', color: '#10b981', activeOrders: 0 },
  { id: 'drinks', name: 'Drinks Station', type: 'DRINKS', color: '#3b82f6', activeOrders: 0 },
  { id: 'desserts', name: 'Desserts Station', type: 'DESSERTS', color: '#8b5cf6', activeOrders: 0 },
  { id: 'prep', name: 'Prep Station', type: 'PREP', color: '#6b7280', activeOrders: 0 }
]

export const useKitchenStore = defineStore('kitchen', () => {
  // State
  const orders = ref<KitchenOrder[]>([])
  const stations = ref<KitchenStation[]>([...KITCHEN_STATIONS])
  const messages = ref<KitchenMessage[]>([])
  const prepTracking = ref<PrepTimeTracking[]>([])
  const selectedStation = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Settings
  const autoMarkReady = ref(true)
  const soundEnabled = ref(true)
  const showAllStations = ref(true)

  // Computed
  const activeOrders = computed(() => {
    return orders.value.filter(order =>
      ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status) && !order.isHeld
    )
  })

  const heldOrders = computed(() => {
    return orders.value.filter(order => order.isHeld)
  })

  const filteredOrders = computed(() => {
    if (!selectedStation.value || showAllStations.value) {
      return activeOrders.value
    }

    return activeOrders.value.filter(order =>
      order.orderItems.some(item => item.assignedStation === selectedStation.value)
    )
  })

  const sortedOrders = computed(() => {
    return [...filteredOrders.value].sort((a, b) => {
      // Priority order
      const priorityOrder = { 'URGENT': 1, 'HIGH': 2, 'NORMAL': 3, 'LOW': 4 }
      const aPriority = priorityOrder[a.priority] || 5
      const bPriority = priorityOrder[b.priority] || 5

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Status order
      const statusOrder = { 'PREPARING': 1, 'CONFIRMED': 2, 'READY': 3 }
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 4
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 4

      if (aStatus !== bStatus) {
        return aStatus - bStatus
      }

      // Age (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  })

  const unreadMessages = computed(() => {
    return messages.value.filter(msg => !msg.read)
  })

  const stationStats = computed(() => {
    const stats = new Map<string, { active: number, pending: number, avgTime: number }>()

    stations.value.forEach(station => {
      const stationOrders = activeOrders.value.filter(order =>
        order.orderItems.some(item => item.assignedStation === station.id)
      )

      const stationItems = activeOrders.value.flatMap(order =>
        order.orderItems.filter(item => item.assignedStation === station.id)
      )

      const pendingItems = stationItems.filter(item => item.status === 'PENDING').length
      const preparingItems = stationItems.filter(item => item.status === 'PREPARING')

      const avgTime = preparingItems.length > 0
        ? preparingItems.reduce((sum, item) => {
            if (item.prepStartTime) {
              const elapsed = Date.now() - new Date(item.prepStartTime).getTime()
              return sum + (elapsed / 1000 / 60) // minutes
            }
            return sum
          }, 0) / preparingItems.length
        : 0

      stats.set(station.id, {
        active: stationOrders.length,
        pending: pendingItems,
        avgTime: Math.round(avgTime)
      })
    })

    return stats
  })

  // Actions
  const fetchOrders = async () => {
    try {
      loading.value = true
      error.value = null

      const rawOrders = await ordersApi.getAll({
        status: 'CONFIRMED,PREPARING,READY',
        include: 'orderItems.menuItem'
      })

      orders.value = rawOrders.map(mapOrderToKitchenOrder)
      updateStationCounts()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch orders'
      console.error('Error fetching kitchen orders:', err)
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status)

      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex > -1) {
        orders.value[orderIndex].status = status as any

        // Remove from active list if served
        if (status === 'SERVED') {
          orders.value.splice(orderIndex, 1)
        }
      }

      updateStationCounts()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update order status'
      throw err
    }
  }

  const assignItemToStation = async (orderId: string, itemId: string, stationId: string) => {
    try {
      // This would be an API call in production
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        const item = order.orderItems.find(i => i.id === itemId)
        if (item) {
          item.assignedStation = stationId
        }
      }

      updateStationCounts()
    } catch (err: any) {
      error.value = err.message || 'Failed to assign item to station'
      throw err
    }
  }

  const startItemPrep = async (orderId: string, itemId: string) => {
    try {
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        const item = order.orderItems.find(i => i.id === itemId)
        if (item) {
          item.status = 'PREPARING'
          item.prepStartTime = new Date().toISOString()

          // Add to prep tracking
          if (item.assignedStation) {
            prepTracking.value.push({
              itemId: item.id,
              stationId: item.assignedStation,
              startedAt: item.prepStartTime,
              estimatedTime: item.menuItem.prepTime || 10
            })
          }

          // Update order status if this is the first item
          if (order.status === 'CONFIRMED') {
            await updateOrderStatus(orderId, 'PREPARING')
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to start item preparation'
      throw err
    }
  }

  const markItemReady = async (orderId: string, itemId: string) => {
    try {
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        const item = order.orderItems.find(i => i.id === itemId)
        if (item) {
          item.status = 'READY'
          item.prepCompleteTime = new Date().toISOString()

          // Update prep tracking
          const tracking = prepTracking.value.find(t => t.itemId === itemId)
          if (tracking) {
            tracking.completedAt = item.prepCompleteTime
            const startTime = new Date(tracking.startedAt).getTime()
            const endTime = new Date(item.prepCompleteTime).getTime()
            tracking.actualTime = Math.round((endTime - startTime) / 1000 / 60) // minutes
          }

          // Auto-mark order as ready if all items are ready
          if (autoMarkReady.value && allItemsReady(order)) {
            await updateOrderStatus(orderId, 'READY')
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark item ready'
      throw err
    }
  }

  const holdOrder = async (orderId: string, reason: string) => {
    try {
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.isHeld = true
        order.heldReason = reason
        order.heldAt = new Date().toISOString()
      }

      updateStationCounts()
    } catch (err: any) {
      error.value = err.message || 'Failed to hold order'
      throw err
    }
  }

  const resumeOrder = async (orderId: string) => {
    try {
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.isHeld = false
        order.heldReason = undefined
        order.heldAt = undefined
      }

      updateStationCounts()
    } catch (err: any) {
      error.value = err.message || 'Failed to resume order'
      throw err
    }
  }

  const sendMessage = async (message: Omit<KitchenMessage, 'id' | 'createdAt' | 'read'>) => {
    try {
      const newMessage: KitchenMessage = {
        id: generateMessageId(),
        ...message,
        createdAt: new Date().toISOString(),
        read: false
      }

      messages.value.unshift(newMessage)
      return newMessage
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      throw err
    }
  }

  const markMessageRead = (messageId: string) => {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.read = true
    }
  }

  const markAllMessagesRead = () => {
    messages.value.forEach(msg => {
      msg.read = true
    })
  }

  const bumpOrder = (orderId: string) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.priority = 'URGENT'
    }
  }

  // Helper functions
  const allItemsReady = (order: KitchenOrder): boolean => {
    return order.orderItems.every(item => item.status === 'READY')
  }

  const updateStationCounts = () => {
    stations.value.forEach(station => {
      const count = activeOrders.value.filter(order =>
        order.orderItems.some(item => item.assignedStation === station.id)
      ).length
      station.activeOrders = count
    })
  }

  const mapOrderToKitchenOrder = (order: any): KitchenOrder => {
    const mapped = mapOrderDtoToKitchenOrder(order)
    return {
      ...mapped,
      orderItems: mapped.orderItems.map(item => ({
        ...item,
        assignedStation: item.assignedStation || assignStationByMenuItem(item.menuItem)
      })),
      isHeld: mapped.isHeld ?? false,
      heldReason: mapped.heldReason,
      heldAt: mapped.heldAt
    }
  }

  const assignStationByMenuItem = (menuItem: any): string => {
    // Auto-assign based on item name/category (can be improved with actual DB fields)
    const name = menuItem.name.toLowerCase()

    if (name.includes('burger') || name.includes('steak') || name.includes('chicken')) {
      return 'grill'
    }
    if (name.includes('fries') || name.includes('wings') || name.includes('fried')) {
      return 'fryer'
    }
    if (name.includes('salad') || name.includes('vegetables')) {
      return 'salad'
    }
    if (name.includes('drink') || name.includes('juice') || name.includes('soda')) {
      return 'drinks'
    }
    if (name.includes('cake') || name.includes('ice cream') || name.includes('dessert')) {
      return 'desserts'
    }

    return 'prep'
  }

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  return {
    // State
    orders,
    stations,
    messages,
    prepTracking,
    selectedStation,
    loading,
    error,
    autoMarkReady,
    soundEnabled,
    showAllStations,

    // Computed
    activeOrders,
    heldOrders,
    filteredOrders,
    sortedOrders,
    unreadMessages,
    stationStats,

    // Actions
    fetchOrders,
    updateOrderStatus,
    assignItemToStation,
    startItemPrep,
    markItemReady,
    holdOrder,
    resumeOrder,
    sendMessage,
    markMessageRead,
    markAllMessagesRead,
    bumpOrder
  }
})
