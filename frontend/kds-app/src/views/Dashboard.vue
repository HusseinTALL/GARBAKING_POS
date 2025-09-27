<template>
  <div class="dashboard bg-gray-900 text-gray-100 min-h-screen">
    <!-- Header -->
    <div class="dashboard-header bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="text-gray-400 mt-1">{{ currentTime }} • {{ formatDate(new Date()) }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <div
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="ordersStore.isConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'"
          >
            {{ ordersStore.isConnected ? 'Online' : 'Offline' }}
          </div>
          <button
            @click="refreshData"
            :disabled="isLoading"
            class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Today's Orders</p>
              <p class="text-3xl font-bold text-white">{{ ordersStore.orderStats.today }}</p>
              <p class="text-sm text-green-400 mt-1">+{{ Math.floor(Math.random() * 20) + 5 }}% from yesterday</p>
            </div>
            <div class="p-3 bg-blue-900 rounded-lg">
              <ShoppingBag class="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <!-- Revenue -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Today's Revenue</p>
              <p class="text-3xl font-bold text-white">{{ formatPrice(ordersStore.orderStats.revenue) }}</p>
              <p class="text-sm text-green-400 mt-1">+{{ Math.floor(Math.random() * 15) + 8 }}% from yesterday</p>
            </div>
            <div class="p-3 bg-green-900 rounded-lg">
              <DollarSign class="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <!-- Active Orders -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Active Orders</p>
              <p class="text-3xl font-bold text-white">{{ ordersStore.activeOrders.length }}</p>
              <p class="text-sm text-yellow-400 mt-1">{{ ordersStore.pendingOrders.length }} pending</p>
            </div>
            <div class="p-3 bg-yellow-900 rounded-lg">
              <Clock class="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <!-- Avg Order -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Avg Order Value</p>
              <p class="text-3xl font-bold text-white">{{ formatPrice(averageOrderValue) }}</p>
              <p class="text-sm text-blue-400 mt-1">{{ Math.floor(Math.random() * 10) + 3 }} items avg</p>
            </div>
            <div class="p-3 bg-purple-900 rounded-lg">
              <TrendingUp class="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders -->
        <div class="lg:col-span-2 bg-gray-800 rounded-lg shadow-md">
          <div class="p-6 border-b border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Recent Orders</h2>
              <button
                @click="$router.push('/orders')"
                class="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div class="divide-y divide-gray-700">
            <div
              v-for="order in recentOrders.slice(0, 6)"
              :key="order.id"
              class="p-6 hover:bg-gray-700 cursor-pointer transition"
              @click="selectOrder(order)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div :class="getStatusColor(order.status)" class="w-3 h-3 rounded-full"></div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">#{{ order.orderNumber }}</p>
                    <p class="text-sm text-gray-400">{{ order.customerName || 'Walk-in Customer' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-white">{{ formatPrice(order.total) }}</p>
                  <p class="text-sm text-gray-400">{{ formatTime(order.createdAt) }}</p>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>{{ order.items.length }} items • Table {{ order.tableNumber || 'N/A' }}</span>
                <span :class="getStatusTextColor(order.status)" class="font-medium capitalize">
                  {{ order.status.toLowerCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div class="space-y-3">
              <button
                @click="$router.push('/orders/new')"
                class="w-full flex items-center space-x-3 p-3 text-left bg-blue-900 hover:bg-blue-800 rounded-lg transition"
              >
                <Plus class="w-5 h-5 text-blue-400" />
                <span class="text-blue-300 font-medium">New Order</span>
              </button>
              <button
                @click="$router.push('/menu')"
                class="w-full flex items-center space-x-3 p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                <Utensils class="w-5 h-5 text-gray-300" />
                <span class="text-gray-200 font-medium">Manage Menu</span>
              </button>
              <button
                @click="$router.push('/tables')"
                class="w-full flex items-center space-x-3 p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                <Grid3X3 class="w-5 h-5 text-gray-300" />
                <span class="text-gray-200 font-medium">Table Management</span>
              </button>
              <button
                @click="$router.push('/analytics')"
                class="w-full flex items-center space-x-3 p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                <BarChart3 class="w-5 h-5 text-gray-300" />
                <span class="text-gray-200 font-medium">View Analytics</span>
              </button>
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-white mb-4">System Status</h2>
            <div class="space-y-4 text-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>POS System</span>
                </div>
                <span class="text-green-400 font-medium">Online</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Kitchen Display</span>
                </div>
                <span class="text-green-400 font-medium">Connected</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Receipt Printer</span>
                </div>
                <span class="text-yellow-400 font-medium">Warning</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Database</span>
                </div>
                <span class="text-green-400 font-medium">Synced</span>
              </div>
            </div>
          </div>

          <!-- Today's Summary -->
          <div class="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-white mb-4">Today's Summary</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Peak Hour</span>
                <span class="font-medium text-white">12:00 - 13:00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Top Item</span>
                <span class="font-medium text-white">Margherita Pizza</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Avg Wait Time</span>
                <span class="font-medium text-white">12 min</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">Customer Satisfaction</span>
                <div class="flex items-center space-x-1">
                  <Star class="w-4 h-4 text-yellow-400 fill-current" />
                  <span class="font-medium text-white">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import {
  Clock,
  ShoppingBag,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Plus,
  Utensils,
  Grid3X3,
  BarChart3,
  Star
} from 'lucide-vue-next'

const router = useRouter()
const ordersStore = useOrdersStore()

const isLoading = ref(false)
const currentTime = ref('')

const recentOrders = computed(() =>
  ordersStore.orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

const averageOrderValue = computed(() => {
  const todayOrders = ordersStore.todayOrders
  if (todayOrders.length === 0) return 0
  return todayOrders.reduce((sum, order) => sum + order.total, 0) / todayOrders.length
})

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)

const formatDate = (date: Date): string =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const formatTime = (dateString: string): string =>
  new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-400',
    CONFIRMED: 'bg-blue-400',
    PREPARING: 'bg-orange-400',
    READY: 'bg-green-400',
    SERVED: 'bg-gray-400',
    CANCELLED: 'bg-red-400'
  }
  return colors[status] || 'bg-gray-400'
}

const getStatusTextColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-400',
    CONFIRMED: 'text-blue-400',
    PREPARING: 'text-orange-400',
    READY: 'text-green-400',
    SERVED: 'text-gray-400',
    CANCELLED: 'text-red-400'
  }
  return colors[status] || 'text-gray-400'
}

const selectOrder = (order: any) => {
  ordersStore.selectOrder(order)
  router.push(`/orders/${order.id}`)
}

const refreshData = async () => {
  isLoading.value = true
  try {
    await ordersStore.fetchOrders()
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

let timeInterval: number | undefined
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 60000)
  await refreshData()
  ordersStore.connectWebSocket()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  ordersStore.disconnectWebSocket()
})
</script>
