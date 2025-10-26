<!--
  Comprehensive Kitchen Display System with:
  - Station assignment (grill, fryer, salad, etc.)
  - Prep time tracking per station
  - Priority sorting
  - Auto-mark items as ready
  - Kitchen messaging between staff
  - Visual/audio alerts
  - Order hold/pause functionality
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

      <div class="header-center">
        <div class="station-selector">
          <button
            @click="kitchenStore.showAllStations = true; kitchenStore.selectedStation = null"
            :class="['station-btn', { active: kitchenStore.showAllStations }]"
          >
            All Stations
          </button>
          <button
            v-for="station in kitchenStore.stations"
            :key="station.id"
            @click="selectStation(station.id)"
            :class="['station-btn', { active: !kitchenStore.showAllStations && kitchenStore.selectedStation === station.id }]"
            :style="{ borderColor: station.color }"
          >
            {{ station.name }}
            <span class="station-count" :style="{ backgroundColor: station.color }">
              {{ kitchenStore.stationStats.get(station.id)?.active || 0 }}
            </span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <button
          @click="showMessaging = !showMessaging"
          class="icon-btn"
          :class="{ 'has-unread': kitchenStore.unreadMessages.length > 0 }"
        >
          <MessageSquare class="w-5 h-5" />
          <span v-if="kitchenStore.unreadMessages.length > 0" class="badge">
            {{ kitchenStore.unreadMessages.length }}
          </span>
        </button>
        <button @click="showSettings = !showSettings" class="icon-btn">
          <Settings class="w-5 h-5" />
        </button>
        <button @click="showHeldOrders = !showHeldOrders" class="icon-btn" v-if="kitchenStore.heldOrders.length > 0">
          <Pause class="w-5 h-5" />
          <span class="badge">{{ kitchenStore.heldOrders.length }}</span>
        </button>
        <div class="active-orders-count">
          Active: {{ kitchenStore.activeOrders.length }}
        </div>
        <div class="current-time">{{ currentTime }}</div>
      </div>
    </header>

    <!-- Messaging Panel -->
    <div v-if="showMessaging" class="messaging-panel">
      <div class="messaging-header">
        <h3>Kitchen Messages</h3>
        <div class="messaging-actions">
          <button @click="kitchenStore.markAllMessagesRead()" class="text-btn">
            Mark All Read
          </button>
          <button @click="showMessaging = false" class="close-btn">×</button>
        </div>
      </div>
      <div class="messages-list">
        <div
          v-for="message in kitchenStore.messages"
          :key="message.id"
          :class="['message-item', { unread: !message.read }, `priority-${message.priority.toLowerCase()}`]"
          @click="kitchenStore.markMessageRead(message.id)"
        >
          <div class="message-header">
            <strong>{{ message.fromUser }}</strong>
            <span class="message-time">{{ formatMessageTime(message.createdAt) }}</span>
          </div>
          <p class="message-text">{{ message.message }}</p>
          <div v-if="message.orderId" class="message-order">Order #{{ message.orderId }}</div>
        </div>
        <div v-if="kitchenStore.messages.length === 0" class="no-messages">
          No messages yet
        </div>
      </div>
      <div class="message-compose">
        <select v-model="newMessage.priority" class="message-priority">
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <input
          v-model="newMessage.text"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-btn">
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-header">
        <h3>Settings</h3>
        <button @click="showSettings = false" class="close-btn">×</button>
      </div>
      <div class="settings-content">
        <label class="setting-item">
          <input type="checkbox" v-model="kitchenStore.autoMarkReady" />
          <span>Auto-mark orders as ready when all items complete</span>
        </label>
        <label class="setting-item">
          <input type="checkbox" v-model="kitchenStore.soundEnabled" />
          <span>Enable sound notifications</span>
        </label>
        <button @click="testSound" class="test-btn">Test Sound</button>
      </div>
    </div>

    <!-- Held Orders Panel -->
    <div v-if="showHeldOrders" class="held-orders-panel">
      <div class="held-header">
        <h3>Held Orders ({{ kitchenStore.heldOrders.length }})</h3>
        <button @click="showHeldOrders = false" class="close-btn">×</button>
      </div>
      <div class="held-list">
        <div v-for="order in kitchenStore.heldOrders" :key="order.id" class="held-order-card">
          <div class="held-order-header">
            <span class="order-number">#{{ order.orderNumber }}</span>
            <span class="held-time">{{ getOrderAge(order.heldAt!) }}</span>
          </div>
          <div class="held-reason">{{ order.heldReason }}</div>
          <button @click="resumeOrder(order.id)" class="resume-btn">
            <Play class="w-4 h-4" />
            Resume
          </button>
        </div>
      </div>
    </div>

    <!-- Kitchen Orders Grid -->
    <div class="orders-grid" v-if="kitchenStore.sortedOrders.length > 0">
      <div
        v-for="order in kitchenStore.sortedOrders"
        :key="order.id"
        :class="['order-card', `order-${order.status.toLowerCase()}`, getOrderPriorityClass(order)]"
      >
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-number-section">
            <span class="order-number">#{{ order.orderNumber }}</span>
            <span v-if="order.priority !== 'NORMAL'" :class="['priority-badge', `priority-${order.priority.toLowerCase()}`]">
              {{ order.priority }}
            </span>
          </div>
          <div class="order-meta">
            <span class="order-type">{{ order.orderType }}</span>
            <span class="order-age">{{ getOrderAge(order.createdAt) }}</span>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="customer-info" v-if="order.customerName">
          <strong>{{ order.customerName }}</strong>
          <span v-if="order.tableNumber" class="table-number">Table {{ order.tableNumber }}</span>
        </div>

        <!-- Order Status -->
        <div class="order-status-section">
          <div class="status-badge" :class="`status-${order.status.toLowerCase()}`">
            {{ formatStatus(order.status) }}
          </div>
          <div v-if="order.estimatedTime" class="estimated-time">
            Est: {{ order.estimatedTime }}min
          </div>
        </div>

        <!-- Order Items by Station -->
        <div class="items-by-station">
          <div v-for="station in getOrderStations(order)" :key="station.id" class="station-section">
            <div class="station-label" :style="{ borderColor: station.color, color: station.color }">
              {{ station.name }}
            </div>
            <div class="station-items">
              <div
                v-for="item in getStationItems(order, station.id)"
                :key="item.id"
                :class="['order-item', `item-${item.status.toLowerCase()}`]"
              >
                <div class="item-info">
                  <div class="item-name-row">
                    <span class="item-quantity">{{ item.quantity }}x</span>
                    <span class="item-name">{{ item.menuItem.name }}</span>
                  </div>
                  <div v-if="item.notes || item.kitchenNotes" class="item-notes">
                    {{ item.notes || item.kitchenNotes }}
                  </div>
                  <!-- Prep Time Tracking -->
                  <div v-if="item.status === 'PREPARING' && item.prepStartTime" class="prep-time">
                    <Clock class="w-3 h-3" />
                    {{ getPrepTime(item) }}
                  </div>
                </div>

                <div class="item-actions">
                  <button
                    v-if="item.status === 'PENDING'"
                    @click="startPrep(order.id, item.id)"
                    class="item-btn start-btn"
                    title="Start Preparing"
                  >
                    <PlayCircle class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status === 'PREPARING'"
                    @click="markReady(order.id, item.id)"
                    class="item-btn ready-btn"
                    title="Mark Ready"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <CheckCircle
                    v-if="item.status === 'READY'"
                    class="w-4 h-4 text-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kitchen Notes -->
        <div v-if="order.kitchenNotes" class="kitchen-notes">
          <AlertCircle class="w-4 h-4" />
          <strong>Note:</strong> {{ order.kitchenNotes }}
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <button
            v-if="order.status === 'CONFIRMED'"
            @click="updateOrderStatus(order.id, 'PREPARING')"
            class="action-btn start-preparing"
          >
            <PlayCircle class="w-4 h-4" />
            Start All
          </button>

          <button
            v-if="order.status === 'PREPARING' && allItemsReady(order)"
            @click="updateOrderStatus(order.id, 'READY')"
            class="action-btn mark-ready"
          >
            <CheckCircle class="w-4 h-4" />
            Mark Ready
          </button>

          <button
            v-if="order.status === 'READY'"
            @click="updateOrderStatus(order.id, 'SERVED')"
            class="action-btn mark-served"
          >
            <Check class="w-4 h-4" />
            Served
          </button>

          <button
            @click="holdOrder(order)"
            class="action-btn hold-btn"
            title="Hold Order"
          >
            <Pause class="w-4 h-4" />
          </button>

          <button
            @click="bumpOrder(order.id)"
            class="action-btn bump-btn"
            title="Bump Priority"
          >
            <TrendingUp class="w-4 h-4" />
          </button>

          <button
            @click="sendOrderMessage(order)"
            class="action-btn message-btn"
            title="Send Message"
          >
            <MessageSquare class="w-4 h-4" />
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
      <p>{{ kitchenStore.selectedStation ? 'No orders for this station' : 'Waiting for new orders...' }}</p>
    </div>

    <!-- Hold Order Modal -->
    <div v-if="holdingOrder" class="modal-overlay" @click="cancelHold">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Hold Order #{{ holdingOrder.orderNumber }}</h3>
          <button @click="cancelHold" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <label class="input-label">Reason for holding:</label>
          <select v-model="holdReason" class="hold-reason-select">
            <option value="">Select a reason...</option>
            <option value="Waiting for ingredients">Waiting for ingredients</option>
            <option value="Customer request">Customer request</option>
            <option value="Equipment issue">Equipment issue</option>
            <option value="Staff shortage">Staff shortage</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            v-if="holdReason === 'Other'"
            v-model="customHoldReason"
            placeholder="Enter reason..."
            class="hold-reason-text"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="cancelHold" class="btn btn-secondary">Cancel</button>
          <button @click="confirmHold" class="btn btn-primary" :disabled="!holdReason">
            Hold Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  MessageSquare, Settings, Pause, Play, PlayCircle, CheckCircle,
  Check, Clock, AlertCircle, TrendingUp, Send
} from 'lucide-vue-next'
import { useKitchenStore } from '@/stores/kitchen'
import type { KitchenOrder, OrderItem, KitchenStation } from '@/stores/kitchen'
import { audioService } from '@/utils/audioNotifications'
import { useGlobalWebSocket } from '../composables/useWebSocket'

