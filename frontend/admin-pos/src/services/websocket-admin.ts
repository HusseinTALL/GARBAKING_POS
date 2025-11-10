/**
 * WebSocket service for Admin POS - Real-time order updates
 * Uses STOMP over WebSocket to connect to Order Service
 * Monitors all orders for kitchen display and order management
 */

import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import { useToast } from 'vue-toastification'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws/orders'

export class AdminWebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10 // More attempts for admin
  private reconnectDelay = 1000
  private toast = useToast()
  private onOrderUpdateCallbacks: Set<(_order: any) => void> = new Set()

  /**
   * Connect to WebSocket server
   */
  connect(onConnected?: () => void, onError?: (error: any) => void) {
    if (this.client?.connected) {
      console.log('[Admin WS] Already connected')
      return
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as any,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[Admin STOMP]', str)
        }
      },
      onConnect: () => {
        console.log('✅ Admin WebSocket connected')
        this.reconnectAttempts = 0
        this.subscribeToAllTopics()
        if (onConnected) {
          onConnected()
        }
      },
      onStompError: (frame) => {
        console.error('❌ Admin WebSocket STOMP error:', frame)
        if (onError) {
          onError(frame)
        }
      },
      onWebSocketClose: () => {
        console.log('🔌 Admin WebSocket connection closed')
        this.handleReconnect()
      },
      onWebSocketError: (error) => {
        console.error('❌ Admin WebSocket error:', error)
        if (onError) {
          onError(error)
        }
      }
    })

    this.client.activate()
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`⏳ Admin reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        if (!this.client?.connected) {
          this.client?.activate()
        }
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
      this.toast.error('Lost connection to order system. Please refresh.')
    }
  }

  /**
   * Subscribe to all order topics for admin monitoring
   */
  private subscribeToAllTopics() {
    // Subscribe to order created events
    this.subscribeToOrderCreated((order) => {
      this.notifyCallbacks(order)
      this.showOrderNotification(order, 'created')
    })

    // Subscribe to order updates
    this.subscribeToOrderUpdated((order) => {
      this.notifyCallbacks(order)
    })

    // Subscribe to order status changes
    this.subscribeToOrderStatus((order) => {
      this.notifyCallbacks(order)
      this.showOrderNotification(order, 'status_changed')
    })

    // Subscribe to order cancellations
    this.subscribeToOrderCancelled((order) => {
      this.notifyCallbacks(order)
      this.showOrderNotification(order, 'cancelled')
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()
    this.onOrderUpdateCallbacks.clear()

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    console.log('🔌 Admin WebSocket disconnected')
  }

  /**
   * Subscribe to order created events
   */
  subscribeToOrderCreated(callback: (order: any) => void): string {
    const subscriptionId = 'order-created'

    if (!this.client?.connected) {
      console.warn('[Admin WS] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/created', (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('📦 New order:', order.orderNumber)
        callback(order)
      } catch (error) {
        console.error('Failed to parse order created message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrderUpdated(callback: (order: any) => void): string {
    const subscriptionId = 'order-updated'

    if (!this.client?.connected) {
      console.warn('[Admin WS] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/updated', (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('🔄 Order updated:', order.orderNumber)
        callback(order)
      } catch (error) {
        console.error('Failed to parse order updated message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Subscribe to order status changes
   */
  subscribeToOrderStatus(callback: (order: any) => void): string {
    const subscriptionId = 'order-status'

    if (!this.client?.connected) {
      console.warn('[Admin WS] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/status', (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('📊 Order status:', order.orderNumber, '->', order.status)
        callback(order)
      } catch (error) {
        console.error('Failed to parse order status message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Subscribe to order cancellations
   */
  subscribeToOrderCancelled(callback: (order: any) => void): string {
    const subscriptionId = 'order-cancelled'

    if (!this.client?.connected) {
      console.warn('[Admin WS] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/cancelled', (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('❌ Order cancelled:', order.orderNumber)
        callback(order)
      } catch (error) {
        console.error('Failed to parse order cancelled message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Subscribe to active orders updates (for kitchen display)
   */
  subscribeToActiveOrders(callback: (orders: any[]) => void): string {
    const subscriptionId = 'active-orders'

    if (!this.client?.connected) {
      console.warn('[Admin WS] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/active', (message) => {
      try {
        const orders = JSON.parse(message.body)
        console.log('📋 Active orders update:', orders.length)
        callback(orders)
      } catch (error) {
        console.error('Failed to parse active orders message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Register callback for any order update
   */
  onOrderUpdate(callback: (order: any) => void): () => void {
    this.onOrderUpdateCallbacks.add(callback)

    // Return unsubscribe function
    return () => {
      this.onOrderUpdateCallbacks.delete(callback)
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(order: any) {
    this.onOrderUpdateCallbacks.forEach(callback => {
      try {
        callback(order)
      } catch (error) {
        console.error('Error in order update callback:', error)
      }
    })
  }

  /**
   * Unsubscribe from a subscription
   */
  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`🔕 Unsubscribed from ${subscriptionId}`)
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client?.connected || false
  }

  /**
   * Show notification for order events
   */
  private showOrderNotification(order: any, eventType: 'created' | 'status_changed' | 'cancelled') {
    let message = ''
    let type: 'success' | 'info' | 'warning' | 'error' = 'info'

    switch (eventType) {
      case 'created':
        message = `New order #${order.orderNumber} received`
        type = 'info'
        // Play sound for new orders
        this.playNotificationSound()
        break

      case 'status_changed':
        if (order.status === 'READY') {
          message = `Order #${order.orderNumber} is ready!`
          type = 'success'
          this.playNotificationSound()
        }
        break

      case 'cancelled':
        message = `Order #${order.orderNumber} cancelled`
        type = 'warning'
        break
    }

    if (message) {
      this.toast[type](message, {
        timeout: 5000,
        position: 'top-right'
      })

      // Browser notification for new orders
      if (eventType === 'created') {
        this.showBrowserNotification(order, message)
      }
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(e => console.log('Could not play sound:', e))
    } catch (error) {
      console.log('Audio not available')
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(order: any, message: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    new Notification(`Garbaking Admin - Order #${order.orderNumber}`, {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `order-${order.orderNumber}`,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    })
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
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

// Export singleton instance
export const adminWsService = new AdminWebSocketService()

// Default export
export default adminWsService
