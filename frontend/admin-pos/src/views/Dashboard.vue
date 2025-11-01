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
          <option value="custom">Custom Range</option>
        </select>
        <button @click="exportData" :disabled="isExporting" class="export-btn" title="Export to CSV">
          <Download :class="{ 'animate-pulse': isExporting }" class="w-5 h-5" />
        </button>
        <button @click="refreshData" :disabled="isLoading" class="refresh-btn" title="Refresh Data">
          <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Custom Date Range Picker Modal -->
    <div v-if="showCustomDatePicker" class="modal-overlay" @click.self="showCustomDatePicker = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Select Custom Date Range</h3>
          <button @click="showCustomDatePicker = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="date-input-group">
            <label for="start-date">Start Date</label>
            <input
              id="start-date"
              v-model="customStartDate"
              type="date"
              class="date-input"
            />
          </div>
          <div class="date-input-group">
            <label for="end-date">End Date</label>
            <input
              id="end-date"
              v-model="customEndDate"
              type="date"
              class="date-input"
              :min="customStartDate"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCustomDatePicker = false" class="btn-secondary">Cancel</button>
          <button @click="applyCustomDateRange" class="btn-primary" :disabled="!customStartDate || !customEndDate">
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Metrics Cards Row -->
    <div class="metrics-row">
      <MetricCard
        label="Total Revenue"
        :value="totalRevenue"
        :change="revenueChange"
        :icon="DollarSign"
        icon-color="orange"
        format-as="currency"
      />
      <MetricCard
        label="Total Orders"
        :value="totalOrders"
        :change="ordersChange"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useAnalyticsStore } from '@/stores/analytics'
import { useNotificationStore } from '@/stores/notification'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import OrderReportTable from '@/components/dashboard/OrderReportTable.vue'
import MostOrderedPanel from '@/components/dashboard/MostOrderedPanel.vue'
import OrderTypeChart from '@/components/dashboard/OrderTypeChart.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import { DollarSign, ShoppingBag, Users, RefreshCw, Download } from 'lucide-vue-next'

const ordersStore = useOrdersStore()
const analyticsStore = useAnalyticsStore()
const notificationStore = useNotificationStore()

const isLoading = ref(false)
const currentTime = ref('')
const dateFilter = ref('today')
const showOrderModal = ref(false)
const selectedOrderForModal = ref(null)
const showCustomDatePicker = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')
const isExporting = ref(false)

// Computed properties for metrics from analytics store
const totalRevenue = computed(() => {
  return analyticsStore.dashboardData?.today?.revenue || 0
})

const revenueChange = computed(() => {
  const change = analyticsStore.dashboardData?.today?.comparison?.revenueChange || 0
  const prevRevenue = totalRevenue.value - change
  return prevRevenue !== 0 ? (change / prevRevenue) * 100 : 0
})

const totalOrders = computed(() => {
  return analyticsStore.dashboardData?.today?.orders || 0
})

const ordersChange = computed(() => {
  const change = analyticsStore.dashboardData?.today?.comparison?.ordersChange || 0
  const prevOrders = totalOrders.value - change
  return prevOrders !== 0 ? (change / prevOrders) * 100 : 0
})

const totalDishesOrdered = computed(() => {
  // Calculate from menu performance or fall back to orders
  if (analyticsStore.menuPerformanceItems.length > 0) {
    return analyticsStore.menuPerformanceItems.reduce((sum, item) => sum + item.quantitySold, 0)
  }
  return ordersStore.orders.reduce((total, order) => {
    return total + (order.orderItems?.length || order.items?.length || 0)
  }, 0)
})

const totalCustomers = computed(() => {
  // Use customer insights if available
  if (analyticsStore.customerInsightsData) {
    return (
      analyticsStore.customerInsightsData.newCustomers +
      analyticsStore.customerInsightsData.returningCustomers
    )
  }
  // Fallback to orders count
  const uniqueCustomers = new Set()
  ordersStore.orders.forEach(order => {
    if (order.customerName) {
      uniqueCustomers.add(order.customerName)
    }
  })
  return uniqueCustomers.size
})

