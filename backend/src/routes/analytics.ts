/**
 * Analytics routes for sales reporting and business insights
 * Provides endpoints for various reports and metrics with role-based access control
 */

import { Router, Request, Response } from 'express'
import { getDB } from '../database/init'
import { validatePagination } from '../middleware/validation'
import { asyncHandler } from '../middleware/errorHandler'
import {
  authenticateToken,
  requirePermission,
  requireMinimumRole,
  requireRole,
  ROLES
} from '../middleware/authMiddleware'

const router = Router()

/**
 * GET /api/analytics/dashboard
 * Get dashboard summary with key metrics
 * Requires: analytics:view_basic permission
 */
router.get('/dashboard',
  authenticateToken,
  requirePermission('analytics:view_basic'),
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Today's metrics
  const todayStats = await db.order.aggregate({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: today,
        lt: tomorrow
      },
      status: { not: 'CANCELLED' }
    },
    _count: true,
    _sum: {
      total: true,
      tax: true
    },
    _avg: {
      total: true
    }
  })

  // Yesterday for comparison
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dayBeforeYesterday = new Date(yesterday)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1)

  const yesterdayStats = await db.order.aggregate({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: yesterday,
        lt: today
      },
      status: { not: 'CANCELLED' }
    },
    _count: true,
    _sum: {
      total: true
    }
  })

  // Current week
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weekStats = await db.order.aggregate({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: weekStart
      },
      status: { not: 'CANCELLED' }
    },
    _count: true,
    _sum: {
      total: true
    }
  })

  // Current month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const monthStats = await db.order.aggregate({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: monthStart
      },
      status: { not: 'CANCELLED' }
    },
    _count: true,
    _sum: {
      total: true
    }
  })

  // Order status breakdown
  const statusBreakdown = await db.order.groupBy({
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
      today: {
        orders: todayStats._count,
        revenue: todayStats._sum.total || 0,
        tax: todayStats._sum.tax || 0,
        averageOrder: todayStats._avg.total || 0,
        comparison: {
          ordersChange: todayStats._count - (yesterdayStats._count || 0),
          revenueChange: (todayStats._sum.total || 0) - (yesterdayStats._sum.total || 0)
        }
      },
      week: {
        orders: weekStats._count,
        revenue: weekStats._sum.total || 0
      },
      month: {
        orders: monthStats._count,
        revenue: monthStats._sum.total || 0
      },
      statusBreakdown: statusBreakdown.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>)
    }
  })
}))

/**
 * GET /api/analytics/sales
 * Get sales analytics with date range filtering
 */
router.get('/sales', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const {
    startDate,
    endDate,
    groupBy = 'day',
    orderType
  } = req.query

  let dateFilter: any = {}

  if (startDate && endDate) {
    dateFilter = {
      gte: new Date(String(startDate)),
      lte: new Date(String(endDate))
    }
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    dateFilter = {
      gte: thirtyDaysAgo
    }
  }

  const where: any = {
    storeId: req.user!.storeId,
    createdAt: dateFilter,
    status: { not: 'CANCELLED' }
  }

  if (orderType) {
    where.orderType = String(orderType)
  }

  // Get sales data grouped by specified period
  let groupByQuery: string
  switch (groupBy) {
    case 'hour':
      groupByQuery = `DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')`
      break
    case 'week':
      groupByQuery = `DATE_FORMAT(created_at, '%Y-%u')`
      break
    case 'month':
      groupByQuery = `DATE_FORMAT(created_at, '%Y-%m')`
      break
    default:
      groupByQuery = `DATE(created_at)`
  }

  const salesData = await db.$queryRaw`
    SELECT
      ${groupByQuery} as period,
      COUNT(*) as order_count,
      SUM(total) as total_revenue,
      SUM(tax) as total_tax,
      AVG(total) as average_order,
      SUM(CASE WHEN payment_method = 'CASH' THEN total ELSE 0 END) as cash_revenue,
      SUM(CASE WHEN payment_method = 'CARD' THEN total ELSE 0 END) as card_revenue
    FROM orders
    WHERE store_id = ${req.user!.storeId}
      AND created_at >= ${dateFilter.gte}
      ${dateFilter.lte ? `AND created_at <= ${dateFilter.lte}` : ''}
      AND status != 'CANCELLED'
      ${orderType ? `AND order_type = '${orderType}'` : ''}
    GROUP BY ${groupByQuery}
    ORDER BY period DESC
  `

  res.json({
    success: true,
    data: {
      period: {
        start: dateFilter.gte,
        end: dateFilter.lte || new Date(),
        groupBy: String(groupBy)
      },
      salesData
    }
  })
}))

/**
 * GET /api/analytics/menu-performance
 * Get menu item performance analytics
 */
