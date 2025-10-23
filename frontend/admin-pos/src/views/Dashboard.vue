<!--
  Dashboard View - Rebuilt with Modern Dark Theme
  Main analytics dashboard showing key metrics, recent orders, and insights
  Design based on Jaegar Resto UI specifications
-->
<template>
  <div class="dashboard-container">
    <!-- Top Header Bar -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">{{ currentTime }} • {{ formatDate(new Date()) }}</p>
      </div>
      <div class="header-right">
        <select v-model="dateFilter" class="filter-dropdown">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button @click="refreshData" :disabled="isLoading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Metrics Cards Row -->
    <div class="metrics-row">
      <MetricCard
        label="Total Revenue"
        :value="ordersStore.orderStats.revenue"
        :change="32.40"
        :icon="DollarSign"
        icon-color="orange"
        format-as="currency"
      />
      <MetricCard
        label="Total Dishes Ordered"
        :value="totalDishesOrdered"
        :change="-12.40"
        :icon="ShoppingBag"
        icon-color="green"
      />
      <MetricCard
        label="Total Customers"
        :value="totalCustomers"
        :change="2.40"
        :icon="Users"
        icon-color="blue"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left: Order Report Table -->
      <div class="content-main">
        <OrderReportTable
          :orders="recentOrdersForTable"
          @view-order="viewOrderDetails"
        />
      </div>

      <!-- Right: Panels -->
      <div class="content-sidebar">
        <!-- Most Ordered Dishes -->
        <MostOrderedPanel :dishes="mostOrderedDishes" />

        <!-- Order Type Chart -->
        <OrderTypeChart :order-types="orderTypeData" />
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="showOrderModal && selectedOrderForModal"
      :order="selectedOrderForModal"
      @close="closeOrderModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import OrderReportTable from '@/components/dashboard/OrderReportTable.vue'
import MostOrderedPanel from '@/components/dashboard/MostOrderedPanel.vue'
import OrderTypeChart from '@/components/dashboard/OrderTypeChart.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import { DollarSign, ShoppingBag, Users, RefreshCw } from 'lucide-vue-next'

const router = useRouter()
const ordersStore = useOrdersStore()

const isLoading = ref(false)
const currentTime = ref('')
const dateFilter = ref('today')
const showOrderModal = ref(false)
const selectedOrderForModal = ref(null)

// Computed properties for metrics
const totalDishesOrdered = computed(() => {
  return ordersStore.orders.reduce((total, order) => {
    return total + (order.orderItems?.length || order.items?.length || 0)
  }, 0)
})

const totalCustomers = computed(() => {
  const uniqueCustomers = new Set()
  ordersStore.orders.forEach(order => {
    if (order.customerName) {
      uniqueCustomers.add(order.customerName)
    }
  })
  return uniqueCustomers.size
})

// Recent orders formatted for table
const recentOrdersForTable = computed(() => {
  return ordersStore.orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || 'Walk-in Customer',
      customerPhone: order.customerPhone || 'N/A',
      orderItems: order.orderItems || order.items || [],
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }))
})

// Most ordered dishes data
const mostOrderedDishes = computed(() => {
  const dishCounts = new Map()

  ordersStore.orders.forEach(order => {
    const items = order.orderItems || order.items || []
    items.forEach((item: any) => {
      const dishName = item.name || item.menuItem?.name || 'Unknown'
      const dishId = item.menuItemId || item.id
      const existing = dishCounts.get(dishId) || {
        id: dishId,
        name: dishName,
        image: item.menuItem?.imageUrl || item.imageUrl,
        count: 0,
        revenue: 0,
        trending: 'up'
      }
      existing.count += item.quantity || 1
      existing.revenue += (item.unitPrice || item.price || 0) * (item.quantity || 1)
      dishCounts.set(dishId, existing)
    })
  })

  return Array.from(dishCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
})

// Order type distribution
const orderTypeData = computed(() => {
  const typeCounts = {
    DINE_IN: 0,
    TAKEOUT: 0,
    DELIVERY: 0
  }

  ordersStore.orders.forEach(order => {
    const type = order.type || order.orderType || 'DINE_IN'
    if (typeCounts[type] !== undefined) {
      typeCounts[type]++
    }
  })

  const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0)

  return [
    {
      type: 'Dine In',
      count: typeCounts.DINE_IN,
      percentage: total > 0 ? Math.round((typeCounts.DINE_IN / total) * 100) : 0,
      color: '#E91E63'
    },
    {
      type: 'To Go',
      count: typeCounts.TAKEOUT,
      percentage: total > 0 ? Math.round((typeCounts.TAKEOUT / total) * 100) : 0,
      color: '#FF9800'
    },
    {
      type: 'Delivery',
      count: typeCounts.DELIVERY,
      percentage: total > 0 ? Math.round((typeCounts.DELIVERY / total) * 100) : 0,
      color: '#2196F3'
    }
  ]
})

// Helper functions
const formatDate = (date: Date): string =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const viewOrderDetails = (order: any) => {
  ordersStore.selectOrder(order)
  selectedOrderForModal.value = order
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedOrderForModal.value = null
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

<style scoped>
.dashboard-container {
  background: var(--bg-primary);
  min-height: 100vh;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-h1);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-dropdown {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-dropdown:hover {
  border-color: var(--accent-orange);
}

.filter-dropdown:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.refresh-btn {
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.content-main {
  min-width: 0; /* Prevents grid blowout */
}

.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Responsive */
@media (max-width: 1280px) {
  .content-grid {
    grid-template-columns: 1fr 320px;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .metrics-row {
    gap: 16px;
  }

  .content-grid {
    gap: 16px;
  }
}
</style>
