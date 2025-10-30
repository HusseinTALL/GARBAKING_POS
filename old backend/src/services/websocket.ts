/**
 * WebSocket service for real-time communication
 * Handles order updates, kitchen display updates, and client notifications
 */

import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { getDB } from '../database/init'

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string
    email: string
    name: string
    role: string
    storeId: string
  }
}

interface SocketUser {
  id: string
  email: string
  name: string
  role: string
  storeId: string
  socketId: string
}

// Store connected users
const connectedUsers = new Map<string, SocketUser>()

// Store rooms for different interfaces
const rooms = {
  ADMIN_POS: 'admin-pos',
  KDS: 'kitchen-display',
  CUSTOMER: 'customer-app'
}

/**
 * Setup WebSocket server with authentication and event handlers
 */
export function setupWebSocket(io: SocketIOServer): void {
  // Store io instance for global access
  setIOInstance(io)
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Development bypass for admin-pos clients
      if (process.env.NODE_ENV === 'development' && socket.handshake.query.clientType === 'admin-pos') {
        console.log('[DEV] WebSocket: Auto-authenticating admin-pos client')
        socket.user = {
          id: 'dev-admin-001',
          email: 'admin@garbaking.dev',
          name: 'Development Admin',
          role: 'ADMIN',
          storeId: 'store_001'
        }
        return next()
      }

      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        // Allow anonymous connections for customer app
        if (socket.handshake.query.clientType === 'customer') {
          return next()
        }
        return next(new Error('Authentication required'))
      }

      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        return next(new Error('Server configuration error'))
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any

      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid token'))
      }

      // Get user from database
      const db = getDB()
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          storeId: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'))
      }

      socket.user = user
      next()

    } catch (error) {
      console.error('WebSocket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  // Handle connections
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('WebSocket connection established:', socket.id)

    const clientType = socket.handshake.query.clientType as string

    // Handle authenticated connections
    if (socket.user) {
      const userData: SocketUser = {
        ...socket.user,
        socketId: socket.id
      }

      connectedUsers.set(socket.id, userData)

      // Join appropriate rooms based on client type and user role
      handleRoomJoining(socket, clientType, userData)

      console.log(`User ${userData.name} (${userData.role}) connected to ${clientType}`)
    } else {
      // Handle anonymous customer connections
      if (clientType === 'customer') {
        socket.join(rooms.CUSTOMER)
        console.log('Anonymous customer connected')
      }
    }

    // ========================================================================
    // ORDER EVENTS
    // ========================================================================

    /**
     * Join order-specific room for real-time updates
     */
    socket.on('join_order', (orderId: string) => {
      if (!orderId) return

      socket.join(`order_${orderId}`)
      console.log(`Socket ${socket.id} joined order ${orderId}`)
    })

    /**
     * Leave order-specific room
     */
    socket.on('leave_order', (orderId: string) => {
      if (!orderId) return

      socket.leave(`order_${orderId}`)
      console.log(`Socket ${socket.id} left order ${orderId}`)
    })

    /**
     * Handle order status updates from kitchen
     */
    socket.on('update_order_status', async (data: {
      orderId: string
      status: string
      kitchenNotes?: string
      estimatedTime?: number
    }) => {
      try {
        if (!socket.user || !['KITCHEN_STAFF', 'MANAGER', 'ADMIN'].includes(socket.user.role)) {
          socket.emit('error', { message: 'Insufficient permissions' })
          return
        }

        const db = getDB()
        const order = await db.order.update({
          where: { id: data.orderId },
          data: {
            status: data.status,
            kitchenNotes: data.kitchenNotes,
            estimatedTime: data.estimatedTime,
            syncStatus: 'PENDING'
          },
          include: {
            orderItems: {
              include: {
                menuItem: true
              }
            }
          }
        })

        // Broadcast to all connected clients
        io.emit('order_updated', {
          orderId: data.orderId,
          status: data.status,
          kitchenNotes: data.kitchenNotes,
          estimatedTime: data.estimatedTime,
          order
        })

        console.log(`Order ${data.orderId} status updated to ${data.status}`)

      } catch (error) {
        console.error('Error updating order status:', error)
        socket.emit('error', { message: 'Failed to update order status' })
      }
    })

    // ========================================================================
    // KITCHEN DISPLAY EVENTS
    // ========================================================================

    /**
     * Request kitchen display data
     */
    socket.on('get_kitchen_orders', async () => {
      try {
        if (!socket.user) return

        const db = getDB()
        const orders = await db.order.findMany({
          where: {
            storeId: socket.user.storeId,
            status: {
              in: ['CONFIRMED', 'PREPARING']
            }
          },
          orderBy: { createdAt: 'asc' },
          include: {
            orderItems: {
              include: {
                menuItem: true
              }
            }
          }
        })

        socket.emit('kitchen_orders', { orders })

      } catch (error) {
        console.error('Error fetching kitchen orders:', error)
        socket.emit('error', { message: 'Failed to fetch kitchen orders' })
      }
    })

    /**
     * Mark order item as prepared
     */
    socket.on('mark_item_prepared', async (data: {
      orderId: string
      itemId: string
    }) => {
      try {
        if (!socket.user || !['KITCHEN_STAFF', 'MANAGER', 'ADMIN'].includes(socket.user.role)) {
          socket.emit('error', { message: 'Insufficient permissions' })
          return
        }

        // Broadcast to kitchen displays
        io.to(rooms.KDS).emit('item_prepared', {
          orderId: data.orderId,
          itemId: data.itemId,
          preparedBy: socket.user.name
        })

        console.log(`Item ${data.itemId} marked as prepared for order ${data.orderId}`)

      } catch (error) {
        console.error('Error marking item as prepared:', error)
        socket.emit('error', { message: 'Failed to mark item as prepared' })
      }
    })

    // ========================================================================
    // POS EVENTS
    // ========================================================================

    /**
     * Handle new order creation
     */
    socket.on('new_order_created', (orderData: any) => {
      // Broadcast to kitchen displays and other POS terminals
      io.to(rooms.KDS).emit('new_order', orderData)
      io.to(rooms.ADMIN_POS).emit('new_order', orderData)

      console.log(`New order ${orderData.orderNumber} broadcasted`)
    })

    /**
     * Handle payment completion
     */
    socket.on('payment_completed', (data: {
      orderId: string
      paymentMethod: string
      amount: number
    }) => {
      // Broadcast payment completion
      io.emit('payment_completed', {
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        timestamp: new Date().toISOString()
      })

      console.log(`Payment completed for order ${data.orderId}`)
    })

    // ========================================================================
    // CUSTOMER EVENTS
    // ========================================================================

    /**
     * Customer order status request
     */
    socket.on('get_order_status', async (orderNumber: string) => {
      try {
        const db = getDB()
        const order = await db.order.findUnique({
          where: { orderNumber },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            estimatedTime: true,
            createdAt: true
          }
        })

        if (order) {
          socket.emit('order_status', order)
        } else {
          socket.emit('error', { message: 'Order not found' })
        }

      } catch (error) {
        console.error('Error fetching order status:', error)
        socket.emit('error', { message: 'Failed to fetch order status' })
      }
    })

    // ========================================================================
    // SYSTEM EVENTS
    // ========================================================================

    /**
     * Handle ping for connection health
     */
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`)

      // Remove from connected users
      const userData = connectedUsers.get(socket.id)
      if (userData) {
        connectedUsers.delete(socket.id)
        console.log(`User ${userData.name} disconnected`)
      }

      // Broadcast user offline status if needed
      if (socket.user) {
        socket.broadcast.emit('user_offline', {
          userId: socket.user.id,
          name: socket.user.name
        })
      }
    })

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  console.log('✅ WebSocket server configured')
}

/**
 * Handle room joining based on client type and user role
 */
function handleRoomJoining(
  socket: AuthenticatedSocket,
  clientType: string,
  userData: SocketUser
): void {
  switch (clientType) {
    case 'admin-pos':
      socket.join(rooms.ADMIN_POS)
      break

    case 'kds':
    case 'kitchen':
      socket.join(rooms.KDS)
      break

    case 'customer':
      socket.join(rooms.CUSTOMER)
      break

    default:
      // Default room based on user role
      if (['ADMIN', 'MANAGER', 'CASHIER'].includes(userData.role)) {
        socket.join(rooms.ADMIN_POS)
      } else if (userData.role === 'KITCHEN_STAFF') {
        socket.join(rooms.KDS)
      }
  }

  // Always join store-specific room
  socket.join(`store_${userData.storeId}`)

  // Broadcast user online status
  socket.broadcast.emit('user_online', {
    userId: userData.id,
    name: userData.name,
    role: userData.role
  })
}

// Store the io instance for global access
let ioInstance: SocketIOServer | null = null

/**
 * Set the io instance for global access
 */
export function setIOInstance(io: SocketIOServer): void {
  ioInstance = io
}

/**
 * Emit event to specific room
 */
export function emitToRoom(room: string, event: string, data: any): void {
  if (ioInstance) {
    ioInstance.to(room).emit(event, data)
    console.log(`Event ${event} emitted to room ${room}`)
  } else {
    console.warn('IO instance not available for room broadcast')
  }
}

/**
 * Emit event to all clients in a store
 */
export function emitToStore(storeId: string, event: string, data: any): void {
  if (ioInstance) {
    ioInstance.to(`store_${storeId}`).emit(event, data)
    console.log(`Event ${event} emitted to store ${storeId}`)
  } else {
    console.warn('IO instance not available for store broadcast')
  }
}

/**
 * Emit event to all connected clients
 */
export function emitToAll(event: string, data: any): void {
  if (ioInstance) {
    ioInstance.emit(event, data)
    console.log(`Event ${event} emitted to all clients`)
  } else {
    console.warn('IO instance not available for global broadcast')
  }
}

/**
 * Get connected users count
 */
export function getConnectedUsersCount(): number {
  return connectedUsers.size
}

/**
 * Get connected users by role
 */
export function getConnectedUsersByRole(role: string): SocketUser[] {
  return Array.from(connectedUsers.values()).filter(user => user.role === role)
}