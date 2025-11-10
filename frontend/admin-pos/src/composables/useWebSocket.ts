/**
 * WebSocket composable for real-time communication
 * Handles connection management, event listening, and automatic reconnection
 */

import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/auth'

interface SocketEvent {
  event: string
  callback: (data: any) => void
}

interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  error: string | null
  lastConnected: Date | null
  reconnectAttempts: number
  maxReconnectAttempts: number
}

export function useWebSocket() {
  const authStore = useAuthStore()

  // Connection state
  const connectionStatus = reactive<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  })

  // Socket instance
  let socket: Socket | null = null
  const registeredEvents = ref<SocketEvent[]>([])
  const reconnectTimeout = ref<NodeJS.Timeout | null>(null)

  // Computed properties
  const isConnected = computed(() => connectionStatus.connected)
  const isConnecting = computed(() => connectionStatus.connecting)
  const hasError = computed(() => !!connectionStatus.error)

  /**
   * Initialize WebSocket connection
   */
  function connect() {
    if (socket && socket.connected) {
      console.log('Socket already connected')
      return
    }

    connectionStatus.connecting = true
    connectionStatus.error = null

    const serverUrl =
      import.meta.env.VITE_API_GATEWAY_URL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:8080'

    socket = io(serverUrl, {
      auth: {
        token: authStore.token
      },
      query: {
        clientType: 'admin-pos'
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: connectionStatus.maxReconnectAttempts,
      timeout: 20000
    })

    // Connection event handlers
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectionError)
    socket.on('reconnect', handleReconnect)
    socket.on('reconnect_error', handleReconnectError)
    socket.on('reconnect_failed', handleReconnectFailed)

    // Register all previously registered events
    registeredEvents.value.forEach(({ event, callback }) => {
      socket?.on(event, callback)
    })

    console.log('WebSocket connecting to:', serverUrl)
  }

  /**
   * Disconnect WebSocket
   */
  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }

    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value)
      reconnectTimeout.value = null
    }

    connectionStatus.connected = false
    connectionStatus.connecting = false
    connectionStatus.error = null
  }

  /**
   * Register an event listener
   */
  function on(event: string, callback: (data: any) => void) {
    // Store the event for re-registration on reconnect
    registeredEvents.value.push({ event, callback })

    // Register immediately if socket is available
    if (socket) {
      socket.on(event, callback)
    }
  }

  /**
   * Remove an event listener
   */
  function off(event: string, callback?: (data: any) => void) {
    // Remove from registered events
    registeredEvents.value = registeredEvents.value.filter(
      e => !(e.event === event && (!callback || e.callback === callback))
    )

    // Remove from socket if available
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  /**
   * Emit an event to the server
   */
  function emit(event: string, data?: any) {
    if (socket && socket.connected) {
      socket.emit(event, data)
    } else {
      console.warn('Cannot emit event: Socket not connected')
    }
  }

  /**
   * Join a room
   */
  function joinRoom(room: string) {
    emit('join_room', { room })
  }

  /**
   * Leave a room
   */
  function leaveRoom(room: string) {
    emit('leave_room', { room })
  }

  /**
   * Join order-specific room for updates
   */
  function joinOrder(orderId: string) {
    emit('join_order', orderId)
  }

  /**
   * Leave order-specific room
   */
  function leaveOrder(orderId: string) {
    emit('leave_order', orderId)
  }

  /**
   * Ping the server for connection health
   */
  function ping() {
    if (socket && socket.connected) {
      const startTime = Date.now()
      socket.emit('ping')

      socket.once('pong', (_data: { timestamp: number }) => {
        const latency = Date.now() - startTime
        console.log(`WebSocket latency: ${latency}ms`)
      })
    }
  }

  // Event handlers
  function handleConnect() {
    console.log('WebSocket connected')
    connectionStatus.connected = true
    connectionStatus.connecting = false
    connectionStatus.error = null
    connectionStatus.lastConnected = new Date()
    connectionStatus.reconnectAttempts = 0

    // Clear any pending reconnect timeout
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value)
      reconnectTimeout.value = null
    }
  }

  function handleDisconnect(reason: string) {
    console.log('WebSocket disconnected:', reason)
    connectionStatus.connected = false
    connectionStatus.connecting = false

    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't try to reconnect
      connectionStatus.error = 'Disconnected by server'
    }
  }

  function handleConnectionError(error: Error) {
    console.error('WebSocket connection error:', error)
    connectionStatus.connected = false
    connectionStatus.connecting = false
    connectionStatus.error = error.message || 'Connection failed'
    connectionStatus.reconnectAttempts++
  }

  function handleReconnect(attemptNumber: number) {
    console.log('WebSocket reconnected after', attemptNumber, 'attempts')
    connectionStatus.reconnectAttempts = 0
    connectionStatus.error = null
  }

  function handleReconnectError(error: Error) {
    console.error('WebSocket reconnection error:', error)
    connectionStatus.reconnectAttempts++
  }

  function handleReconnectFailed() {
    console.error('WebSocket reconnection failed after maximum attempts')
    connectionStatus.error = 'Failed to reconnect after maximum attempts'
    connectionStatus.connecting = false
  }

  // Lifecycle
  onMounted(() => {
    if (authStore.isAuthenticated) {
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
  })

  // Order-specific event helpers
  const orderEvents = {
    onNewOrder: (callback: (data: any) => void) => on('new_order', callback),
    onOrderUpdated: (callback: (data: any) => void) => on('order_updated', callback),
    onOrderStatusUpdated: (callback: (data: any) => void) => on('order_status_updated', callback),
    onPaymentCompleted: (callback: (data: any) => void) => on('payment_completed', callback),
    onOrderReady: (callback: (data: any) => void) => on('order_ready', callback)
  }

  // Kitchen-specific event helpers
  const kitchenEvents = {
    onNewKitchenOrder: (callback: (data: any) => void) => on('new_kitchen_order', callback),
    onKitchenOrderUpdated: (callback: (data: any) => void) => on('kitchen_order_updated', callback),
    onItemPrepared: (callback: (data: any) => void) => on('item_prepared', callback),
    onOrderPaid: (callback: (data: any) => void) => on('order_paid', callback)
  }

  // User presence event helpers
  const presenceEvents = {
    onUserOnline: (callback: (data: any) => void) => on('user_online', callback),
    onUserOffline: (callback: (data: any) => void) => on('user_offline', callback)
  }

  // Order actions
  const orderActions = {
    updateOrderStatus: (orderId: string, status: string, notes?: string, estimatedTime?: number) => {
      emit('update_order_status', { orderId, status, kitchenNotes: notes, estimatedTime })
    },
    markItemPrepared: (orderId: string, itemId: string) => {
      emit('mark_item_prepared', { orderId, itemId })
    },
    broadcastNewOrder: (orderData: any) => {
      emit('new_order_created', orderData)
    },
    broadcastPaymentCompleted: (orderId: string, paymentMethod: string, amount: number) => {
      emit('payment_completed', { orderId, paymentMethod, amount })
    }
  }

  return {
    // Connection state
    connectionStatus: readonly(connectionStatus),
    isConnected,
    isConnecting,
    hasError,

    // Connection methods
    connect,
    disconnect,
    ping,

    // Event methods
    on,
    off,
    emit,

    // Room methods
    joinRoom,
    leaveRoom,
    joinOrder,
    leaveOrder,

    // Event helpers
    orderEvents,
    kitchenEvents,
    presenceEvents,

    // Action helpers
    orderActions
  }
}

// Singleton instance for app-wide use
let globalWebSocket: ReturnType<typeof useWebSocket> | null = null

export function useGlobalWebSocket() {
  if (!globalWebSocket) {
    globalWebSocket = useWebSocket()
  }
  return globalWebSocket
}
