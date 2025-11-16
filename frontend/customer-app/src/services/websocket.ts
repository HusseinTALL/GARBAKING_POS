/**
 * WebSocket Service - Real-time communication with Spring Boot backend
 *
 * Uses STOMP protocol over SockJS for compatibility with Spring WebSocket
 *
 * Provides:
 * - Order status updates
 * - Delivery tracking
 * - Kitchen notifications
 * - Automatic reconnection
 */

import { Client, StompSubscription, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useToast } from 'vue-toastification'

// WebSocket URL from environment or default
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
const HTTP_WS_URL = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')

export interface OrderUpdateMessage {
  orderId: string
  orderNumber: string
  status: string
  estimatedTime?: number
  kitchenNotes?: string
  updatedAt?: string
}

export interface DeliveryUpdate {
  orderNumber: string
  driverName?: string
  driverPhone?: string
  driverLocation?: {
    lat: number
    lng: number
  }
  estimatedArrival?: string
  status: string
}

class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 5000 // 5 seconds
  private isConnecting = false
  private isConnected = false
  private toast = useToast()

  /**
   * Connect to WebSocket server using STOMP over SockJS
   */
  connect(orderNumber?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        console.log('[WebSocket] Already connected')
        // Subscribe to order if provided
        if (orderNumber) {
          this.subscribeToOrder(orderNumber)
        }
        resolve()
        return
      }

      if (this.isConnecting) {
        console.log('[WebSocket] Connection in progress')
        return
      }

      this.isConnecting = true

      try {
        console.log('[WebSocket] Connecting to:', HTTP_WS_URL)

        this.client = new Client({
          webSocketFactory: () => new SockJS(HTTP_WS_URL),

          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000, // 10 seconds
          heartbeatOutgoing: 10000,

          onConnect: () => {
            console.log('[WebSocket] Connected to STOMP server')
            this.isConnected = true
            this.isConnecting = false
            this.reconnectAttempts = 0

            // Subscribe to order updates if order number provided
            if (orderNumber) {
              this.subscribeToOrder(orderNumber)
            }

            resolve()
          },

          onDisconnect: () => {
            console.log('[WebSocket] Disconnected from server')
            this.isConnected = false
            this.isConnecting = false
            this.subscriptions.clear()
          },

          onStompError: (frame) => {
            console.error('[WebSocket] STOMP error:', frame.headers['message'])
            console.error('[WebSocket] Error details:', frame.body)
            this.isConnecting = false
            this.toast.error('Erreur de connexion WebSocket')
            reject(new Error(frame.headers['message'] || 'STOMP connection error'))
          },

          onWebSocketError: (error) => {
            console.error('[WebSocket] WebSocket error:', error)
            this.isConnecting = false

            // Attempt reconnection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++
              const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
              console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

              setTimeout(() => {
                this.connect(orderNumber)
              }, delay)
            } else {
              console.error('[WebSocket] Max reconnection attempts reached')
              this.toast.error('Impossible de se connecter au serveur')
              reject(new Error('Max reconnection attempts reached'))
            }
          },

          debug: (str) => {
            if (import.meta.env.DEV) {
              console.log('[WebSocket Debug]', str)
            }
          }
        })

        this.client.activate()
      } catch (error) {
        console.error('[WebSocket] Failed to create connection:', error)
        this.isConnecting = false
        this.toast.error('Erreur lors de la connexion WebSocket')
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...')

    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()

    // Deactivate client
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }

    this.isConnected = false
    this.isConnecting = false
  }

  /**
   * Subscribe to order updates for a specific order
   */
  subscribeToOrder(
    orderNumber: string,
    callback?: (data: OrderUpdateMessage) => void
  ): (() => void) | undefined {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Not connected. Call connect() first.')
      return
    }

    const topic = `/topic/orders/${orderNumber}`
    const subscriptionId = `order-${orderNumber}`

    try {
      const subscription = this.client.subscribe(
        topic,
        (message: IMessage) => {
          try {
            const update: OrderUpdateMessage = JSON.parse(message.body)
            console.log('[WebSocket] Order update received:', update)

            // Call custom callback if provided
            if (callback) {
              callback(update)
            }

            // Show notification
            this.handleOrderUpdate(update)
          } catch (error) {
            console.error('[WebSocket] Failed to parse order update:', error)
          }
        }
      )

      this.subscriptions.set(subscriptionId, subscription)
      console.log(`[WebSocket] Subscribed to ${topic}`)

      // Return unsubscribe function
      return () => {
        this.unsubscribeFromOrder(orderNumber)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to order:', error)
      throw error
    }
  }

  /**
   * Subscribe to delivery tracking updates
   */
  subscribeToDelivery(
    orderNumber: string,
    callback: (update: DeliveryUpdate) => void
  ): () => void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.')
    }

    const topic = `/topic/delivery/${orderNumber}`
    const subscriptionId = `delivery-${orderNumber}`

    try {
      const subscription = this.client.subscribe(
        topic,
        (message: IMessage) => {
          try {
            const update: DeliveryUpdate = JSON.parse(message.body)
            console.log('[WebSocket] Delivery update received:', update)
            callback(update)
          } catch (error) {
            console.error('[WebSocket] Failed to parse delivery update:', error)
          }
        }
      )

      this.subscriptions.set(subscriptionId, subscription)
      console.log(`[WebSocket] Subscribed to ${topic}`)

      return () => {
        this.unsubscribeFromDelivery(orderNumber)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to delivery:', error)
      throw error
    }
  }

  /**
   * Subscribe to kitchen status updates
   */
  subscribeToKitchen(
    orderId: string,
    callback: (update: any) => void
  ): () => void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.')
    }

    const topic = `/topic/kitchen/${orderId}`
    const subscriptionId = `kitchen-${orderId}`

    try {
      const subscription = this.client.subscribe(
        topic,
        (message: IMessage) => {
          try {
            const update = JSON.parse(message.body)
            console.log('[WebSocket] Kitchen update received:', update)
            callback(update)
          } catch (error) {
            console.error('[WebSocket] Failed to parse kitchen update:', error)
          }
        }
      )

      this.subscriptions.set(subscriptionId, subscription)
      console.log(`[WebSocket] Subscribed to ${topic}`)

      return () => {
        this.unsubscribeFromKitchen(orderId)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to kitchen:', error)
      throw error
    }
  }

  /**
   * Generic subscribe method for custom topics
   */
  subscribe(eventName: string, callback: (data: any) => void): () => void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Not connected. Cannot subscribe to:', eventName)
      return () => {}
    }

    const topic = `/topic/${eventName}`
    const subscriptionId = `custom-${eventName}`

    try {
      const subscription = this.client.subscribe(
        topic,
        (message: IMessage) => {
          try {
            const data = JSON.parse(message.body)
            callback(data)
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }
      )

      this.subscriptions.set(subscriptionId, subscription)

      return () => {
        const sub = this.subscriptions.get(subscriptionId)
        if (sub) {
          sub.unsubscribe()
          this.subscriptions.delete(subscriptionId)
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe:', error)
      return () => {}
    }
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder(orderNumber: string): void {
    const subscriptionId = `order-${orderNumber}`
    const subscription = this.subscriptions.get(subscriptionId)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`[WebSocket] Unsubscribed from order ${orderNumber}`)
    }
  }

  /**
   * Unsubscribe from delivery updates
   */
  unsubscribeFromDelivery(orderNumber: string): void {
    const subscriptionId = `delivery-${orderNumber}`
    const subscription = this.subscriptions.get(subscriptionId)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`[WebSocket] Unsubscribed from delivery ${orderNumber}`)
    }
  }

  /**
   * Unsubscribe from kitchen updates
   */
  unsubscribeFromKitchen(orderId: string): void {
    const subscriptionId = `kitchen-${orderId}`
    const subscription = this.subscriptions.get(subscriptionId)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`[WebSocket] Unsubscribed from kitchen ${orderId}`)
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.isConnected && this.client?.connected === true
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    if (this.isConnected) return 'connected'
    if (this.isConnecting) return 'connecting'
    return 'disconnected'
  }

  /**
   * Send a message to the server
   */
  send(destination: string, body: any): void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.')
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      })
      console.log(`[WebSocket] Message sent to ${destination}`)
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error)
      throw error
    }
  }

  /**
   * Handle order status updates and show notifications
   */
  private handleOrderUpdate(data: OrderUpdateMessage): void {
    // Show toast notification based on status
    this.showStatusNotification(data)

    // Show browser notification if permitted
    this.showBrowserNotification(data)
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
      SERVED: {
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
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(data: OrderUpdateMessage): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const statusMessages: Record<string, string> = {
      PENDING: `Commande #${data.orderNumber} reçue`,
      CONFIRMED: `Commande #${data.orderNumber} confirmée !`,
      PREPARING: 'Votre commande est en préparation...',
      READY: `Commande #${data.orderNumber} prête !`,
      COMPLETED: 'Votre commande a été servie. Bon appétit !',
      SERVED: 'Votre commande a été servie. Bon appétit !',
      CANCELLED: `Commande #${data.orderNumber} annulée`
    }

    const message = statusMessages[data.status]
    if (message) {
      new Notification(`Garbaking - Commande #${data.orderNumber}`, {
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `order-${data.orderNumber}`,
        requireInteraction: data.status === 'READY',
        vibrate: data.status === 'READY' ? [200, 100, 200] : undefined
      })
    }
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

// Also export as default
export default websocketService
