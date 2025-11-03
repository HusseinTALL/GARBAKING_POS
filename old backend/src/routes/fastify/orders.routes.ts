/**
 * Order Routes (Fastify Plugin)
 * Customer-focused order endpoints for creating and tracking orders
 */

import { FastifyPluginAsync } from 'fastify'
import { v4 as uuidv4 } from 'uuid'

// JSON Schemas
const createOrderSchema = {
  body: {
    type: 'object',
    required: ['items', 'orderType'],
    properties: {
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['menuItemId', 'quantity', 'unitPrice'],
          properties: {
            menuItemId: { type: 'string' },
            quantity: { type: 'number', minimum: 1 },
            unitPrice: { type: 'number', minimum: 0 },
            notes: { type: 'string' }
          }
        }
      },
      orderType: { type: 'string', enum: ['DINE_IN', 'TAKEOUT', 'DELIVERY'] },
      customerName: { type: 'string' },
      customerPhone: { type: 'string' },
      customerEmail: { type: 'string' },
      tableNumber: { type: 'string' },
      notes: { type: 'string' },
      specialRequests: { type: 'string' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            order: { type: 'object' },
            orderNumber: { type: 'string' }
          }
        },
        message: { type: 'string' }
      }
    }
  }
}

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/orders
   * Create a new order (customer app)
   */
  fastify.post('/', {
    schema: {
      description: 'Create a new order',
      tags: ['orders'],
      ...createOrderSchema
    }
  }, async (request, reply) => {
    const {
      items,
      orderType,
      customerName,
      customerPhone,
      customerEmail,
      tableNumber,
      notes,
      specialRequests
    } = request.body as any

    // Calculate order totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity)
    }, 0)

    const taxRate = 0.08 // 8% tax
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create default user ID (for customer orders without auth)
    const defaultUserId = process.env.DEFAULT_USER_ID || 'customer-app'

    // Create order
    const order = await fastify.prisma.order.create({
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
        userId: defaultUserId,
        source: 'CUSTOMER_APP',
        orderItems: {
          create: items.map((item: any) => ({
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

    // Emit WebSocket event for real-time updates
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
      data: {
        order,
        orderNumber: order.orderNumber
      },
      message: 'Order created successfully'
    })
  })

  /**
   * GET /api/orders/:orderNumber
   * Get order by order number (for customer tracking)
   */
  fastify.get('/:orderNumber', {
    schema: {
      description: 'Get order by order number',
      tags: ['orders'],
      params: {
        type: 'object',
        required: ['orderNumber'],
        properties: {
          orderNumber: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                order: { type: 'object' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { orderNumber } = request.params as { orderNumber: string }

    const order = await fastify.prisma.order.findUnique({
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
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      })
    }

    return {
      success: true,
      data: { order }
    }
  })

  /**
   * GET /api/orders/:orderNumber/status
   * Get order status (lightweight endpoint for tracking)
   */
  fastify.get('/:orderNumber/status', {
    schema: {
      description: 'Get order status',
      tags: ['orders'],
      params: {
        type: 'object',
        required: ['orderNumber'],
        properties: {
          orderNumber: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                orderNumber: { type: 'string' },
                status: { type: 'string' },
                estimatedTime: { type: 'number', nullable: true },
                createdAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { orderNumber } = request.params as { orderNumber: string }

    const order = await fastify.prisma.order.findUnique({
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
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      })
    }

    return {
      success: true,
      data: order
    }
  })

  /**
   * GET /api/orders/customer/:phone
   * Get customer's order history by phone number
   */
  fastify.get('/customer/:phone', {
    schema: {
      description: 'Get customer order history',
      tags: ['orders'],
      params: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request, reply) => {
    const { phone } = request.params as { phone: string }
    const { limit = 10 } = request.query as any

    const orders = await fastify.prisma.order.findMany({
      where: {
        customerPhone: phone
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(limit),
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        orderType: true,
        createdAt: true,
        completedAt: true,
        orderItems: {
          select: {
            quantity: true,
            menuItem: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    return {
      success: true,
      data: {
        orders,
        count: orders.length
      }
    }
  })

  fastify.log.info('✅ Order routes registered')
}

export default orderRoutes
