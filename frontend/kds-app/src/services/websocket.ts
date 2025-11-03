/**
 * WebSocket service for real-time communication with backend
 * Handles order updates, table status changes, and system notifications
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useTablesStore } from '@/stores/tables'
import { usePaymentStore } from '@/stores/payment'

const DEFAULT_GATEWAY_URL = 'http://localhost:8080'
const configuredGatewayUrl =
  import.meta.env.VITE_API_GATEWAY_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_GATEWAY_URL

const toWebSocketUrl = (baseHttpUrl: string): string => {
  const normalized = baseHttpUrl.replace(/\/$/, '')
  const wsScheme = normalized.replace(/^http/, 'ws')
  return `${wsScheme}/ws`
}

export interface WebSocketMessage {
  type: string
  event: string
  data: any
  timestamp: string
  id?: string
}

export interface ConnectionConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  timeout: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  // Reactive state
  public isConnected = ref(false)
  public isConnecting = ref(false)
  public lastError = ref<string | null>(null)
  public connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  public messageQueue = ref<WebSocketMessage[]>([])

  private config: ConnectionConfig = {
    url: process.env.VUE_APP_WS_URL || toWebSocketUrl(configuredGatewayUrl),
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    timeout: 10000
  }

  private authStore = useAuthStore()
  private ordersStore = useOrdersStore()
  private tablesStore = useTablesStore()
  private paymentStore = usePaymentStore()

  // Event listeners
  private eventListeners = new Map<string, Set<Function>>()

  constructor(config?: Partial<ConnectionConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return true
    }

    this.isConnecting.value = true
    this.connectionStatus.value = 'connecting'
    this.lastError.value = null

    try {
      // Add authentication token to connection URL
      const token = this.authStore.token
      const wsUrl = token
        ? `${this.config.url}?token=${encodeURIComponent(token)}`
        : this.config.url

      this.ws = new WebSocket(wsUrl)

      // Set up event handlers
      this.setupEventHandlers()

      // Wait for connection or timeout
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, this.config.timeout)

        const onOpen = () => {
          clearTimeout(timeout)
          resolve(true)
        }

        const onError = (error: Event) => {
          clearTimeout(timeout)
          reject(error)
        }

        this.ws!.addEventListener('open', onOpen, { once: true })
        this.ws!.addEventListener('error', onError, { once: true })
      })
    } catch (error) {
      this.handleConnectionError(error)
      return false
    } finally {
      this.isConnecting.value = false
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.stopHeartbeat()
    this.stopReconnectTimer()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.isConnected.value = false
    this.connectionStatus.value = 'disconnected'
  }

  /**
   * Send message to server
   */
  public send(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): boolean {
    if (!this.isConnected.value || !this.ws) {
      console.warn('WebSocket not connected, queueing message')
      this.messageQueue.value.push({
        ...message,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId()
      })
      return false
    }

    try {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId()
      }

      this.ws.send(JSON.stringify(fullMessage))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }

  /**
   * Subscribe to specific event types
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  /**
   * Unsubscribe from event
   */
  public off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback)
    }
  }

  /**
   * Subscribe to order updates
   */
  public subscribeToOrders(): void {
    this.send({
      type: 'subscribe',
      event: 'orders',
      data: { userId: this.authStore.currentUser?.id }
    })
  }

  /**
   * Subscribe to table updates
   */
  public subscribeToTables(): void {
    this.send({
      type: 'subscribe',
      event: 'tables',
      data: { userId: this.authStore.currentUser?.id }
    })
  }

  /**
   * Subscribe to payment updates
   */
  public subscribeToPayments(): void {
    this.send({
      type: 'subscribe',
      event: 'payments',
      data: { userId: this.authStore.currentUser?.id }
    })
  }

  /**
   * Join staff channel for notifications
   */
  public joinStaffChannel(): void {
    if (this.authStore.currentUser) {
      this.send({
        type: 'join',
        event: 'staff-channel',
        data: {
          userId: this.authStore.currentUser.id,
          role: this.authStore.currentUser.role,
          location: this.authStore.currentUser.assignedLocation
        }
      })
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.isConnected.value = true
      this.connectionStatus.value = 'connected'
      this.reconnectAttempts = 0
      this.startHeartbeat()

      // Send queued messages
      this.sendQueuedMessages()

      // Set up subscriptions
      this.setupSubscriptions()

      this.emit('connected', null)
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.isConnected.value = false
      this.connectionStatus.value = 'disconnected'
      this.stopHeartbeat()

      // Attempt reconnection if not a manual disconnect
      if (event.code !== 1000) {
        this.attemptReconnect()
      }

      this.emit('disconnected', { code: event.code, reason: event.reason })
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.handleConnectionError(error)
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'order_update':
        this.handleOrderUpdate(message)
        break

      case 'table_update':
        this.handleTableUpdate(message)
        break

      case 'payment_update':
        this.handlePaymentUpdate(message)
        break

      case 'notification':
        this.handleNotification(message)
        break

      case 'heartbeat':
        this.handleHeartbeat(message)
        break

      case 'error':
        this.handleServerError(message)
        break

      default:
        console.log('Unknown message type:', message.type)
    }

    // Emit to event listeners
    this.emit(message.event, message.data)
  }

  /**
   * Handle order updates
   */
  private handleOrderUpdate(message: WebSocketMessage): void {
    const { orderId, status, orderData } = message.data

    switch (message.event) {
      case 'order_created':
        this.ordersStore.addOrder(orderData)
        this.showNotification('Nouvelle commande', `Commande #${orderData.orderNumber} reçue`, 'info')
        break

      case 'order_updated':
        this.ordersStore.updateOrderStatus(orderId, status)
        break

      case 'order_cancelled':
        this.ordersStore.updateOrderStatus(orderId, 'CANCELLED')
        this.showNotification('Commande annulée', `Commande #${orderData.orderNumber} annulée`, 'warning')
        break

      case 'order_completed':
        this.ordersStore.updateOrderStatus(orderId, 'COMPLETED')
        this.showNotification('Commande terminée', `Commande #${orderData.orderNumber} prête`, 'success')
        break
    }
  }

  /**
   * Handle table updates
   */
  private handleTableUpdate(message: WebSocketMessage): void {
    const { tableId, status, tableData } = message.data

    switch (message.event) {
      case 'table_status_changed':
        this.tablesStore.updateTableStatus(tableId, status)
        break

      case 'table_occupied':
        this.tablesStore.updateTableStatus(tableId, 'OCCUPIED')
        break

      case 'table_available':
        this.tablesStore.updateTableStatus(tableId, 'AVAILABLE')
        break

      case 'reservation_created':
        this.tablesStore.addReservation(tableId, tableData.reservation)
        break
    }
  }

  /**
   * Handle payment updates
   */
  private handlePaymentUpdate(message: WebSocketMessage): void {
    const { transactionId, status, paymentData } = message.data

    switch (message.event) {
      case 'payment_processed':
        this.paymentStore.addTransaction(paymentData)
        this.showNotification('Paiement traité', `Paiement de ${paymentData.amount} FCFA confirmé`, 'success')
        break

      case 'payment_failed':
        this.showNotification('Paiement échoué', `Échec du paiement: ${paymentData.error}`, 'error')
        break

      case 'refund_processed':
        this.paymentStore.updateTransactionStatus(transactionId, 'REFUNDED')
        this.showNotification('Remboursement traité', `Remboursement de ${paymentData.amount} FCFA effectué`, 'info')
        break
    }
  }

  /**
   * Handle system notifications
   */
  private handleNotification(message: WebSocketMessage): void {
    const { title, body, type, action } = message.data
    this.showNotification(title, body, type, action)
  }

  /**
   * Handle heartbeat messages
   */
  private handleHeartbeat(message: WebSocketMessage): void {
    // Respond to server heartbeat
    this.send({
      type: 'heartbeat',
      event: 'pong',
      data: { timestamp: new Date().toISOString() }
    })
  }

  /**
   * Handle server errors
   */
  private handleServerError(message: WebSocketMessage): void {
    console.error('Server error:', message.data)
    this.lastError.value = message.data.message || 'Server error'
    this.connectionStatus.value = 'error'
  }

  /**
   * Setup initial subscriptions
   */
  private setupSubscriptions(): void {
    // Subscribe to relevant channels based on user role
    this.subscribeToOrders()
    this.subscribeToTables()
    this.subscribeToPayments()
    this.joinStaffChannel()
  }

  /**
   * Send queued messages
   */
  private sendQueuedMessages(): void {
    while (this.messageQueue.value.length > 0) {
      const message = this.messageQueue.value.shift()
      if (message) {
        this.ws?.send(JSON.stringify(message))
      }
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected.value) {
        this.send({
          type: 'heartbeat',
          event: 'ping',
          data: { timestamp: new Date().toISOString() }
        })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.connectionStatus.value = 'error'
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, this.config.reconnectInterval)
  }

  /**
   * Stop reconnection timer
   */
  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: any): void {
    console.error('WebSocket connection error:', error)
    this.lastError.value = error.message || 'Connection error'
    this.connectionStatus.value = 'error'
    this.isConnected.value = false
    this.isConnecting.value = false
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  /**
   * Show notification to user
   */
  private showNotification(title: string, body: string, type: 'info' | 'success' | 'warning' | 'error', action?: any): void {
    // This would integrate with a notification system
    console.log(`[${type.toUpperCase()}] ${title}: ${body}`)

    // Browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      })
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Computed properties
  public get status() {
    return computed(() => this.connectionStatus.value)
  }

  public get connected() {
    return computed(() => this.isConnected.value)
  }

  public get connecting() {
    return computed(() => this.isConnecting.value)
  }

  public get error() {
    return computed(() => this.lastError.value)
  }
}

// Create singleton instance
export const wsService = new WebSocketService()

// Auto-connect when authenticated
const authStore = useAuthStore()
authStore.$subscribe((mutation, state) => {
  if (state.isAuthenticated && !wsService.connected.value) {
    wsService.connect().catch(error => {
      console.error('Failed to connect WebSocket:', error)
    })
  } else if (!state.isAuthenticated && wsService.connected.value) {
    wsService.disconnect()
  }
})

export default wsService
