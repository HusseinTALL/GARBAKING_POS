<!--
  Kitchen Display System Main Component
  Standalone fullscreen kitchen display for managing orders in real-time
  Optimized for large kitchen displays with enhanced visibility and touch controls
-->

<template>
  <div class="kitchen-display-system h-screen w-screen bg-gray-900 text-white overflow-hidden">
    <!-- Header Bar -->
    <div class="header bg-gray-800 px-6 py-4 border-b border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <h1 class="text-2xl font-bold text-white">Kitchen Display</h1>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-3 h-3 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-sm text-gray-300">
                {{ isConnected ? 'Connected' : 'Disconnected' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <!-- Sound toggle -->
          <button
            @click="toggleSound"
            :class="[
              'p-2 rounded-lg transition-colors',
              soundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            ]"
          >
            <Volume2 v-if="soundEnabled" class="w-5 h-5" />
            <VolumeX v-else class="w-5 h-5" />
          </button>

          <!-- Current time -->
          <div class="text-right">
            <div class="text-sm text-gray-400">{{ currentDate }}</div>
            <div class="text-lg font-mono">{{ currentTime }}</div>
          </div>

          <!-- Settings -->
          <button
            @click="showSettings = true"
            class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Settings class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Order Status Tabs -->
    <div class="status-tabs bg-gray-800 px-6 py-3 border-b border-gray-700">
      <div class="flex space-x-1">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="activeStatus = status.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeStatus === status.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          ]"
        >
          {{ status.label }}
          <span
            v-if="getOrderCountByStatus(status.value) > 0"
            :class="[
              'ml-2 px-2 py-0.5 rounded-full text-xs',
              activeStatus === status.value
                ? 'bg-blue-800 text-blue-100'
                : 'bg-gray-600 text-gray-300'
            ]"
          >
            {{ getOrderCountByStatus(status.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Orders Grid -->
    <div class="orders-grid flex-1 p-6 overflow-y-auto">
      <div
        v-if="filteredOrders.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center">
          <ChefHat class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-gray-400 mb-2">No {{ activeStatusLabel }} Orders</h3>
          <p class="text-gray-500">Orders will appear here when they're ready for the kitchen</p>
        </div>
      </div>

      <div
        v-else
        class="grid gap-4"
        :class="getGridCols(filteredOrders.length)"
      >
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          :class="[
            'order-card bg-gray-800 rounded-xl border-2 transition-all duration-300 hover:scale-105',
            getOrderBorderColor(order),
            order.priority === 'urgent' ? 'animate-pulse' : ''
          ]"
          @click="selectOrder(order)"
        >
          <!-- Order Header -->
          <div class="p-4 border-b border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div class="text-xl font-bold text-white">
                  #{{ order.orderNumber }}
                </div>
                <div
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(order.status)
                  ]"
                >
                  {{ getStatusLabel(order.status) }}
                </div>
                <div
                  v-if="order.orderType"
                  class="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300"
                >
                  {{ order.orderType }}
                </div>
              </div>
              <div class="text-right text-sm text-gray-400">
                {{ formatTime(order.createdAt) }}
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div v-if="order.customerName" class="text-gray-300">
                {{ order.customerName }}
                <span v-if="order.tableNumber" class="text-gray-500">
                  • Table {{ order.tableNumber }}
                </span>
              </div>
              <div
                v-if="order.estimatedTime"
                class="text-sm text-yellow-400 font-medium"
              >
                EST: {{ order.estimatedTime }}min
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4">
            <div class="space-y-2">
              <div
                v-for="item in order.orderItems"
                :key="item.id"
                class="flex justify-between items-start"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-blue-400">{{ item.quantity }}x</span>
                    <span class="text-white">{{ item.menuItem.name }}</span>
                  </div>
                  <div
                    v-if="item.notes"
                    class="text-sm text-yellow-300 mt-1 pl-4"
                  >
                    📝 {{ item.notes }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="order.kitchenNotes"
              class="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg"
            >
              <div class="text-yellow-300 text-sm font-medium mb-1">Kitchen Notes:</div>
              <div class="text-yellow-100 text-sm">{{ order.kitchenNotes }}</div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="p-4 border-t border-gray-700">
            <div class="flex space-x-2">
              <button
                v-if="order.status === 'PENDING'"
                @click.stop="updateOrderStatus(order.id, 'PREPARING')"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Start Cooking
              </button>
              <button
                v-else-if="order.status === 'PREPARING'"
                @click.stop="updateOrderStatus(order.id, 'READY')"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Mark Ready
              </button>
              <button
                v-else-if="order.status === 'READY'"
                @click.stop="updateOrderStatus(order.id, 'COMPLETED')"
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="selectedOrder = null"
    >
      <div
        class="bg-gray-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">
              Order #{{ selectedOrder.orderNumber }}
            </h2>
            <button
              @click="selectedOrder = null"
              class="text-gray-400 hover:text-white"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Customer</label>
                <div class="text-white">{{ selectedOrder.customerName || 'Walk-in' }}</div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Table</label>
                <div class="text-white">{{ selectedOrder.tableNumber || 'N/A' }}</div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Order Type</label>
                <div class="text-white">{{ selectedOrder.orderType }}</div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Total</label>
                <div class="text-white">${{ selectedOrder.total.toFixed(2) }}</div>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-2">Items</label>
              <div class="space-y-2">
                <div
                  v-for="item in selectedOrder.orderItems"
                  :key="item.id"
                  class="bg-gray-700 p-3 rounded-lg"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="font-semibold text-blue-400">{{ item.quantity }}x</span>
                        <span class="text-white">{{ item.menuItem.name }}</span>
                      </div>
                      <div v-if="item.notes" class="text-sm text-yellow-300 mt-1">
                        📝 {{ item.notes }}
                      </div>
                    </div>
                    <div class="text-gray-400">${{ item.totalPrice.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedOrder.kitchenNotes">
              <label class="block text-sm text-gray-400 mb-2">Kitchen Notes</label>
              <div class="bg-yellow-900/30 border border-yellow-500/30 p-3 rounded-lg">
                <div class="text-yellow-100">{{ selectedOrder.kitchenNotes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div
      v-if="showSettings"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="showSettings = false"
    >
      <div
        class="bg-gray-800 rounded-xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">Settings</h2>
            <button
              @click="showSettings = false"
              class="text-gray-400 hover:text-white"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-white">Sound Notifications</label>
              <button
                @click="toggleSound"
                :class="[
                  'w-12 h-6 rounded-full transition-colors',
                  soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full transition-transform',
                    soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                ></div>
              </button>
            </div>

            <div>
              <label class="block text-white mb-2">Auto-refresh Interval</label>
              <select
                v-model="autoRefreshInterval"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2"
              >
                <option :value="5000">5 seconds</option>
                <option :value="10000">10 seconds</option>
                <option :value="30000">30 seconds</option>
                <option :value="60000">1 minute</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import {
  Volume2,
  VolumeX,
  Settings,
  ChefHat,
  X
} from 'lucide-vue-next'

const DEFAULT_GATEWAY_URL = 'http://localhost:8080'
const configuredGatewayUrl =
  import.meta.env.VITE_API_GATEWAY_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_GATEWAY_URL
const normalizeBase = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url)
const apiBaseUrl = `${normalizeBase(configuredGatewayUrl)}/api`
const socketBaseUrl = normalizeBase(configuredGatewayUrl)

// Types
interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  menuItem: {
    id: string
    name: string
    sku: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName?: string
  customerPhone?: string
  tableNumber?: string
  orderType: string
  status: string
  total: number
  createdAt: string
  estimatedTime?: number
  actualTime?: number
  kitchenNotes?: string
  priority?: 'normal' | 'urgent'
  orderItems: OrderItem[]
}

// State
const orders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const showSettings = ref(false)
const activeStatus = ref('PENDING')
const soundEnabled = ref(true)
const autoRefreshInterval = ref(10000)
const isConnected = ref(false)
const currentTime = ref('')
const currentDate = ref('')

// Socket connection
let socket: Socket | null = null

// Order statuses
const orderStatuses = [
  { label: 'New Orders', value: 'PENDING' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Completed', value: 'COMPLETED' }
]

// Computed
const filteredOrders = computed(() => {
  return orders.value.filter(order => order.status === activeStatus.value)
})

const activeStatusLabel = computed(() => {
  const status = orderStatuses.find(s => s.value === activeStatus.value)
  return status?.label.toLowerCase() || 'orders'
})

// Methods
const getOrderCountByStatus = (status: string) => {
  return orders.value.filter(order => order.status === status).length
}

const getGridCols = (count: number) => {
  if (count <= 2) return 'lg:grid-cols-2'
  if (count <= 4) return 'lg:grid-cols-2 xl:grid-cols-4'
  if (count <= 6) return 'lg:grid-cols-3 xl:grid-cols-6'
  return 'lg:grid-cols-4 xl:grid-cols-6'
}

const getOrderBorderColor = (order: Order) => {
  const now = new Date()
  const orderTime = new Date(order.createdAt)
  const minutesElapsed = (now.getTime() - orderTime.getTime()) / (1000 * 60)

  if (order.priority === 'urgent') return 'border-red-500'
  if (minutesElapsed > 30) return 'border-red-400'
  if (minutesElapsed > 15) return 'border-yellow-400'
  return 'border-gray-600'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-orange-600 text-orange-100'
    case 'PREPARING': return 'bg-blue-600 text-blue-100'
    case 'READY': return 'bg-green-600 text-green-100'
    case 'COMPLETED': return 'bg-gray-600 text-gray-100'
    default: return 'bg-gray-600 text-gray-100'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'New'
    case 'PREPARING': return 'Cooking'
    case 'READY': return 'Ready'
    case 'COMPLETED': return 'Done'
    default: return status
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const selectOrder = (order: Order) => {
  selectedOrder.value = order
}

const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const response = await fetch(`${apiBaseUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (response.ok) {
      // Update local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = newStatus
      }

      // Play sound for completion
      if (newStatus === 'READY' && soundEnabled.value) {
        playOrderCompleteSound()
      }

      // Emit update to other systems
      if (socket) {
        socket.emit('orderStatusUpdate', { orderId, status: newStatus })
      }
    }
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('kds-sound-enabled', soundEnabled.value.toString())
}

const playNewOrderSound = () => {
  if (soundEnabled.value && window.playNewOrderSound) {
    window.playNewOrderSound()
  }
}

const playOrderCompleteSound = () => {
  if (soundEnabled.value && window.playOrderCompleteSound) {
    window.playOrderCompleteSound()
  }
}

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadOrders = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/orders`)
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        orders.value = data
      } else if (Array.isArray(data?.orders)) {
        orders.value = data.orders
      } else if (Array.isArray(data?.data?.orders)) {
        orders.value = data.data.orders
      } else {
        orders.value = []
      }
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
}

const initializeSocket = () => {
  socket = io(socketBaseUrl)

  socket.on('connect', () => {
    isConnected.value = true
    console.log('Connected to server')
  })

  socket.on('disconnect', () => {
    isConnected.value = false
    console.log('Disconnected from server')
  })

  socket.on('newOrder', (order: Order) => {
    orders.value.unshift(order)
    playNewOrderSound()
  })

  socket.on('orderUpdated', (updatedOrder: Order) => {
    const index = orders.value.findIndex(o => o.id === updatedOrder.id)
    if (index !== -1) {
      orders.value[index] = updatedOrder
    }
  })
}

// Lifecycle
onMounted(() => {
  // Load saved preferences
  const savedSoundPref = localStorage.getItem('kds-sound-enabled')
  if (savedSoundPref !== null) {
    soundEnabled.value = savedSoundPref === 'true'
  }

  // Initialize
  updateDateTime()
  loadOrders()
  initializeSocket()

  // Set up intervals
  const timeInterval = setInterval(updateDateTime, 1000)
  const orderInterval = setInterval(loadOrders, autoRefreshInterval.value)

  // Cleanup function
  onUnmounted(() => {
    clearInterval(timeInterval)
    clearInterval(orderInterval)
    if (socket) {
      socket.disconnect()
    }
  })
})
</script>

<style scoped>
.kitchen-display-system {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.order-card {
  min-height: 300px;
  cursor: pointer;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
