<!--
  Real-time notifications component for admin dashboard
  Displays live order updates, payment notifications, and system alerts
-->

<template>
  <div class="notifications-container">
    <!-- Connection Status Indicator -->
    <div class="connection-status" :class="connectionStatusClass">
      <div class="status-indicator"></div>
      <span class="status-text">{{ connectionStatusText }}</span>
    </div>

    <!-- Active Notifications -->
    <div class="notifications-list" v-if="notifications.length > 0">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" />
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>

          <button
            @click.stop="dismissNotification(notification.id)"
            class="notification-dismiss"
          >
            ×
          </button>
        </div>
      </transition-group>
    </div>

    <!-- Toast Notifications for temporary alerts -->
    <div class="toast-container">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          <div class="toast-content">
            <strong>{{ toast.title }}</strong>
            <span>{{ toast.message }}</span>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Audio notifications enabled via Web Audio API -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGlobalWebSocket } from '../composables/useWebSocket'
import { audioService, type NotificationType } from '@/utils/audioNotifications'

// Icons (you can replace with your preferred icon library)
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'order'
  title: string
  message: string
  timestamp: Date
  data?: any
  persistent?: boolean
}

interface Toast {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
}

// Props
interface Props {
  maxNotifications?: number
  enableSound?: boolean
  toastDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxNotifications: 10,
  enableSound: true,
  toastDuration: 5000
})

// Emits
const emit = defineEmits<{
  notificationClick: [notification: Notification]
}>()

// WebSocket connection
const {
  connectionStatus,
  isConnected,
  orderEvents,
  presenceEvents
} = useGlobalWebSocket()

// Reactive data
const notifications = ref<Notification[]>([])
const toasts = ref<Toast[]>([])
const audioSettings = ref(audioService.getSettings())

// Computed properties
const connectionStatusClass = computed(() => ({
  'status-connected': isConnected.value,
  'status-connecting': connectionStatus.connecting,
  'status-disconnected': !isConnected.value && !connectionStatus.connecting,
  'status-error': connectionStatus.error
}))

const connectionStatusText = computed(() => {
  if (isConnected.value) return 'Connected'
  if (connectionStatus.connecting) return 'Connecting...'
  if (connectionStatus.error) return `Error: ${connectionStatus.error}`
  return 'Disconnected'
})

// Methods
function addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date()
  }

  notifications.value.unshift(newNotification)

  // Limit notifications
  if (notifications.value.length > props.maxNotifications) {
    notifications.value = notifications.value.slice(0, props.maxNotifications)
  }

  // Play sound if enabled (map notification types to audio types)
  if (props.enableSound) {
    const audioType: NotificationType = notification.type === 'order' ? 'order' :
                                        notification.type === 'success' ? 'payment' :
                                        notification.type as NotificationType
    playNotificationSound(audioType)
  }

  // Auto-dismiss non-persistent notifications
  if (!notification.persistent) {
    setTimeout(() => {
      dismissNotification(newNotification.id)
    }, 10000) // 10 seconds
  }
}

function addToast(toast: Omit<Toast, 'id'>) {
  const newToast: Toast = {
    ...toast,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  toasts.value.push(newToast)

  // Auto-dismiss toast
  setTimeout(() => {
    dismissToast(newToast.id)
  }, toast.duration || props.toastDuration)
}

function dismissNotification(id: string) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

function dismissToast(id: string) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function handleNotificationClick(notification: Notification) {
  emit('notificationClick', notification)
}

async function playNotificationSound(type: NotificationType = 'info') {
  if (!props.enableSound || !audioSettings.value.enabled) {
    return
  }

  try {
    await audioService.playNotification(type)
  } catch (error) {
    console.error('Failed to play notification sound:', error)
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'error':
      return XCircleIcon
    case 'order':
      return BellIcon
    default:
      return InformationCircleIcon
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// WebSocket event handlers
function handleNewOrder(data: any) {
  addNotification({
    type: 'order',
    title: 'New Order',
    message: `Order #${data.orderNumber} from ${data.customerName || 'Customer'}`,
    data,
    persistent: true
  })

  addToast({
    type: 'info',
    title: 'New Order',
    message: `Order #${data.orderNumber} received`
  })
}

function handleOrderStatusUpdate(data: any) {
  addNotification({
    type: 'info',
    title: 'Order Updated',
    message: `Order #${data.orderNumber} is now ${data.newStatus.toLowerCase()}`,
    data
  })
}

function handlePaymentCompleted(data: any) {
  addNotification({
    type: 'success',
    title: 'Payment Received',
    message: `$${data.amount.toFixed(2)} payment via ${data.paymentMethod}`,
    data
  })

  addToast({
    type: 'success',
    title: 'Payment Completed',
    message: `Order #${data.orderNumber}`
  })
}

function handleUserOnline(data: any) {
  addToast({
    type: 'info',
    title: 'User Online',
    message: `${data.name} (${data.role}) connected`
  })
}

function handleUserOffline(data: any) {
  addToast({
    type: 'warning',
    title: 'User Offline',
    message: `${data.name} disconnected`
  })
}

// Initialize audio context on user interaction
async function initAudio() {
  try {
    await audioService.resumeContext()
  } catch (error) {
    console.error('Failed to initialize audio:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Register WebSocket event listeners
  orderEvents.onNewOrder(handleNewOrder)
  orderEvents.onOrderStatusUpdated(handleOrderStatusUpdate)
  orderEvents.onPaymentCompleted(handlePaymentCompleted)
  presenceEvents.onUserOnline(handleUserOnline)
  presenceEvents.onUserOffline(handleUserOffline)

  // Initialize audio on first user click
  document.addEventListener('click', initAudio, { once: true })
})

onUnmounted(() => {
  // Event listeners are automatically cleaned up by the WebSocket composable
  document.removeEventListener('click', initAudio)
})

// Expose audio settings updater
function updateAudioSettings(settings: Partial<typeof audioSettings.value>) {
  audioService.updateSettings(settings)
  audioSettings.value = audioService.getSettings()
}

// Expose for parent components
defineExpose({
  audioSettings,
  updateAudioSettings,
  playNotificationSound
})
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  max-width: 400px;
}

/* Connection Status */
.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.status-connected .status-indicator {
  background: #10b981;
}

.status-connecting .status-indicator {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.status-disconnected .status-indicator,
.status-error .status-indicator {
  background: #ef4444;
}

/* Notifications */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.notification-order {
  border-left-color: #3b82f6;
}

.notification-success {
  border-left-color: #10b981;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-info {
  border-left-color: #6366f1;
}

.notification-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.notification-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.notification-dismiss {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
}

.notification-dismiss:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* Toasts */
.toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 350px;
}

.toast {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-size: 0.875rem;
}

.toast-success {
  background: #10b981;
}

.toast-warning {
  background: #f59e0b;
}

.toast-error {
  background: #ef4444;
}

.toast-info {
  background: #3b82f6;
}

.toast-content strong {
  display: block;
  margin-bottom: 0.25rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>