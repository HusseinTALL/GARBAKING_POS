/**
 * WebSocket service for real-time communication using Socket.io
 * Handles order status updates, notifications, and live updates
 */

import { io, Socket } from 'socket.io-client'
import { useToast } from 'vue-toastification'

interface OrderUpdateMessage {
  orderId: string
  orderNumber: string
  status: string
  estimatedTime?: number
  kitchenNotes?: string
}

class WebSocketService {
  private socket: Socket | null = null
  private isIntentionallyClosed = false
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private toast = useToast()

  constructor() {
    // Initialize service
  }

  /**
   * Connect to Socket.io server
   */
  connect(orderNumber?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use Vite proxy - connect to same host/port as API
        const socketUrl = window.location.origin

        console.log('[Socket.io] Connecting to:', socketUrl)

        this.socket = io(socketUrl, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000
        })

        this.isIntentionallyClosed = false

        this.socket.on('connect', () => {
          console.log('[Socket.io] Connected successfully, ID:', this.socket?.id)

          // Subscribe to order updates if order number provided
          if (orderNumber) {
            this.subscribeToOrder(orderNumber)
          }

          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('[Socket.io] Disconnected:', reason)
        })

        this.socket.on('connect_error', (error) => {
          console.error('[Socket.io] Connection error:', error)
          reject(error)
        })

        // Listen for order status updates
        this.socket.on('order_status', (data) => {
          console.log('[Socket.io] Order status update:', data)
          this.handleOrderUpdate(data)
        })

        // Listen for order updates (broadcasted when status changes)
        this.socket.on('order_updated', (data) => {
          console.log('[Socket.io] Order updated:', data)
          this.handleOrderUpdate(data)
        })

        // Listen for errors
        this.socket.on('error', (error) => {
          console.error('[Socket.io] Server error:', error)
          this.toast.error(error.message || 'Une erreur est survenue')
        })

      } catch (error) {
        console.error('[Socket.io] Failed to create socket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    console.log('[Socket.io] Disconnecting...')
    this.isIntentionallyClosed = true

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(eventName: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName)!.add(callback)

    // Also listen on socket if connected
    if (this.socket) {
      this.socket.on(eventName, callback)
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventName)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(eventName)
        }
      }

      // Remove from socket
      if (this.socket) {
        this.socket.off(eventName, callback)
      }
    }
  }

  /**
   * Subscribe to order updates for a specific order
   */
  subscribeToOrder(orderNumber: string, callback?: (data: OrderUpdateMessage) => void): () => void {
    console.log('[Socket.io] Subscribing to order:', orderNumber)

    // Request order status updates
    if (this.socket?.connected) {
      this.socket.emit('get_order_status', orderNumber)
    }

    // Subscribe to order_status and order_updated events
    const unsubscribeFuncs: Array<() => void> = []

    if (callback) {
      const unsubscribe1 = this.subscribe('order_status', (data) => {
        if (data.orderNumber === orderNumber) {
          callback(data)
        }
      })

      const unsubscribe2 = this.subscribe('order_updated', (data) => {
        if (data.orderNumber === orderNumber) {
          callback(data)
        }
      })

      unsubscribeFuncs.push(unsubscribe1, unsubscribe2)
    }

    // Return combined unsubscribe function
    return () => {
      unsubscribeFuncs.forEach(fn => fn())
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected'
    return this.socket.connected ? 'connected' : 'disconnected'
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Handle order status updates
   */
  private handleOrderUpdate(data: any): void {
    const orderData: OrderUpdateMessage = {
      orderId: data.id || data.orderId,
      orderNumber: data.orderNumber,
      status: data.status,
      estimatedTime: data.estimatedTime,
      kitchenNotes: data.kitchenNotes
    }

    // Emit to listeners
    const callbacks = this.listeners.get('ORDER_UPDATE')
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(orderData)
        } catch (error) {
          console.error('[Socket.io] Error in callback:', error)
        }
      })
    }

    // Show toast notification based on status
    this.showStatusNotification(orderData)
  }

  /**
   * Show toast notification for order status changes
   */
  private showStatusNotification(data: OrderUpdateMessage): void {
    const statusMessages: Record<string, { message: string; type: 'success' | 'info' | 'warning' | 'error' }> = {
      PENDING: {
        message: `Commande #${data.orderNumber} reçue`,
        type: 'info'
      },
      CONFIRMED: {
        message: `Commande #${data.orderNumber} confirmée ! ✓`,
        type: 'success'
      },
      PREPARING: {
        message: `Votre commande est en préparation... 👨‍🍳`,
        type: 'info'
      },
      READY: {
        message: `Commande #${data.orderNumber} prête ! 🔔`,
        type: 'success'
      },
      COMPLETED: {
        message: `Commande #${data.orderNumber} servie. Bon appétit ! 🍽️`,
        type: 'success'
      },
      CANCELLED: {
        message: `Commande #${data.orderNumber} annulée`,
        type: 'error'
      }
    }

    const notification = statusMessages[data.status]
    if (notification) {
      const toastOptions = {
        timeout: data.status === 'READY' ? 10000 : 5000
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
      this.showBrowserNotification(data, notification.message)
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(data: OrderUpdateMessage, message: string): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    new Notification(`Garbaking - Commande #${data.orderNumber}`, {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `order-${data.orderNumber}`,
      requireInteraction: data.status === 'READY',
      vibrate: data.status === 'READY' ? [200, 100, 200] : undefined
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
