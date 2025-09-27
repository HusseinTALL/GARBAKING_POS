/**
 * Order management routes for creating, updating, and tracking orders
 * Handles both local restaurant orders and sync operations with role-based access control
 */

import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDB } from '../database/init'
import {
  validateOrder,
  validateOrderStatus,
  validatePayment,
  validatePagination,
  validateUUID
} from '../middleware/validation'
import { asyncHandler, createError } from '../middleware/errorHandler'
import {
  authenticateToken,
  requirePermission,
  requireResourceAccess,
  requireMinimumRole,
  requireOwnershipOrAdmin,
  requireStore,
  ROLES
} from '../middleware/authMiddleware'
import { emitToStore, emitToRoom } from '../services/websocket'

const router = Router()

/**
 * GET /api/orders
 * Get orders with filtering and pagination
 * Requires: orders:read permission
 */
router.get('/',
  authenticateToken,
  requirePermission('orders:read'),
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const {
    page = 1,
    limit = 50,
    status,
    orderType,
    startDate,
    endDate,
    search
  } = req.query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const where: any = {
    storeId: req.user!.storeId
  }

  if (status) {
    where.status = String(status)
  }

  if (orderType) {
    where.orderType = String(orderType)
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(String(startDate)),
      lte: new Date(String(endDate))
    }
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: String(search), mode: 'insensitive' } },
      { customerName: { contains: String(search), mode: 'insensitive' } },
      { customerPhone: { contains: String(search), mode: 'insensitive' } },
      { tableNumber: { contains: String(search), mode: 'insensitive' } }
    ]
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true
              }
            }
          }
        }
      }
    }),
    db.order.count({ where })
  ])

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  })
}))

/**
 * GET /api/orders/:id
 * Get single order by ID
 * Requires: orders:read permission
 */
router.get('/:id',
  authenticateToken,
  requirePermission('orders:read'),
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { id } = req.params

  const order = await db.order.findFirst({
    where: {
      id,
      storeId: req.user!.storeId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      orderItems: {
        include: {
          menuItem: {
            include: {
              category: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    throw createError('Order not found', 404)
  }

  res.json({
    success: true,
    data: { order }
  })
}))

/**
 * POST /api/orders
 * Create new order
 * Requires: orders:create permission
 */
router.post('/',
  authenticateToken,
  requirePermission('orders:create'),
  validateOrder,
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const {
    customerName,
    customerPhone,
    tableNumber,
    orderType = 'DINE_IN',
    orderItems,
    notes,
    paymentMethod
  } = req.body

  // Generate order number
  const orderCount = await db.order.count({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  })
  const orderNumber = `${String(orderCount + 1).padStart(3, '0')}`

  // Generate idempotency key for sync
  const idempotencyKey = uuidv4()

  // Calculate totals
  let subtotal = 0
  const processedItems = []

  for (const item of orderItems) {
    const menuItem = await db.menuItem.findUnique({
      where: { id: item.menuItemId }
    })

    if (!menuItem || !menuItem.isActive || !menuItem.isAvailable) {
      throw createError(`Menu item ${item.menuItemId} is not available`, 400)
    }

    const itemTotal = menuItem.price * item.quantity
    subtotal += itemTotal

    processedItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      totalPrice: itemTotal,
      notes: item.notes
    })
  }

  // Calculate tax and total
  const taxRate = 0.1 // 10% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  // Create order with items
  const order = await db.order.create({
    data: {
      orderNumber,
      storeId: req.user!.storeId,
      customerName: customerName?.trim(),
      customerPhone: customerPhone?.trim(),
      tableNumber: tableNumber?.trim(),
      orderType,
      subtotal,
      tax,
      total,
      notes: notes?.trim(),
      userId: req.user!.id,
      idempotencyKey,
      syncStatus: 'PENDING',
      orderItems: {
        create: processedItems
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      orderItems: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              sku: true,
              imageUrl: true
            }
          }
        }
      }
    }
  })

  // Emit WebSocket events for real-time updates
  emitToStore(req.user!.storeId, 'new_order', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    orderType: order.orderType,
    status: order.status,
    total: order.total,
    itemCount: order.orderItems.length,
    createdAt: order.createdAt,
    order: order
  })

  // Specifically notify kitchen display
  emitToRoom('kitchen-display', 'new_kitchen_order', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderItems: order.orderItems,
    customerName: order.customerName,
    orderType: order.orderType,
    createdAt: order.createdAt,
    estimatedTime: order.estimatedTime
  })

  // TODO: Add to printing queue

  res.status(201).json({
    success: true,
    data: { order },
    message: 'Order created successfully'
  })
}))

