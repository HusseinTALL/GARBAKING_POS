<!--
  Kitchen Display System component for real-time order management
  Shows active orders, preparation status, and timing information
-->

<template>
  <div class="kitchen-display">
    <!-- Header -->
    <header class="kds-header">
      <div class="header-left">
        <h1>Kitchen Display System</h1>
        <div class="connection-status" :class="connectionStatusClass">
          <div class="status-dot"></div>
          <span>{{ connectionStatusText }}</span>
        </div>
      </div>

      <div class="header-right">
        <div class="active-orders-count">
          Active Orders: {{ activeOrders.length }}
        </div>
        <div class="current-time">
          {{ currentTime }}
        </div>
      </div>
    </header>

    <!-- Kitchen Orders Grid -->
    <div class="orders-grid" v-if="activeOrders.length > 0">
      <div
        v-for="order in sortedOrders"
        :key="order.id"
        :class="['order-card', `order-${order.status.toLowerCase()}`, getOrderPriorityClass(order)]"
      >
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-number">#{{ order.orderNumber }}</div>
          <div class="order-type">{{ order.orderType }}</div>
          <div class="order-time">{{ getOrderAge(order.createdAt) }}</div>
        </div>

        <!-- Customer Info -->
        <div class="customer-info" v-if="order.customerName">
          <strong>{{ order.customerName }}</strong>
          <span v-if="order.tableNumber" class="table-number">Table {{ order.tableNumber }}</span>
        </div>

        <!-- Order Status -->
        <div class="order-status">
          <div class="status-badge" :class="`status-${order.status.toLowerCase()}`">
            {{ formatStatus(order.status) }}
          </div>
          <div v-if="order.estimatedTime" class="estimated-time">
            Est: {{ order.estimatedTime }}min
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <div
            v-for="item in order.orderItems"
            :key="item.id"
            :class="['order-item', { 'item-prepared': item.status === 'READY' }]"
          >
            <div class="item-info">
              <div class="item-name">
                {{ item.quantity }}x {{ item.menuItem.name }}
              </div>
              <div v-if="item.notes" class="item-notes">
                Note: {{ item.notes }}
              </div>
            </div>

            <button
              v-if="item.status !== 'READY'"
              @click="markItemPrepared(order.id, item.id)"
              class="mark-ready-btn"
            >
              ✓
            </button>
          </div>
        </div>

        <!-- Kitchen Notes -->
        <div v-if="order.kitchenNotes" class="kitchen-notes">
          <strong>Kitchen Notes:</strong> {{ order.kitchenNotes }}
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <button
            v-if="order.status === 'CONFIRMED'"
            @click="updateOrderStatus(order.id, 'PREPARING')"
            class="action-btn start-preparing"
          >
            Start Preparing
          </button>

          <button
            v-if="order.status === 'PREPARING' && allItemsPrepared(order)"
            @click="updateOrderStatus(order.id, 'READY')"
            class="action-btn mark-ready"
          >
            Mark Ready
          </button>

          <button
            v-if="order.status === 'READY'"
            @click="updateOrderStatus(order.id, 'SERVED')"
            class="action-btn mark-served"
          >
            Mark Served
          </button>

          <button
            @click="showOrderDetails(order)"
            class="action-btn view-details"
          >
            Details
          </button>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: getOrderProgress(order) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🍽️</div>
      <h2>No Active Orders</h2>
      <p>Waiting for new orders to arrive...</p>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Order #{{ selectedOrder.orderNumber }} Details</h3>
          <button @click="closeOrderDetails" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="order-info">
            <p><strong>Customer:</strong> {{ selectedOrder.customerName || 'N/A' }}</p>
            <p><strong>Type:</strong> {{ selectedOrder.orderType }}</p>
            <p><strong>Status:</strong> {{ formatStatus(selectedOrder.status) }}</p>
            <p><strong>Created:</strong> {{ formatDateTime(selectedOrder.createdAt) }}</p>
            <p><strong>Total:</strong> ${{ selectedOrder.total.toFixed(2) }}</p>
          </div>

          <div class="detailed-items">
            <h4>Items:</h4>
            <div v-for="item in selectedOrder.orderItems" :key="item.id" class="detailed-item">
              <div class="item-header">
                <strong>{{ item.quantity }}x {{ item.menuItem.name }}</strong>
                <span class="item-price">${{ item.totalPrice.toFixed(2) }}</span>
              </div>
              <div v-if="item.notes" class="item-notes">{{ item.notes }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sound notifications -->
    <audio ref="newOrderSound" preload="auto">
      <source src="/sounds/new-order.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGlobalWebSocket } from '../composables/useWebSocket'

interface OrderItem {
  id: string
  quantity: number
  menuItem: {
    id: string
    name: string
    price: number
  }
  totalPrice: number
  notes?: string
  status?: string
}

interface Order {
  id: string
  orderNumber: string
  customerName?: string
  tableNumber?: string
  orderType: string
  status: string
  total: number
  createdAt: string
  estimatedTime?: number
  kitchenNotes?: string
  orderItems: OrderItem[]
}

// WebSocket connection
const {
  connectionStatus,
  isConnected,
  kitchenEvents,
  orderActions
} = useGlobalWebSocket()

// Reactive data
const activeOrders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const currentTime = ref('')
const newOrderSound = ref<HTMLAudioElement>()

// Computed properties
const connectionStatusClass = computed(() => ({
  'connected': isConnected.value,
  'connecting': connectionStatus.connecting,
  'disconnected': !isConnected.value && !connectionStatus.connecting,
  'error': connectionStatus.error
}))

const connectionStatusText = computed(() => {
  if (isConnected.value) return 'Connected'
  if (connectionStatus.connecting) return 'Connecting...'
  if (connectionStatus.error) return 'Error'
  return 'Disconnected'
})

const sortedOrders = computed(() => {
  return [...activeOrders.value].sort((a, b) => {
    // Sort by priority: PREPARING > CONFIRMED > READY
    const priorityOrder = { 'PREPARING': 1, 'CONFIRMED': 2, 'READY': 3 }
    const aPriority = priorityOrder[a.status as keyof typeof priorityOrder] || 4
    const bPriority = priorityOrder[b.status as keyof typeof priorityOrder] || 4

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Secondary sort by creation time (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
})

// Methods
function updateOrderStatus(orderId: string, status: string) {
  orderActions.updateOrderStatus(orderId, status)
}

function markItemPrepared(orderId: string, itemId: string) {
  orderActions.markItemPrepared(orderId, itemId)

  // Update local item status
  const order = activeOrders.value.find(o => o.id === orderId)
  if (order) {
    const item = order.orderItems.find(i => i.id === itemId)
    if (item) {
      item.status = 'READY'
    }
  }
}

function allItemsPrepared(order: Order): boolean {
  return order.orderItems.every(item => item.status === 'READY')
}

function getOrderAge(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes === 1) return '1 min'
  return `${diffMinutes} mins`
}

function getOrderProgress(order: Order): number {
  if (order.status === 'SERVED') return 100
  if (order.status === 'READY') return 85
  if (order.status === 'PREPARING') return 50
  if (order.status === 'CONFIRMED') return 25
  return 0
}

function getOrderPriorityClass(order: Order): string {
  const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))

  if (ageMinutes > 30) return 'priority-urgent'
  if (ageMinutes > 15) return 'priority-high'
  if (ageMinutes > 10) return 'priority-medium'
  return 'priority-normal'
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function showOrderDetails(order: Order) {
  selectedOrder.value = order
}

function closeOrderDetails() {
  selectedOrder.value = null
}

function playNewOrderSound() {
  if (newOrderSound.value) {
    newOrderSound.value.currentTime = 0
    newOrderSound.value.play().catch(console.warn)
  }
}

function updateCurrentTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

// WebSocket event handlers
function handleNewKitchenOrder(data: any) {
  console.log('New kitchen order received:', data)

  const newOrder: Order = {
    id: data.orderId,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    tableNumber: data.tableNumber,
    orderType: data.orderType,
    status: 'CONFIRMED',
    total: data.total || 0,
    createdAt: data.createdAt,
    estimatedTime: data.estimatedTime,
    orderItems: data.orderItems || []
  }

  // Add to active orders if not already present
  if (!activeOrders.value.find(o => o.id === newOrder.id)) {
    activeOrders.value.push(newOrder)
    playNewOrderSound()
  }
}

function handleKitchenOrderUpdated(data: any) {
  console.log('Kitchen order updated:', data)

  const orderIndex = activeOrders.value.findIndex(o => o.id === data.orderId)
  if (orderIndex > -1) {
    const order = activeOrders.value[orderIndex]
    order.status = data.status
    order.kitchenNotes = data.kitchenNotes
    order.estimatedTime = data.estimatedTime

    // Remove if served
    if (data.status === 'SERVED') {
      activeOrders.value.splice(orderIndex, 1)
    }
  }
}

function handleItemPrepared(data: any) {
  console.log('Item prepared:', data)

  const order = activeOrders.value.find(o => o.id === data.orderId)
  if (order) {
    const item = order.orderItems.find(i => i.id === data.itemId)
    if (item) {
      item.status = 'READY'
    }
  }
}

function handleOrderPaid(data: any) {
  console.log('Order paid, can start preparation:', data)
  // Visual indication that order is paid and can be started
}

// Lifecycle
onMounted(() => {
  // Register WebSocket event listeners
  kitchenEvents.onNewKitchenOrder(handleNewKitchenOrder)
  kitchenEvents.onKitchenOrderUpdated(handleKitchenOrderUpdated)
  kitchenEvents.onItemPrepared(handleItemPrepared)
  kitchenEvents.onOrderPaid(handleOrderPaid)

  // Update time every second
  updateCurrentTime()
  setInterval(updateCurrentTime, 1000)

  // Request initial kitchen orders
  setTimeout(() => {
    // This would typically be an API call or WebSocket request
    console.log('Kitchen Display System initialized')
  }, 1000)
})

onUnmounted(() => {
  // Event listeners are automatically cleaned up by the WebSocket composable
})
</script>

<style scoped>
.kitchen-display {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1rem;
}

/* Header */
.kds-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.connected .status-dot {
  background: #10b981;
}

.connecting .status-dot {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.disconnected .status-dot,
.error .status-dot {
  background: #ef4444;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.active-orders-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: #3b82f6;
}

.current-time {
  font-size: 1rem;
  color: #6b7280;
  font-family: monospace;
}

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6b7280;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.order-confirmed {
  border-left-color: #f59e0b;
}

.order-preparing {
  border-left-color: #3b82f6;
}

.order-ready {
  border-left-color: #10b981;
}

.priority-urgent {
  box-shadow: 0 0 0 2px #ef4444, 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: urgent-pulse 2s infinite;
}

.priority-high {
  box-shadow: 0 0 0 1px #f59e0b, 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Order Content */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.order-type {
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.order-time {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.customer-info {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-number {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.order-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-confirmed {
  background: #fef3c7;
  color: #92400e;
}

.status-preparing {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-ready {
  background: #d1fae5;
  color: #065f46;
}

.estimated-time {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.order-item:last-child {
  border-bottom: none;
}

.item-prepared {
  opacity: 0.6;
  text-decoration: line-through;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.item-notes {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.mark-ready-btn {
  background: #10b981;
  color: white;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mark-ready-btn:hover {
  background: #059669;
  transform: scale(1.1);
}

.kitchen-notes {
  background: #fef3c7;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-preparing {
  background: #3b82f6;
  color: white;
}

.start-preparing:hover {
  background: #2563eb;
}

.mark-ready {
  background: #10b981;
  color: white;
}

.mark-ready:hover {
  background: #059669;
}

.mark-served {
  background: #6366f1;
  color: white;
}

.mark-served:hover {
  background: #4f46e5;
}

.view-details {
  background: #f3f4f6;
  color: #374151;
}

.view-details:hover {
  background: #e5e7eb;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #f3f4f6;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  transition: width 0.3s ease;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.order-info {
  margin-bottom: 1.5rem;
}

.order-info p {
  margin: 0.5rem 0;
}

.detailed-items h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.detailed-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detailed-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #6b7280;
  font-weight: 500;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes urgent-pulse {
  0%, 100% { box-shadow: 0 0 0 2px #ef4444, 0 2px 8px rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1); }
}

/* Responsive */
@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .kds-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .order-actions {
    justify-content: center;
  }
}
</style>