router.get('/menu-performance', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 30 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  const menuPerformance = await db.$queryRaw`
    SELECT
      mi.id,
      mi.sku,
      mi.name,
      mi.price,
      c.name as category_name,
      COUNT(oi.id) as times_ordered,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.total_price) as total_revenue,
      AVG(oi.quantity) as avg_quantity_per_order
    FROM menu_items mi
    LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN categories c ON mi.category_id = c.id
    WHERE o.store_id = ${req.user!.storeId}
      AND o.created_at >= ${startDate}
      AND o.status != 'CANCELLED'
    GROUP BY mi.id, mi.sku, mi.name, mi.price, c.name
    ORDER BY total_revenue DESC
  `

  res.json({
    success: true,
    data: {
      period: `${daysBack} days`,
      menuItems: menuPerformance
    }
  })
}))

/**
 * GET /api/analytics/peak-hours
 * Get peak hours analysis
 */
router.get('/peak-hours', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 7 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  const peakHours = await db.$queryRaw`
    SELECT
      HOUR(created_at) as hour,
      COUNT(*) as order_count,
      SUM(total) as total_revenue,
      AVG(total) as average_order
    FROM orders
    WHERE store_id = ${req.user!.storeId}
      AND created_at >= ${startDate}
      AND status != 'CANCELLED'
    GROUP BY HOUR(created_at)
    ORDER BY hour
  `

  const peakDays = await db.$queryRaw`
    SELECT
      DAYNAME(created_at) as day_name,
      DAYOFWEEK(created_at) as day_number,
      COUNT(*) as order_count,
      SUM(total) as total_revenue,
      AVG(total) as average_order
    FROM orders
    WHERE store_id = ${req.user!.storeId}
      AND created_at >= ${startDate}
      AND status != 'CANCELLED'
    GROUP BY DAYOFWEEK(created_at), DAYNAME(created_at)
    ORDER BY day_number
  `

  res.json({
    success: true,
    data: {
      period: `${daysBack} days`,
      peakHours,
      peakDays
    }
  })
}))

/**
 * GET /api/analytics/payment-methods
 * Get payment method analytics
 */
router.get('/payment-methods', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 30 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  const paymentMethods = await db.payment.groupBy({
    by: ['method'],
    where: {
      order: {
        storeId: req.user!.storeId
      },
      createdAt: {
        gte: startDate
      },
      status: 'COMPLETED'
    },
    _count: true,
    _sum: {
      amount: true
    }
  })

  const paymentData = paymentMethods.map((method: any) => ({
    method: method.method,
    count: method._count,
    revenue: method._sum.amount || 0,
    percentage: 0 // Will be calculated below
  }))

  const totalRevenue = paymentData.reduce((sum: number, item: any) => sum + item.revenue, 0)
  paymentData.forEach((item: any) => {
    item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
  })

  res.json({
    success: true,
    data: {
      period: `${daysBack} days`,
      paymentMethods: paymentData,
      totalRevenue
    }
  })
}))

/**
 * GET /api/analytics/customer-insights
 * Get customer behavior insights
 */
router.get('/customer-insights', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 30 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Customer frequency (returning customers)
  const customerFrequency = await db.$queryRaw`
    SELECT
      customer_phone,
      customer_name,
      COUNT(*) as visit_count,
      SUM(total) as total_spent,
      AVG(total) as average_order,
      MIN(created_at) as first_visit,
      MAX(created_at) as last_visit
    FROM orders
    WHERE store_id = ${req.user!.storeId}
      AND created_at >= ${startDate}
      AND customer_phone IS NOT NULL
      AND customer_phone != ''
      AND status != 'CANCELLED'
    GROUP BY customer_phone, customer_name
    HAVING visit_count > 1
    ORDER BY total_spent DESC
    LIMIT 50
  `

  // Order type distribution
  const orderTypes = await db.order.groupBy({
    by: ['orderType'],
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: startDate
      },
      status: { not: 'CANCELLED' }
    },
    _count: true,
    _sum: {
      total: true
    }
  })

  res.json({
    success: true,
    data: {
      period: `${daysBack} days`,
      returningCustomers: customerFrequency,
      orderTypeDistribution: orderTypes.map((type: any) => ({
        type: type.orderType,
        count: type._count,
        revenue: type._sum.total || 0
      }))
    }
  })
}))

/**
 * GET /api/analytics/export
 * Export analytics data as CSV
 */
router.get('/export',
  requireRole(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { startDate, endDate, format = 'csv' } = req.query

    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      }
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      dateFilter = { gte: thirtyDaysAgo }
    }

    const orders = await db.order.findMany({
      where: {
        storeId: req.user!.storeId,
        createdAt: dateFilter,
        status: { not: 'CANCELLED' }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Order Number',
        'Date',
        'Customer Name',
        'Order Type',
        'Status',
        'Subtotal',
        'Tax',
        'Total',
        'Payment Method',
        'Payment Status'
      ]

      const csvRows = orders.map((order: any) => [
        order.orderNumber,
        order.createdAt.toISOString(),
        order.customerName || '',
        order.orderType,
        order.status,
        order.subtotal,
        order.tax,
        order.total,
        order.paymentMethod || '',
        order.paymentStatus
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any[]) => row.join(','))
      ].join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"')
      res.send(csvContent)
    } else {
      // Return JSON
      res.json({
        success: true,
        data: { orders }
      })
    }
  })
)

export default router