/**
 * PUT /api/orders/:id/status
 * Update order status (Kitchen/Staff use)
 * Requires: orders:update permission or kitchen:update_status
 */
router.put('/:id/status',
  authenticateToken,
  requireResourceAccess('orders', 'update'),
  validateUUID('id'),
  validateOrderStatus,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params
    const { status, kitchenNotes, estimatedTime } = req.body

    // Verify order exists and belongs to store
    const existingOrder = await db.order.findFirst({
      where: {
        id,
        storeId: req.user!.storeId
      }
    })

    if (!existingOrder) {
      throw createError('Order not found', 404)
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['SERVED'],
      'SERVED': [],
      'CANCELLED': []
    }

    if (!validTransitions[existingOrder.status]?.includes(status)) {
      throw createError(`Cannot change order status from ${existingOrder.status} to ${status}`, 400)
    }

    // Calculate actual time if order is being served
    let actualTime = undefined
    if (status === 'SERVED' && existingOrder.status === 'READY') {
      const timeDiff = Date.now() - existingOrder.createdAt.getTime()
      actualTime = Math.round(timeDiff / (1000 * 60)) // minutes
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        kitchenNotes: kitchenNotes?.trim(),
        estimatedTime,
        actualTime,
        syncStatus: 'PENDING' // Mark for sync
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    // Emit WebSocket events for real-time updates
    emitToStore(req.user!.storeId, 'order_status_updated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: existingOrder.status,
      newStatus: status,
      kitchenNotes,
      estimatedTime,
      actualTime,
      updatedBy: req.user!.name,
      updatedAt: new Date(),
      order: order
    })

    // Notify all POS terminals
    emitToRoom('admin-pos', 'order_updated', {
      orderId: order.id,
      status,
      kitchenNotes,
      estimatedTime,
      order: order
    })

    // Notify kitchen displays
    emitToRoom('kitchen-display', 'kitchen_order_updated', {
      orderId: order.id,
      status,
      kitchenNotes,
      estimatedTime,
      order: order
    })

    // Notify customer app if order is ready for pickup
    if (status === 'READY') {
      emitToStore(req.user!.storeId, 'order_ready', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        estimatedTime
      })
    }

    // TODO: Trigger printing if status is READY

    res.json({
      success: true,
      data: { order },
      message: `Order status updated to ${status}`
    })
  })
)

/**
 * PUT /api/orders/:id/payment
 * Update order payment information
 * Requires: orders:modify_payment permission (Cashier+ only)
 */
router.put('/:id/payment',
  authenticateToken,
  requirePermission('orders:modify_payment'),
  validateUUID('id'),
  validatePayment,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params
    const { paymentMethod, paymentReference, amount } = req.body

    const order = await db.order.findFirst({
      where: {
        id,
        storeId: req.user!.storeId
      }
    })

    if (!order) {
      throw createError('Order not found', 404)
    }

    if (order.paymentStatus === 'PAID') {
      throw createError('Order is already paid', 400)
    }

    // Validate payment amount
    if (Math.abs(amount - order.total) > 0.01) {
      throw createError('Payment amount does not match order total', 400)
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        syncStatus: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    // Emit WebSocket event for payment completion
    emitToStore(req.user!.storeId, 'payment_completed', {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      paymentMethod,
      amount,
      paymentReference,
      processedBy: req.user!.name,
      processedAt: new Date(),
      order: updatedOrder
    })

    // Notify kitchen that order is fully paid
    if (updatedOrder.status === 'PENDING') {
      emitToRoom('kitchen-display', 'order_paid', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        paymentMethod,
        canStartPreparation: true
      })
    }

    res.json({
      success: true,
      data: { order: updatedOrder },
      message: 'Payment processed successfully'
    })
  })
)

