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
router.get('/sales', authenticateToken, validatePagination, asyncHandler(async (req: Request, res: Response) => {
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

  // Ensure user is authenticated and has storeId
  if (!req.user || !req.user.storeId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    })
  }

  const where: any = {
    storeId: req.user.storeId,
    createdAt: dateFilter,
    status: { not: 'CANCELLED' }
  }

  if (orderType) {
    where.orderType = String(orderType)
  }

  // Get sales data grouped by specified period (SQLite syntax)
  let groupByQuery: string
  switch (groupBy) {
    case 'hour':
      groupByQuery = `strftime('%Y-%m-%d %H:00:00', createdAt)`
      break
    case 'week':
      groupByQuery = `strftime('%Y-%W', createdAt)`
      break
    case 'month':
      groupByQuery = `strftime('%Y-%m', createdAt)`
      break
    default:
      groupByQuery = `date(createdAt)`
  }

  // Use Prisma's findMany with aggregation instead of raw SQL for better compatibility
  const orders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      createdAt: dateFilter,
      status: { not: 'CANCELLED' },
      ...(orderType && { orderType: String(orderType) })
    },
    select: {
      createdAt: true,
      total: true,
      tax: true
    }
  })

  // Group and aggregate in JavaScript for SQLite compatibility
  const salesData = orders.reduce((acc: any[], order) => {
    let period: string
    const date = new Date(order.createdAt)

    switch (groupBy) {
      case 'hour':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00:00`
        break
      case 'week':
        const weekNumber = Math.ceil(date.getDate() / 7)
        period = `${date.getFullYear()}-${String(weekNumber).padStart(2, '0')}`
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const existing = acc.find(item => item.period === period)
    if (existing) {
      existing.order_count++
      existing.total_revenue += order.total
      existing.total_tax += order.tax
    } else {
      acc.push({
        period,
        order_count: 1,
        total_revenue: order.total,
        total_tax: order.tax,
        average_order: order.total
      })
    }
    return acc
  }, [])

  // Calculate average orders
  salesData.forEach(item => {
    item.average_order = item.total_revenue / item.order_count
  })

  // Sort by period descending
  salesData.sort((a, b) => b.period.localeCompare(a.period))

  return res.json({
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
router.get('/menu-performance', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 30 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Get order items with menu items and orders using Prisma relations
  const orderItems = await db.orderItem.findMany({
    where: {
      order: {
        storeId: req.user!.storeId,
        createdAt: {
          gte: startDate
        },
        status: { not: 'CANCELLED' }
      }
    },
    include: {
      menuItem: {
        include: {
          category: true
        }
      }
    }
  })

  // Aggregate performance data in JavaScript
  const performanceMap = new Map()

  orderItems.forEach(item => {
    const key = item.menuItemId
    if (!performanceMap.has(key)) {
      performanceMap.set(key, {
        id: item.menuItem.id,
        sku: item.menuItem.sku,
        name: item.menuItem.name,
        price: item.menuItem.price,
        category_name: item.menuItem.category?.name || 'Uncategorized',
        times_ordered: 0,
        total_quantity: 0,
        total_revenue: 0,
        avg_quantity_per_order: 0
      })
    }

    const performance = performanceMap.get(key)
    performance.times_ordered++
    performance.total_quantity += item.quantity
    performance.total_revenue += item.totalPrice
  })

  // Calculate averages and convert to array
  const menuPerformance = Array.from(performanceMap.values()).map(item => ({
    ...item,
    avg_quantity_per_order: item.total_quantity / item.times_ordered
  })).sort((a, b) => b.total_revenue - a.total_revenue)

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
router.get('/peak-hours', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 7 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Get orders and aggregate by hour and day using Prisma
  const orders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: startDate
      },
      status: { not: 'CANCELLED' }
    },
    select: {
      createdAt: true,
      total: true
    }
  })

  // Aggregate by hour
  const hourlyData = new Map()
  const dailyData = new Map()

  orders.forEach(order => {
    const date = new Date(order.createdAt)
    const hour = date.getHours()
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[dayOfWeek]

    // Hour aggregation
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, {
        hour,
        order_count: 0,
        total_revenue: 0,
        average_order: 0
      })
    }
    const hourStats = hourlyData.get(hour)
    hourStats.order_count++
    hourStats.total_revenue += order.total

    // Day aggregation
    if (!dailyData.has(dayOfWeek)) {
      dailyData.set(dayOfWeek, {
        day_name: dayName,
        day_number: dayOfWeek + 1, // MySQL DAYOFWEEK returns 1-7
        order_count: 0,
        total_revenue: 0,
        average_order: 0
      })
    }
    const dayStats = dailyData.get(dayOfWeek)
    dayStats.order_count++
    dayStats.total_revenue += order.total
  })

  // Calculate averages and convert to arrays
  const peakHours = Array.from(hourlyData.values()).map(item => ({
    ...item,
    average_order: item.total_revenue / item.order_count
  })).sort((a, b) => a.hour - b.hour)

  const peakDays = Array.from(dailyData.values()).map(item => ({
    ...item,
    average_order: item.total_revenue / item.order_count
  })).sort((a, b) => a.day_number - b.day_number)

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
router.get('/payment-methods', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
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
router.get('/customer-insights', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 30 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Customer frequency (returning customers) - using Prisma for SQLite compatibility
  const orders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: startDate
      },
      AND: [
        { customerPhone: { not: null } },
        { customerPhone: { not: '' } }
      ],
      status: { not: 'CANCELLED' }
    },
    select: {
      customerPhone: true,
      customerName: true,
      total: true,
      createdAt: true
    }
  })

  // Group by customer phone and aggregate in JavaScript
  const customerMap = new Map()
  orders.forEach(order => {
    const key = `${order.customerPhone}-${order.customerName || ''}`
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customer_phone: order.customerPhone,
        customer_name: order.customerName,
        visit_count: 0,
        total_spent: 0,
        first_visit: order.createdAt,
        last_visit: order.createdAt,
        orders: []
      })
    }

    const customer = customerMap.get(key)
    customer.visit_count++
    customer.total_spent += order.total
    customer.orders.push(order.total)
    if (order.createdAt < customer.first_visit) customer.first_visit = order.createdAt
    if (order.createdAt > customer.last_visit) customer.last_visit = order.createdAt
  })

  // Filter customers with more than 1 visit and calculate averages
  const customerFrequency = Array.from(customerMap.values())
    .filter(customer => customer.visit_count > 1)
    .map(customer => ({
      customer_phone: customer.customer_phone,
      customer_name: customer.customer_name,
      visit_count: customer.visit_count,
      total_spent: customer.total_spent,
      average_order: customer.total_spent / customer.visit_count,
      first_visit: customer.first_visit,
      last_visit: customer.last_visit
    }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 50)

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
        'cash', // Default payment method since Order model doesn't have paymentMethod field
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