// Store
const kitchenStore = useKitchenStore()

// WebSocket
const { connectionStatus, isConnected, kitchenEvents, orderActions } = useGlobalWebSocket()

// UI State
const currentTime = ref('')
const showMessaging = ref(false)
const showSettings = ref(false)
const showHeldOrders = ref(false)
const holdingOrder = ref<KitchenOrder | null>(null)
const holdReason = ref('')
const customHoldReason = ref('')

// Messaging
const newMessage = ref({
  text: '',
  priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
})

// Computed
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

// Methods
const selectStation = (stationId: string) => {
  kitchenStore.showAllStations = false
  kitchenStore.selectedStation = stationId
}

const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    await kitchenStore.updateOrderStatus(orderId, status)
    if (kitchenStore.soundEnabled) {
      audioService.playNotification('success')
    }
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const startPrep = async (orderId: string, itemId: string) => {
  try {
    await kitchenStore.startItemPrep(orderId, itemId)
  } catch (error) {
    console.error('Failed to start prep:', error)
  }
}

const markReady = async (orderId: string, itemId: string) => {
  try {
    await kitchenStore.markItemReady(orderId, itemId)
    if (kitchenStore.soundEnabled) {
      audioService.playNotification('success')
    }
  } catch (error) {
    console.error('Failed to mark ready:', error)
  }
}

