<!--
  Order management dashboard for POS staff with light theme design
  Real-time order tracking, status updates, and comprehensive order management
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow">
      <div class="flex items-center justify-between">
        <!-- Left side -->
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-white">Order Management</h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              ordersStore.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ ordersStore.isConnected ? 'Real-time' : 'Offline' }}
            </span>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-3">
          <!-- Refresh -->
          <button
            @click="refreshOrders"
            :disabled="ordersStore.isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50 interactive-fast"
            title="Refresh orders"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
          >
            <RefreshCw :class="{ 'animate-spin': ordersStore.isLoading }" class="w-4 h-4" />
          </button>

          <!-- Sound toggle -->
          <button
            @click="toggleSound"
            :class="[
              'p-2 rounded-lg interactive-fast',
              soundEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            ]"
            title="Sound notifications"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
          >
            <Volume2 v-if="soundEnabled" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-6 gap-4">
        <div
          v-for="stat in orderStats"
          :key="stat.label"
          class="bg-gray-900 rounded-lg p-4 text-center border border-gray-700 shadow performance-optimized"
          style="transition: border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: border-color, transform;"
        >
          <div :class="['text-2xl font-bold', stat.color]">
            {{ stat.value }}
          </div>
          <div class="text-sm text-gray-400 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6">
      <div class="flex space-x-1">
        <button
          v-for="filter in orderFilters"
          :key="filter.status"
          @click="setActiveFilter(filter.status)"
          :class="[
            'px-4 py-3 font-medium text-sm border-b-2 interactive-fast',
            activeFilter === filter.status
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400'
          ]"
          style="transition: border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: border-color, color;"
        >
          {{ filter.label }}
          <span v-if="filter.count > 0" :class="[
            'ml-2 px-2 py-1 rounded-full text-xs font-bold',
            activeFilter === filter.status
              ? 'bg-blue-900 text-blue-400'
              : 'bg-gray-700 text-gray-300'
          ]">
            {{ filter.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Orders Grid -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Loading -->
      <div v-if="ordersStore.isLoading && ordersStore.orders.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Loader2 class="animate-spin text-3xl text-gray-500 mb-4 w-8 h-8" />
          <p class="text-gray-400">Loading orders...</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredOrders.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Inbox class="text-4xl text-gray-600 mb-4 w-16 h-16" />
          <h3 class="text-lg font-semibold text-gray-200 mb-2">No Orders</h3>
          <p class="text-gray-400">
            {{ activeFilter === 'ALL' ? 'No orders available' : `No ${getFilterLabel(activeFilter).toLowerCase()} orders` }}
          </p>
        </div>
      </div>

      <!-- Orders List -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-gray-800 rounded-lg border border-gray-700 shadow p-6 cursor-pointer card-hover performance-optimized"
          @click="handleViewDetails(order)"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-200">#{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-400">{{ order.customerName || 'Walk-in Customer' }}</p>
            </div>
            <div :class="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <!-- Items -->
          <div class="space-y-2 mb-4">
            <div
              v-for="item in order.items.slice(0, 2)"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-300">{{ item.quantity }}x {{ item.name }}</span>
              <span class="text-gray-100 font-medium">{{ formatPrice(item.totalPrice) }}</span>
            </div>
            <div v-if="order.items.length > 2" class="text-sm text-gray-500">
              +{{ order.items.length - 2 }} more items
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-700">
            <div class="text-sm text-gray-400">
              {{ formatTime(order.createdAt) }}
              <span v-if="order.tableNumber"> • Table {{ order.tableNumber }}</span>
            </div>
            <div class="text-lg font-bold text-gray-100">
              {{ formatPrice(order.total) }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 mt-4" @click.stop>
            <button
              v-if="canUpdateStatus(order.status, 'CONFIRMED')"
              @click="handleStatusChange(order.id, 'CONFIRMED')"
              class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Confirm
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'PREPARING')"
              @click="handleStatusChange(order.id, 'PREPARING')"
              class="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Start Prep
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'READY')"
              @click="handleStatusChange(order.id, 'READY')"
              class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Mark Ready
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'SERVED')"
              @click="handleStatusChange(order.id, 'SERVED')"
              class="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Serve
            </button>
            <button
              @click="handlePrintReceipt(order)"
              class="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium interactive-fast"
              title="Print Receipt"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              <Printer class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toasts -->
    <div class="fixed top-4 right-4 z-40 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'bg-gray-800 rounded-lg shadow-lg border-l-4 p-4 min-w-80 animate-slide-in border border-gray-700',
          notification.type === 'success' ? 'border-l-green-500' :
          notification.type === 'warning' ? 'border-l-yellow-500' :
          notification.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'
        ]"
      >
        <div class="flex items-start">
          <component
            :is="getNotificationIcon(notification.type)"
            :class="[
              'mt-1 mr-3 w-4 h-4',
              notification.type === 'success' ? 'text-green-400' :
              notification.type === 'warning' ? 'text-yellow-400' :
              notification.type === 'error' ? 'text-red-400' : 'text-blue-400'
            ]"
          />
          <div class="flex-1">
            <h4 class="font-medium text-gray-200">{{ notification.title }}</h4>
            <p class="text-sm text-gray-400 mt-1">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="ml-2 text-gray-500 hover:text-gray-300"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrdersStore, OrderStatus } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notification'
