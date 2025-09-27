/**
 * WebSocket service for real-time communication
 * Handles order status updates, notifications, and live updates
 */

import { useToast } from 'vue-toastification'
import { useNetworkStore } from '@/stores/network'

interface SocketMessage {
  type: string
  data: any
  timestamp: string
}

interface OrderUpdateMessage {
  orderId: string
  orderNumber: string
  status: string
  estimatedTime?: number
  kitchenNotes?: string
}

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000 // Start with 1 second
  private maxReconnectInterval = 30000 // Max 30 seconds
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private isIntentionallyClosed = false
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    this.initializeEventListeners()
  }

  /**
   * Connect to WebSocket server
   */
  connect(orderNumber?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.hostname
        const port = import.meta.env.VITE_SOCKET_PORT || '8001'

        // Try local network first, then fallback to configured URL
        const socketUrl = `${protocol}//${host}:${port}/customer`

        console.log('[WS] Connecting to:', socketUrl)

        this.socket = new WebSocket(socketUrl)
        this.isIntentionallyClosed = false

        this.socket.onopen = () => {
          console.log('[WS] Connected successfully')
          this.reconnectAttempts = 0
          this.reconnectInterval = 1000

          // Send authentication/identification
          this.send('CUSTOMER_CONNECT', {
            clientId: this.generateClientId(),
            orderNumber: orderNumber || null,
            timestamp: new Date().toISOString()
          })

          // Start heartbeat
          this.startHeartbeat()

          resolve()
        }

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.socket.onclose = (event) => {
          console.log('[WS] Connection closed:', event.code, event.reason)
          this.cleanup()

          if (!this.isIntentionallyClosed) {
            this.scheduleReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('[WS] Connection error:', error)
          reject(error)
        }

      } catch (error) {
        console.error('[WS] Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('[WS] Disconnecting...')
    this.isIntentionallyClosed = true

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
    }

    this.cleanup()
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: SocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      }

      this.socket.send(JSON.stringify(message))
      console.log('[WS] Sent:', type, data)
    } else {
      console.warn('[WS] Cannot send message, socket not connected')
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(messageType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set())
    }

    this.listeners.get(messageType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(messageType)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(messageType)
        }
      }
    }
  }

  /**
   * Subscribe to order updates for a specific order
   */
  subscribeToOrder(orderNumber: string, callback: (data: OrderUpdateMessage) => void): () => void {
    // Subscribe to order updates
    const unsubscribe = this.subscribe('ORDER_UPDATE', (data) => {
      if (data.orderNumber === orderNumber) {
        callback(data)
      }
    })

    // Request to track specific order
    this.send('TRACK_ORDER', { orderNumber })

    return unsubscribe
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected'

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'disconnecting'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(rawData: string): void {
    try {
      const message: SocketMessage = JSON.parse(rawData)
      console.log('[WS] Received:', message.type, message.data)

      // Emit to specific listeners
      const callbacks = this.listeners.get(message.type)
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(message.data)
          } catch (error) {
            console.error('[WS] Error in message callback:', error)
          }
        })
      }

      // Handle specific message types
      switch (message.type) {
        case 'ORDER_UPDATE':
          this.handleOrderUpdate(message.data)
          break

        case 'KITCHEN_MESSAGE':
          this.handleKitchenMessage(message.data)
          break

        case 'SYSTEM_NOTIFICATION':
          this.handleSystemNotification(message.data)
          break

        case 'PONG':
          // Heartbeat response
          break

        default:
          console.log('[WS] Unhandled message type:', message.type)
      }

    } catch (error) {
      console.error('[WS] Failed to parse message:', error, rawData)
    }
  }

  /**
   * Handle order status updates
   */
  private handleOrderUpdate(data: OrderUpdateMessage): void {
    const toast = useToast()

    // Show notification based on status
    switch (data.status) {
      case 'CONFIRMED':
        toast.success(`Commande #${data.orderNumber} confirmée !`)
        break

      case 'PREPARING':
        toast.info(`Votre commande #${data.orderNumber} est en préparation`)
        break

      case 'READY':
        toast.success(`Commande #${data.orderNumber} prête ! 🔔`, {
          timeout: 10000
        })
        break

      case 'SERVED':
        toast.success(`Commande #${data.orderNumber} servie. Bon appétit ! 🍽️`)
        break

      case 'CANCELLED':
        toast.error(`Commande #${data.orderNumber} annulée`)
        break
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(data)
  }

  /**
   * Handle kitchen messages
   */
  private handleKitchenMessage(data: any): void {
    const toast = useToast()

    if (data.message) {
      toast.info(`Message de la cuisine: ${data.message}`, {
        timeout: 8000
      })
    }
  }

  /**
   * Handle system notifications
   */
  private handleSystemNotification(data: any): void {
    const toast = useToast()

    switch (data.type) {
      case 'info':
        toast.info(data.message)
        break
      case 'warning':
        toast.warning(data.message)
        break
      case 'error':
        toast.error(data.message)
        break
      default:
        toast(data.message)
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(data: OrderUpdateMessage): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const statusMessages = {
      CONFIRMED: 'Votre commande a été confirmée',
      PREPARING: 'Votre commande est en préparation',
      READY: 'Votre commande est prête !',
      SERVED: 'Votre commande a été servie',
      CANCELLED: 'Votre commande a été annulée'
    }

    const message = statusMessages[data.status as keyof typeof statusMessages] || 'Mise à jour de commande'

    new Notification(`Commande #${data.orderNumber}`, {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `order-${data.orderNumber}`,
      requireInteraction: data.status === 'READY',
      actions: [
        {
          action: 'view',
          title: 'Voir la commande'
        }
      ]
    })
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('PING', { timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached')
      return
    }

    const networkStore = useNetworkStore()
    if (!networkStore.isOnline) {
      console.log('[WS] Device is offline, skipping reconnect')
      return
    }

    this.reconnectAttempts++
    console.log(`[WS] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms`)

    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect().catch(error => {
          console.error('[WS] Reconnection failed:', error)

          // Exponential backoff
          this.reconnectInterval = Math.min(
            this.reconnectInterval * 1.5,
            this.maxReconnectInterval
          )
        })
      }
    }, this.reconnectInterval)
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    this.socket = null
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize event listeners for app lifecycle
   */
  private initializeEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isConnected() && !this.isIntentionallyClosed) {
        console.log('[WS] Page became visible, attempting to reconnect')
        this.connect().catch(console.error)
      }
    })

    // Handle network connectivity changes
    window.addEventListener('online', () => {
      if (!this.isConnected() && !this.isIntentionallyClosed) {
        console.log('[WS] Network back online, attempting to reconnect')
        this.reconnectAttempts = 0 // Reset attempts on network recovery
        this.connect().catch(console.error)
      }
    })

    window.addEventListener('offline', () => {
      console.log('[WS] Network went offline')
      this.disconnect()
    })
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

export default websocketService