const holdOrder = (order: KitchenOrder) => {
  holdingOrder.value = order
  holdReason.value = ''
  customHoldReason.value = ''
}

const confirmHold = async () => {
  if (!holdingOrder.value || !holdReason.value) return

  try {
    const reason = holdReason.value === 'Other' ? customHoldReason.value : holdReason.value
    await kitchenStore.holdOrder(holdingOrder.value.id, reason)
    cancelHold()
  } catch (error) {
    console.error('Failed to hold order:', error)
  }
}

const cancelHold = () => {
  holdingOrder.value = null
  holdReason.value = ''
  customHoldReason.value = ''
}

const resumeOrder = async (orderId: string) => {
  try {
    await kitchenStore.resumeOrder(orderId)
  } catch (error) {
    console.error('Failed to resume order:', error)
  }
}

const bumpOrder = (orderId: string) => {
  kitchenStore.bumpOrder(orderId)
  if (kitchenStore.soundEnabled) {
    audioService.playNotification('warning')
  }
}

const sendMessage = async () => {
  if (!newMessage.value.text.trim()) return

  try {
    await kitchenStore.sendMessage({
      fromUser: 'Kitchen Staff', // In production, use actual user name
      message: newMessage.value.text,
      priority: newMessage.value.priority
    })

    newMessage.value.text = ''
    newMessage.value.priority = 'NORMAL'
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const sendOrderMessage = (order: KitchenOrder) => {
  showMessaging.value = true
  newMessage.value.text = `Re: Order #${order.orderNumber} - `
}

const testSound = async () => {
  await audioService.playNotification('order')
}

const allItemsReady = (order: KitchenOrder): boolean => {
  return order.orderItems.every(item => item.status === 'READY')
}

const getOrderStations = (order: KitchenOrder): KitchenStation[] => {
  const stationIds = [...new Set(order.orderItems.map(item => item.assignedStation).filter(Boolean))]
  return kitchenStore.stations.filter(s => stationIds.includes(s.id))
}

const getStationItems = (order: KitchenOrder, stationId: string): OrderItem[] => {
  return order.orderItems.filter(item => item.assignedStation === stationId)
}

const getPrepTime = (item: OrderItem): string => {
  if (!item.prepStartTime) return ''

  const elapsed = Math.floor((Date.now() - new Date(item.prepStartTime).getTime()) / 1000 / 60)
  const estimated = item.menuItem.prepTime || 10

  if (elapsed > estimated) {
    return `${elapsed}m (${elapsed - estimated}m over)`
  }
  return `${elapsed}m / ${estimated}m`
}

const getOrderAge = (createdAt: string): string => {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const diffMinutes = Math.floor((now - created) / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes === 1) return '1 min'
  if (diffMinutes < 60) return `${diffMinutes} mins`
  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  return `${hours}h ${mins}m`
}

const getOrderProgress = (order: KitchenOrder): number => {
  if (order.status === 'SERVED') return 100
  if (order.status === 'READY') return 85

  const total = order.orderItems.length
  const ready = order.orderItems.filter(i => i.status === 'READY').length
  const preparing = order.orderItems.filter(i => i.status === 'PREPARING').length

  const prepProgress = (preparing * 0.5 + ready) / total * 85
  return Math.max(25, Math.min(85, prepProgress))
}

const getOrderPriorityClass = (order: KitchenOrder): string => {
  if (order.priority === 'URGENT') return 'priority-urgent'
  if (order.priority === 'HIGH') return 'priority-high'

  const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
  if (ageMinutes > 30) return 'priority-urgent'
  if (ageMinutes > 20) return 'priority-high'
  if (ageMinutes > 15) return 'priority-medium'
  return 'priority-normal'
}

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')
}

const formatMessageTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const playNewOrderAlert = async () => {
  if (kitchenStore.soundEnabled) {
    await audioService.playNotification('order')
  }
}

// WebSocket event handlers
const handleNewKitchenOrder = (data: any) => {
  console.log('New kitchen order received:', data)
  kitchenStore.fetchOrders()
  playNewOrderAlert()
}

const handleKitchenOrderUpdated = (data: any) => {
  console.log('Kitchen order updated:', data)
  kitchenStore.fetchOrders()
}

const handleItemPrepared = (data: any) => {
  console.log('Item prepared:', data)
  kitchenStore.fetchOrders()
}

// Lifecycle
onMounted(async () => {
  // Fetch initial orders
  await kitchenStore.fetchOrders()

  // Register WebSocket listeners
  kitchenEvents.onNewKitchenOrder(handleNewKitchenOrder)
  kitchenEvents.onKitchenOrderUpdated(handleKitchenOrderUpdated)
  kitchenEvents.onItemPrepared(handleItemPrepared)

  // Update time
  updateCurrentTime()
  const timeInterval = setInterval(updateCurrentTime, 1000)

  // Cleanup
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})
</script>

<style scoped>
.kitchen-display {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
}

/* Header */
.kds-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  align-items: center;
  background: #1e293b;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #334155;
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.5rem 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
}

