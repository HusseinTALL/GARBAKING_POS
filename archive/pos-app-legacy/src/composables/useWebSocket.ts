/**
 * WebSocket composable for customer app real-time communication
 * Handles order status updates and customer notifications
 */

import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { io, Socket } from 'socket.io-client'

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
   * Initialize WebSocket connection (anonymous for customer app)
   */
  function connect() {
    if (socket && socket.connected) {
      console.log('Socket already connected')
      return
    }

    connectionStatus.connecting = true
    connectionStatus.error = null

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    socket = io(serverUrl, {
      query: {
        clientType: 'customer'
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

    console.log('Customer WebSocket connecting to:', serverUrl)
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
   * Request order status by order number
   */
  function getOrderStatus(orderNumber: string) {
    emit('get_order_status', orderNumber)
  }

  /**
   * Join order tracking room
   */
  function trackOrder(orderNumber: string) {
    emit('track_order', orderNumber)
  }

  /**
   * Stop tracking an order
   */
  function stopTrackingOrder(orderNumber: string) {
    emit('stop_tracking_order', orderNumber)
  }

  /**
   * Ping the server for connection health
   */
  function ping() {
    if (socket && socket.connected) {
      const startTime = Date.now()
      socket.emit('ping')

      socket.once('pong', (data: { timestamp: number }) => {
        const latency = Date.now() - startTime
        console.log(`Customer WebSocket latency: ${latency}ms`)
      })
    }
  }

  // Event handlers
  function handleConnect() {
    console.log('Customer WebSocket connected')
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
    console.log('Customer WebSocket disconnected:', reason)
    connectionStatus.connected = false
    connectionStatus.connecting = false

    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't try to reconnect
      connectionStatus.error = 'Disconnected by server'
    }
  }

  function handleConnectionError(error: Error) {
    console.error('Customer WebSocket connection error:', error)
    connectionStatus.connected = false
    connectionStatus.connecting = false
    connectionStatus.error = error.message || 'Connection failed'
    connectionStatus.reconnectAttempts++
  }

  function handleReconnect(attemptNumber: number) {
    console.log('Customer WebSocket reconnected after', attemptNumber, 'attempts')
    connectionStatus.reconnectAttempts = 0
    connectionStatus.error = null
  }

  function handleReconnectError(error: Error) {
    console.error('Customer WebSocket reconnection error:', error)
    connectionStatus.reconnectAttempts++
  }

  function handleReconnectFailed() {
    console.error('Customer WebSocket reconnection failed after maximum attempts')
    connectionStatus.error = 'Failed to reconnect after maximum attempts'
    connectionStatus.connecting = false
  }

  // Lifecycle
  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  // Customer-specific event helpers
  const customerEvents = {
    onOrderStatus: (callback: (data: any) => void) => on('order_status', callback),
    onOrderReady: (callback: (data: any) => void) => on('order_ready', callback),
    onOrderStatusUpdated: (callback: (data: any) => void) => on('order_status_updated', callback),
    onMenuUpdated: (callback: (data: any) => void) => on('menu_updated', callback),
    onStoreAnnouncement: (callback: (data: any) => void) => on('store_announcement', callback),
    onError: (callback: (data: any) => void) => on('error', callback)
  }

  // Customer actions
  const customerActions = {
    getOrderStatus,
    trackOrder,
    stopTrackingOrder,
    ping
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

    // Customer-specific helpers
    customerEvents,
    customerActions
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