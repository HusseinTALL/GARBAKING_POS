/**
 * WebSocket service for real-time order updates using STOMP
 * Connects to Spring Boot Order Service WebSocket endpoint
 */

import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import { useToast } from 'vue-toastification'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws/orders'

export class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private toast = useToast()

  /**
   * Connect to WebSocket server
   */
  connect(onConnected?: () => void, onError?: (error: any) => void) {
    if (this.client?.connected) {
      console.log('[STOMP] Already connected')
      return
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as any,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str)
        }
      },
      onConnect: () => {
        console.log('✅ WebSocket connected')
        this.reconnectAttempts = 0
        if (onConnected) {
          onConnected()
        }
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket STOMP error:', frame)
        if (onError) {
          onError(frame)
        }
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket connection closed')
        this.handleReconnect()
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error)
        if (onError) {
          onError(error)
        }
      }
    })

    this.client.activate()
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        if (!this.client?.connected) {
          this.client?.activate()
        }
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
      this.toast.error('Connection perdue. Veuillez actualiser la page.')
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    console.log('🔌 WebSocket disconnected')
  }

  /**
   * Subscribe to order status changes
   */
  subscribeToOrderStatus(callback: (order: any) => void): string {
    const subscriptionId = 'order-status'

    if (!this.client?.connected) {
      console.warn('[STOMP] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe('/topic/orders/status', (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('📊 Order status changed:', order.orderNumber, '->', order.status)
        this.showStatusNotification(order)
        callback(order)
      } catch (error) {
        console.error('Failed to parse order status message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
  }

  /**
   * Subscribe to user-specific orders
   */
  subscribeToUserOrders(userId: number, callback: (order: any) => void): string {
    const subscriptionId = `user-orders-${userId}`

    if (!this.client?.connected) {
      console.warn('[STOMP] Not connected, cannot subscribe')
      return subscriptionId
    }

    const subscription = this.client.subscribe(`/user/${userId}/queue/orders`, (message) => {
      try {
        const order = JSON.parse(message.body)
        console.log('👤 User order update:', order.orderNumber)
        this.showStatusNotification(order)
        callback(order)
      } catch (error) {
        console.error('Failed to parse user order message:', error)
      }
    })

    this.subscriptions.set(subscriptionId, subscription)
    return subscriptionId
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
   * Show toast notification for order status changes
   */
  private showStatusNotification(order: any): void {
    const statusMessages: Record<string, { message: string; type: 'success' | 'info' | 'warning' | 'error' }> = {
      PENDING: {
        message: `Commande #${order.orderNumber} reçue`,
        type: 'info'
      },
      CONFIRMED: {
        message: `Commande #${order.orderNumber} confirmée ! ✓`,
        type: 'success'
      },
      PREPARING: {
        message: `Votre commande est en préparation... 👨‍🍳`,
        type: 'info'
      },
      READY: {
        message: `Commande #${order.orderNumber} prête ! 🔔`,
        type: 'success'
      },
      COMPLETED: {
        message: `Commande #${order.orderNumber} servie. Bon appétit ! 🍽️`,
        type: 'success'
      },
      CANCELLED: {
        message: `Commande #${order.orderNumber} annulée`,
        type: 'error'
      }
    }

    const notification = statusMessages[order.status]
    if (notification) {
      const toastOptions = {
        timeout: order.status === 'READY' ? 10000 : 5000
      }

      switch (notification.type) {
        case 'success':
          this.toast.success(notification.message, toastOptions)
          break
        case 'info':
          this.toast.info(notification.message, toastOptions)
          break
        case 'warning':
          this.toast.warning(notification.message, toastOptions)
          break
        case 'error':
          this.toast.error(notification.message, toastOptions)
          break
      }

      // Show browser notification if permission granted
      this.showBrowserNotification(order, notification.message)
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(order: any, message: string): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    new Notification(`Garbaking - Commande #${order.orderNumber}`, {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `order-${order.orderNumber}`,
      requireInteraction: order.status === 'READY',
      vibrate: order.status === 'READY' ? [200, 100, 200] : undefined
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

// Export singleton instance
export const wsService = new WebSocketService()

// Default export
export default wsService