.connected .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.connecting .status-dot {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.header-center {
  display: flex;
  justify-content: center;
}

.station-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.station-btn {
  padding: 0.5rem 1rem;
  background: #334155;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.station-btn:hover {
  background: #475569;
}

.station-btn.active {
  background: #3b82f6;
  color: white;
  border-color: currentColor;
}

.station-count {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.icon-btn {
  position: relative;
  padding: 0.5rem;
  background: #334155;
  border: none;
  border-radius: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #475569;
}

.icon-btn.has-unread {
  animation: shake 0.5s infinite;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-orders-count {
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
}

.current-time {
  font-family: monospace;
  font-size: 1rem;
  color: #94a3b8;
}

/* Panels */
.messaging-panel,
.settings-panel,
.held-orders-panel {
  position: fixed;
  top: 100px;
  right: 1.5rem;
  width: 400px;
  max-height: calc(100vh - 120px);
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.messaging-header,
.settings-header,
.held-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #334155;
}

.messaging-header h3,
.settings-header h3,
.held-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
}

.messaging-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.text-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.text-btn:hover {
  text-decoration: underline;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #f1f5f9;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message-item {
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background: #334155;
  border-left: 3px solid #64748b;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.message-item.unread {
  background: #3b4a62;
  border-left-color: #3b82f6;
}

.message-item:hover {
  background: #475569;
}

.message-item.priority-high {
  border-left-color: #f59e0b;
}

.message-item.priority-urgent {
  border-left-color: #ef4444;
  animation: pulse 2s infinite;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.message-time {
  color: #94a3b8;
}

.message-text {
  margin: 0;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.message-order {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #3b82f6;
}

.no-messages {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.message-compose {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 2px solid #334155;
}

.message-priority {
  padding: 0.5rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  color: #cbd5e1;
}

.message-input::placeholder {
  color: #64748b;
}

.send-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
}

.send-btn:hover {
  background: #2563eb;
}

.settings-content {
  padding: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid #334155;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.test-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
}

.held-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.held-order-card {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #334155;
  border-left: 3px solid #f59e0b;
  border-radius: 0.5rem;
}

.held-order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.held-reason {
  color: #cbd5e1;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.held-time {
  color: #94a3b8;
  font-size: 0.875rem;
}

.resume-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
}

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.order-card {
  background: #1e293b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid #334155;
  border-left-width: 4px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.order-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
  animation: urgent-pulse 2s infinite;
}

.priority-high {
  border-color: #f59e0b;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-number-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.priority-high {
  background: #f59e0b;
  color: white;
}

.priority-badge.priority-urgent {
  background: #ef4444;
  color: white;
  animation: pulse 2s infinite;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.order-type {
  font-size: 0.875rem;
  color: #94a3b8;
  background: #334155;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.order-age {
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 500;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.table-number {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.order-status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-confirmed {
  background: #451a03;
  color: #fbbf24;
}

.status-preparing {
  background: #1e3a8a;
  color: #60a5fa;
}

.status-ready {
  background: #064e3b;
  color: #34d399;
}

.estimated-time {
  font-size: 0.875rem;
  color: #94a3b8;
}

.items-by-station {
  margin-bottom: 1rem;
}

.station-section {
  margin-bottom: 1rem;
}

.station-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-left: 3px solid;
  margin-bottom: 0.5rem;
}

.station-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #334155;
  border-radius: 0.5rem;
  border-left: 3px solid #64748b;
}

.item-pending {
  border-left-color: #f59e0b;
}

.item-preparing {
  border-left-color: #3b82f6;
}

.item-ready {
  border-left-color: #10b981;
  opacity: 0.8;
}

.item-info {
  flex: 1;
}

.item-name-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.25rem;
}

.item-quantity {
  font-weight: 700;
  color: #3b82f6;
}

.item-name {
  font-weight: 500;
  color: #f1f5f9;
}

.item-notes {
  font-size: 0.875rem;
  color: #fbbf24;
  margin-top: 0.25rem;
}

.prep-time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.item-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-btn {
  background: #3b82f6;
  color: white;
}

.start-btn:hover {
  background: #2563eb;
}

.ready-btn {
  background: #10b981;
  color: white;
}

.ready-btn:hover {
  background: #059669;
}

.kitchen-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #451a03;
  color: #fbbf24;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.hold-btn,
.bump-btn,
.message-btn {
  background: #334155;
  color: #cbd5e1;
}

.hold-btn:hover,
.bump-btn:hover,
.message-btn:hover {
  background: #475569;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #334155;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #3b82f6, #10b981);
  transition: width 0.5s ease;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.modal-content {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #334155;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

.hold-reason-select,
.hold-reason-text {
  width: 100%;
  padding: 0.75rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.hold-reason-text {
  margin-top: 0.75rem;
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 2px solid #334155;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #334155;
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes urgent-pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* Responsive */
@media (max-width: 1024px) {
  .kds-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-center {
    order: -1;
  }

  .station-selector {
    justify-content: flex-start;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .messaging-panel,
  .settings-panel,
  .held-orders-panel {
    width: calc(100% - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