import {
  RefreshCw,
  Volume2,
  VolumeX,
  Loader2,
  Inbox,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Printer
} from 'lucide-vue-next'

// Types
interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: Date
}

// Stores
const ordersStore = useOrdersStore()
const notificationStore = useNotificationStore()

// State
const soundEnabled = ref(true)
const activeFilter = ref<string>('ALL')
const notifications = ref<Notification[]>([])

// Computed
const orderStats = computed(() => [
  {
    label: 'Pending',
    value: ordersStore.pendingOrders.length,
    color: 'text-yellow-600'
  },
  {
    label: 'Confirmed',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
    color: 'text-blue-600'
  },
  {
    label: 'Preparing',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.PREPARING).length,
    color: 'text-orange-600'
  },
  {
    label: 'Ready',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.READY).length,
    color: 'text-green-600'
  },
  {
    label: 'Served',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.SERVED).length,
    color: 'text-gray-600'
  },
  {
    label: 'Total',
    value: ordersStore.orders.length,
    color: 'text-purple-600'
  }
])

const orderFilters = computed(() => [
  {
    status: 'ALL',
    label: 'All',
    count: ordersStore.orders.length
  },
  {
    status: 'PENDING',
    label: 'Pending',
    count: ordersStore.pendingOrders.length
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.CONFIRMED).length
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.PREPARING).length
  },
  {
    status: 'READY',
    label: 'Ready',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.READY).length
  },
  {
    status: 'SERVED',
    label: 'Served',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.SERVED).length
  }
])

const filteredOrders = computed(() => {
  let filtered = ordersStore.orders

  if (activeFilter.value !== 'ALL') {
    filtered = filtered.filter(order => order.status === activeFilter.value)
  }

  // Sort by creation time (newest first) and priority
  return filtered.sort((a, b) => {
    // Priority order: READY > PREPARING > CONFIRMED > PENDING > SERVED
    const statusPriority = {
      'READY': 5,
      'PREPARING': 4,
      'CONFIRMED': 3,
      'PENDING': 2,
      'SERVED': 1,
      'CANCELLED': 0
    }

    const aPriority = statusPriority[a.status] || 0
    const bPriority = statusPriority[b.status] || 0

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

// Methods
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshOrders = async () => {
  try {
    await ordersStore.fetchOrders()
    addNotification('Success', 'Orders refreshed successfully', 'success')
  } catch (error) {
    addNotification('Error', 'Failed to refresh orders', 'error')
  }
}

const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)

    const order = ordersStore.getOrderById(orderId)
    addNotification(
      'Status Updated',
      `Order #${order?.orderNumber} ${getStatusLabel(newStatus)}`,
      'success'
    )

    // Play sound notification
    if (soundEnabled.value && (newStatus === 'READY' || newStatus === 'SERVED')) {
      playNotificationSound()
    }
  } catch (error) {
    addNotification('Error', 'Unable to update status', 'error')
  }
}

const handleViewDetails = (order: any) => {
  ordersStore.selectOrder(order)
}

const handlePrintReceipt = async (order: any) => {
  try {
    await ordersStore.printReceipt(order.id)
    addNotification('Receipt Printed', `Receipt printed for #${order.orderNumber}`, 'success')
  } catch (error) {
    addNotification('Print Error', 'Unable to print receipt', 'error')
  }
}

const setActiveFilter = (status: string) => {
  activeFilter.value = status
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('pos-sound-enabled', soundEnabled.value.toString())
}

const getFilterLabel = (status: string): string => {
  const labels = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'CANCELLED': 'cancelled'
  }
  return labels[status] || status
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'PREPARING': 'Preparing',
    'READY': 'Ready',
    'SERVED': 'Served',
    'CANCELLED': 'Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-green-100 text-green-800',
    'SERVED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const canUpdateStatus = (currentStatus: string, newStatus: string): boolean => {
  // Define valid status transitions
  const validTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY', 'CANCELLED'],
    'READY': ['SERVED'],
    'SERVED': [],
    'CANCELLED': []
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

const getNotificationIcon = (type: string) => {
  const icons = {
    'success': CheckCircle,
    'warning': AlertTriangle,
    'error': XCircle,
    'info': Info
  }
  return icons[type] || Info
}

const addNotification = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => {
  const notification: Notification = {
    id: Date.now().toString(),
    title,
    message,
    type,
    timestamp: new Date()
  }

  notifications.value.unshift(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification.id)
  }, 5000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const playNotificationSound = () => {
  if (soundEnabled.value) {
    // Create audio notification
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYBDuNy/LNeSUEJHfH8N2QQgQVXbPp66hVFApGn+DyvmEYBDuLyPLVaiEEKXfH8N+QQgUVXLPq66hWFApFn+DyzmEYAzuLyPPVaR0EKXfH8N+QQgUUXLPq66pYFAhFnuDyz2QXATS')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio play errors
    })
  }
}

// Lifecycle
onMounted(async () => {
  // Load sound settings from localStorage
  const savedSoundSetting = localStorage.getItem('pos-sound-enabled')
  if (savedSoundSetting) {
    soundEnabled.value = savedSoundSetting === 'true'
  }

  // Initialize orders store
  await ordersStore.fetchOrders()
  ordersStore.connectWebSocket()

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  ordersStore.disconnectWebSocket()
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-slide-in {
  animation: slide-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}
</style>