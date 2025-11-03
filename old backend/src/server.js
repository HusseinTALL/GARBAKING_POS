/**
 * Fastify Server (JavaScript - No TypeScript complications!)
 * Fast, simple backend for Garbaking POS customer app
 */

const Fastify = require('fastify')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

// Initialize database
async function initDB() {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected and healthy')

    // Verify default settings
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      await prisma.settings.create({
        data: {
          key: 'store_name',
          value: 'Garbaking POS',
          description: 'Store name'
        }
      })
    }
    console.log('⚙️ Default settings verified')
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    throw error
  }
}

// Build Fastify app
function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true
        }
      } : undefined
    },
    trustProxy: true,
    bodyLimit: 10485760, // 10MB
    ignoreTrailingSlash: true
  })

  // Add Prisma to fastify instance
  fastify.decorate('prisma', prisma)

  // Register plugins
  fastify.register(require('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://admin.garbaking.com', 'https://customer.garbaking.com']
      : true, // Allow all origins in development (for mobile access on local network)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })

  fastify.register(require('@fastify/compress'), { global: true })
  fastify.register(require('@fastify/formbody'))
  fastify.register(require('@fastify/sensible'))

  // WebSocket support
  fastify.register(require('fastify-socket.io'), {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://admin.garbaking.com', 'https://customer.garbaking.com']
        : true, // Allow all origins in development (for mobile access on local network)
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Health check
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      websocket: 'active'
    }
  })

  fastify.get('/api/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })

  // ============================================================
  // MENU ROUTES (Customer App)
  // ============================================================

  // GET /api/menu/public - Public menu with categories and items
  fastify.get('/api/menu/public', async (request, reply) => {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
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
              imageUrl: true,
              categoryId: true,
              prepTime: true,
              calories: true,
              isSpicy: true,
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true
            }
          }
        }
      })

      return { success: true, data: { categories } }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch menu'
      })
    }
  })

  // GET /local/menu - Alias for backward compatibility
  fastify.get('/local/menu', async (request, reply) => {
    return fastify.inject({
      method: 'GET',
      url: '/api/menu/public'
    }).then(res => res.payload)
  })

  // GET /api/menu/categories - Get categories
  fastify.get('/api/menu/categories', async (request, reply) => {
    try {
      const { page = 1, limit = 50, search } = request.query

      const where = { isActive: true }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' }
      }

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip,
          take,
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            _count: {
              select: {
                menuItems: { where: { isActive: true } }
              }
            }
          }
        }),
        prisma.category.count({ where })
      ])

      return {
        success: true,
        data: {
          categories,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch categories' })
    }
  })

  // GET /api/menu/items - Get menu items with filters
  fastify.get('/api/menu/items', async (request, reply) => {
    try {
      const { page = 1, limit = 50, search, categoryId, available } = request.query

      const where = { isActive: true }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (available !== undefined) {
        where.isAvailable = available === 'true'
      }

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      const [menuItems, total] = await Promise.all([
        prisma.menuItem.findMany({
          where,
          skip,
          take,
          orderBy: { name: 'asc' },
          include: { category: true }
        }),
        prisma.menuItem.count({ where })
      ])

      return {
        success: true,
        data: {
          menuItems,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch menu items' })
    }
  })

  // ============================================================
  // ORDER ROUTES (Customer App)
  // ============================================================

  // POST /api/orders - Create new order
  fastify.post('/api/orders', async (request, reply) => {
    try {
      const {
        items,
        orderType,
        customerName,
        customerPhone,
        customerEmail,
        tableNumber,
        notes,
        specialRequests
      } = request.body

      // Validate
      if (!items || items.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Order must contain at least one item'
        })
      }

      if (!orderType) {
        return reply.status(400).send({
          success: false,
          error: 'Order type is required'
        })
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
      const taxRate = 0.08 // 8% tax
      const tax = subtotal * taxRate
      const total = subtotal + tax

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Default user ID for customer orders
      const defaultUserId = process.env.DEFAULT_USER_ID || 'customer-default'

      // Ensure user exists
      let user = await prisma.user.findUnique({ where: { id: defaultUserId } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: defaultUserId,
            email: 'customer@garbaking.com',
            password: 'not-used',
            name: 'Customer App',
            role: 'CASHIER',
            storeId: process.env.STORE_ID || 'store_001'
          }
        })
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          storeId: process.env.STORE_ID || 'store_001',
          orderType,
          customerName,
          customerPhone,
          customerEmail,
          tableNumber,
          notes,
          specialRequests,
          subtotal,
          tax,
          taxRate,
          total,
          status: 'PENDING',
          userId: user.id,
          source: 'CUSTOMER_APP',
          orderItems: {
            create: items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              notes: item.notes || null
            }))
          }
        },
        include: {
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

      // Emit WebSocket event
      if (fastify.io) {
        fastify.io.emit('new_order', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderType: order.orderType,
          total: order.total,
          itemCount: items.length
        })
      }

      fastify.log.info(`Order created: ${orderNumber}`)

      return reply.status(201).send({
        success: true,
        data: { order, orderNumber: order.orderNumber },
        message: 'Order created successfully'
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to create order',
        details: error.message
      })
    }
  })

  // GET /api/orders/:orderNumber - Get order by number
  fastify.get('/api/orders/:orderNumber', async (request, reply) => {
    try {
      const { orderNumber } = request.params

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          orderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      })

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        })
      }

      return { success: true, data: { order } }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch order' })
    }
  })

  // GET /api/orders/:orderNumber/status - Get order status
  fastify.get('/api/orders/:orderNumber/status', async (request, reply) => {
    try {
      const { orderNumber } = request.params

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          orderNumber: true,
          status: true,
          estimatedTime: true,
          createdAt: true,
          completedAt: true
        }
      })

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        })
      }

      return { success: true, data: order }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch order status' })
    }
  })

  // GET /api/orders/track/:orderNumber - Track order for customer (with full details)
  fastify.get('/api/orders/track/:orderNumber', async (request, reply) => {
    try {
      const { orderNumber } = request.params

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
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

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        })
      }

      return {
        success: true,
        data: { order }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to track order'
      })
    }
  })

  // GET /api/orders/customer/history - Get customer order history by phone number
  fastify.get('/api/orders/customer/history', async (request, reply) => {
    try {
      const { phone } = request.query

      if (!phone) {
        return reply.status(400).send({
          success: false,
          error: 'Phone number is required'
        })
      }

      // Get all orders for this customer phone number, sorted by newest first
      const orders = await prisma.order.findMany({
        where: {
          customerPhone: phone
        },
        include: {
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return {
        success: true,
        data: {
          orders,
          count: orders.length
        }
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch order history'
      })
    }
  })

  // POST /api/orders/:orderNumber/cancel - Cancel an order (customer use)
  fastify.post('/api/orders/:orderNumber/cancel', async (request, reply) => {
    try {
      const { orderNumber } = request.params
      const { reason } = request.body

      // Find the order
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      })

      if (!existingOrder) {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        })
      }

      // Check if order can be cancelled (only PENDING or CONFIRMED orders)
      if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
        return reply.status(400).send({
          success: false,
          error: `Cannot cancel order with status ${existingOrder.status}. Only pending or confirmed orders can be cancelled.`
        })
      }

      // Update order to cancelled
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status: 'CANCELLED',
          cancelReason: reason || 'Cancelled by customer',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Broadcast cancellation to all connected Socket.io clients
      fastify.io.emit('order_updated', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'CANCELLED',
        cancelReason: order.cancelReason,
        updatedAt: order.updatedAt
      })

      fastify.log.info(`Order ${orderNumber} cancelled by customer`)

      return {
        success: true,
        data: { order },
        message: 'Order cancelled successfully'
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to cancel order'
      })
    }
  })

  // PATCH /api/orders/:orderNumber/status - Update order status (admin use)
  fastify.patch('/api/orders/:orderNumber/status', async (request, reply) => {
    try {
      const { orderNumber} = request.params
      const { status, estimatedTime, kitchenNotes } = request.body

      if (!status) {
        return reply.status(400).send({
          success: false,
          error: 'Status is required'
        })
      }

      // Valid statuses
      const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        })
      }

      // Update order
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status,
          estimatedTime: estimatedTime !== undefined ? estimatedTime : undefined,
          kitchenNotes: kitchenNotes !== undefined ? kitchenNotes : undefined,
          updatedAt: new Date()
        },
        include: {
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

      // Broadcast update to all connected Socket.io clients
      fastify.io.emit('order_updated', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,
        kitchenNotes: order.kitchenNotes,
        updatedAt: order.updatedAt
      })

      fastify.log.info(`Order ${orderNumber} status updated to ${status}`)

      return {
        success: true,
        data: { order }
      }
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        })
      }

      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to update order status'
      })
    }
  })

  // Setup WebSocket handlers
  fastify.ready(err => {
    if (err) throw err

    fastify.io.on('connection', (socket) => {
      fastify.log.info(`WebSocket client connected: ${socket.id}`)

      socket.on('disconnect', () => {
        fastify.log.info(`WebSocket client disconnected: ${socket.id}`)
      })

      socket.on('get_order_status', async (orderNumber) => {
        try {
          const order = await prisma.order.findUnique({
            where: { orderNumber },
            select: {
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
          fastify.log.error(error)
          socket.emit('error', { message: 'Failed to fetch order status' })
        }
      })
    })

    console.log('✅ WebSocket server initialized')
  })

  return fastify
}

// Start server
async function start() {
  try {
    await initDB()

    const fastify = buildApp()
    const PORT = process.env.PORT || 3001
    const HOST = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port: PORT, host: HOST })

    console.log('')
    console.log('🚀 Garbaking POS Backend (Fastify + JavaScript)')
    console.log(`📡 Server: http://localhost:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🏪 Store ID: ${process.env.STORE_ID || 'store_001'}`)
    console.log(`💾 Database: ${process.env.DATABASE_URL}`)
    console.log(`📡 Health: http://localhost:${PORT}/health`)
    console.log('')
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🔄 SIGTERM received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

// Start if run directly
if (require.main === module) {
  start()
}

module.exports = { buildApp, start }