// Recent orders formatted for table
const normalizeOrderTotal = (order: any): number => {
  const totalCandidate = order.total ?? order.totalAmount ?? order.subtotal
  const parsed = Number(totalCandidate)
  return Number.isFinite(parsed) ? parsed : 0
}

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
      orderItems: order.items || [],
      total: normalizeOrderTotal(order),
      status: order.status,
      createdAt: order.createdAt
    }))
})

// Most ordered dishes data from analytics
const mostOrderedDishes = computed(() => {
  if (analyticsStore.menuPerformanceItems.length > 0) {
    return analyticsStore.menuPerformanceItems
      .slice(0, 3)
      .map(item => ({
        id: item.productId,
        name: item.productName,
        image: '/placeholder-dish.png',
        count: item.quantitySold,
        revenue: item.revenue,
        trending: item.trend || 'stable'
      }))
  }

  // Fallback to computing from orders
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

const viewOrderDetails = async (orderSummary: any) => {
  const orderId = orderSummary.id?.toString?.() ?? `${orderSummary.id}`

  let fullOrder = ordersStore.getOrderById(orderId)
  if (!fullOrder) {
    fullOrder = await ordersStore.fetchOrderById(orderId)
  }

  if (!fullOrder) {
    notificationStore.error('Order unavailable', 'Unable to load order details. Please try again.')
    return
  }

  ordersStore.selectOrder(fullOrder)
  selectedOrderForModal.value = fullOrder
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedOrderForModal.value = null
}

const refreshData = async () => {
  isLoading.value = true
  try {
    // Fetch both orders and analytics data
    await Promise.all([
      ordersStore.fetchOrders(),
      analyticsStore.fetchDashboardData(),
      analyticsStore.fetchMenuPerformance(30),
      analyticsStore.fetchCustomerInsights(30)
    ])
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDateFilterChange = async () => {
  if (dateFilter.value === 'custom') {
    showCustomDatePicker.value = true
    return
  }

  showCustomDatePicker.value = false
  await refreshData()
}

const applyCustomDateRange = async () => {
  if (!customStartDate.value || !customEndDate.value) {
    console.warn('Please select both start and end dates')
    return
  }

  isLoading.value = true
  try {
    await analyticsStore.setCustomDateRange(customStartDate.value, customEndDate.value)
    showCustomDatePicker.value = false
  } catch (error) {
    console.error('Error applying custom date range:', error)
  } finally {
    isLoading.value = false
  }
}

const exportData = async () => {
  isExporting.value = true
  try {
    let startDate, endDate

    if (dateFilter.value === 'custom' && customStartDate.value && customEndDate.value) {
      startDate = customStartDate.value
      endDate = customEndDate.value
    }

    const success = await analyticsStore.exportData(startDate, endDate, 'csv')

    if (success) {
      console.log('Export successful')
    } else {
      console.error('Export failed')
    }
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    isExporting.value = false
  }
}

let timeInterval: number | undefined
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Watch for date filter changes
watch(dateFilter, handleDateFilterChange)

// Set up WebSocket listener for real-time updates
const setupRealtimeUpdates = () => {
  // Listen for order updates and refresh analytics
  ordersStore.connectWebSocket()

  // Refresh analytics every 5 minutes
  const analyticsInterval = setInterval(async () => {
    await analyticsStore.fetchDashboardData()
  }, 5 * 60 * 1000)

  return () => {
    clearInterval(analyticsInterval)
    ordersStore.disconnectWebSocket()
  }
}

onMounted(async () => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 60000)
  await refreshData()

  // Setup real-time updates
  const cleanup = setupRealtimeUpdates()

  // Store cleanup function
  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
    cleanup()
  })
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

.refresh-btn,
.export-btn {
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

.refresh-btn:hover:not(:disabled),
.export-btn:hover:not(:disabled) {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.1);
}

.refresh-btn:disabled,
.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn {
  background: var(--accent-orange);
  color: white;
  border-color: var(--accent-orange);
}

.export-btn:hover:not(:disabled) {
  background: #e65a2e;
  border-color: #e65a2e;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.date-input {
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--accent-orange);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e65a2e;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-primary);
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