/**
 * DELETE /api/orders/:id
 * Cancel order (Admin/Manager only)
 * Requires: orders:delete permission (Manager+ only)
 */
router.delete('/:id',
  authenticateToken,
  requireMinimumRole(ROLES.MANAGER),
  requirePermission('orders:delete'),
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { id } = req.params

  const order = await db.order.findFirst({
    where: {
      id,
      storeId: req.user!.storeId
    }
  })

  if (!order) {
    throw createError('Order not found', 404)
  }

  if (['SERVED', 'CANCELLED'].includes(order.status)) {
    throw createError('Cannot cancel order with current status', 400)
  }

  if (order.paymentStatus === 'PAID') {
    throw createError('Cannot cancel paid order without refund process', 400)
  }

  await db.order.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      syncStatus: 'PENDING'
    }
  })

  res.json({
    success: true,
    message: 'Order cancelled successfully'
  })
}))

/**
 * GET /api/orders/stats/today
 * Get today's order statistics
 * Requires: analytics:view_basic permission
 */
router.get('/stats/today',
  authenticateToken,
  requirePermission('analytics:view_basic'),
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const stats = await db.order.aggregate({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    _count: true,
    _sum: {
      total: true
    }
  })

  const statusCounts = await db.order.groupBy({
    by: ['status'],
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    _count: true
  })

  res.json({
    success: true,
    data: {
      totalOrders: stats._count,
      totalRevenue: stats._sum.total || 0,
      statusBreakdown: statusCounts.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>)
    }
  })
}))

// ============================================================================
// LOCAL ENDPOINTS (for offline POS operations)
// ============================================================================

/**
 * POST /local/orders
 * Local order creation endpoint (no auth required for offline operation)
 */
router.post('/local', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const {
    clientOrderId,
    idempotencyKey,
    storeId = process.env.STORE_ID,
    ...orderData
  } = req.body

  // Check for duplicate based on idempotency key
  if (idempotencyKey) {
    const existingOrder = await db.order.findUnique({
      where: { idempotencyKey }
    })

    if (existingOrder) {
      res.json({
        success: true,
        data: {
          localOrderId: existingOrder.id,
          clientOrderId: existingOrder.clientOrderId,
          synced: existingOrder.syncStatus === 'SYNCED'
        },
        message: 'Order already exists'
      })
      return
    }
  }

  // Create order similar to regular endpoint but with offline handling
  const orderNumber = `LOCAL${Date.now().toString().slice(-6)}`

  const order = await db.order.create({
    data: {
      ...orderData,
      clientOrderId,
      orderNumber,
      storeId: storeId || 'store_001',
      userId: 'local-user', // Default for offline operations
      idempotencyKey: idempotencyKey || clientOrderId || uuidv4(),
      syncStatus: 'PENDING'
    }
  })

  res.json({
    success: true,
    data: {
      localOrderId: order.id,
      clientOrderId: order.clientOrderId,
      orderNumber: order.orderNumber,
      synced: false
    },
    message: 'Order created locally'
  })
}))

/**
 * GET /local/menu
 * Local menu endpoint (no auth required)
 */
router.get('/local/menu', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  const menu = await db.category.findMany({
    where: { isActive: true },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ],
    include: {
      menuItems: {
        where: {
          isActive: true,
          isAvailable: true
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true
        }
      }
    }
  })

  res.json({
    success: true,
    data: { menu }
  })
}))

export default router