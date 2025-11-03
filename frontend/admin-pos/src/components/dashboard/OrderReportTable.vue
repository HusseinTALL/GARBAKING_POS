<!--
  OrderReportTable Component
  Displays recent orders in a table format with filtering and sorting
  Shows customer info, menu items, total payment, and order status
-->
<template>
  <div class="order-report-table">
    <!-- Header -->
    <div class="table-header">
      <h2 class="table-title">Order Report</h2>
      <div class="table-filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Menu</th>
            <th>Total Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="table-row">
            <!-- Customer -->
            <td>
              <div class="customer-cell">
                <div class="customer-avatar">
                  {{ getInitials(order.customerName) }}
                </div>
                <div>
                  <p class="customer-name">{{ order.customerName }}</p>
                  <p class="customer-phone">{{ order.customerPhone }}</p>
                </div>
              </div>
            </td>

            <!-- Menu Items -->
            <td>
              <div class="menu-cell">
                <p class="menu-item">{{ getFirstMenuItem(order) }}</p>
                <p v-if="order.orderItems.length > 1" class="menu-more">
                  +{{ order.orderItems.length - 1 }} more
                </p>
              </div>
            </td>

            <!-- Total -->
            <td>
              <span class="total-amount">{{ formatPrice(order.total) }}</span>
            </td>

            <!-- Status -->
            <td>
              <span class="status-pill" :class="`status-${order.status.toLowerCase()}`">
                {{ order.status }}
              </span>
            </td>

            <!-- Actions -->
            <td>
              <button @click="viewOrder(order)" class="action-btn">
                <Eye class="w-4 h-4" />
              </button>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredOrders.length === 0">
            <td colspan="5" class="empty-state">
              <div class="empty-content">
                <ShoppingBag class="w-12 h-12 text-gray-600" />
                <p>No orders found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, ShoppingBag } from 'lucide-vue-next'

interface OrderItem {
  menuItemId: string | number
  name: string
  quantity: number
  unitPrice?: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderItems: OrderItem[]
  total: number
  status: string
  createdAt: string
}

interface Props {
  orders: Order[]
}

const props = defineProps<Props>()
const statusFilter = ref('all')

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') {
    return props.orders
  }
  return props.orders.filter(order => order.status === statusFilter.value)
})

const getInitials = (name: string): string => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getFirstMenuItem = (order: Order): string => {
  if (order.orderItems.length === 0) return 'No items'
  const item = order.orderItems[0]
  return `${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}`
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const emit = defineEmits<{
  (e: 'view-order', order: Order): void
}>()

const viewOrder = (order: Order) => {
  emit('view-order', order)
}
</script>

<style scoped>
.order-report-table {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
}

.table-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: var(--accent-orange);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--bg-tertiary);
}

.table th {
  text-align: left;
  padding: 14px 24px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

.table-row {
  transition: background 0.2s;
}

.table-row:hover {
  background: rgba(255, 107, 53, 0.05);
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-orange);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.customer-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.customer-phone {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.menu-cell {
  max-width: 250px;
}

.menu-item {
  color: var(--text-primary);
  margin-bottom: 4px;
}

.menu-more {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.total-amount {
  font-weight: 600;
  color: var(--accent-green);
  font-size: var(--font-size-body);
}

.action-btn {
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.1);
}

.empty-state {
  padding: 60px 20px !important;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .table th,
  .table td {
    padding: 12px 16px;
  }

  .customer-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
