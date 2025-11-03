/**
 * Sync routes for monitoring and controlling offline synchronization
 * Provides endpoints for sync status, manual triggers, and configuration
 */

import { Router, Request, Response } from 'express'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken, requireRole } from '../middleware/authMiddleware'
import { triggerManualSync, getSyncStatus } from '../services/syncWorker'
import { getDB } from '../database/init'

const router = Router()

/**
 * GET /api/sync/status
 * Get synchronization status information
 */
router.get('/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const status = await getSyncStatus()
  const db = getDB()

  // Get additional sync statistics
  const syncStats = await db.order.groupBy({
    by: ['syncStatus'],
    where: {
      storeId: req.user!.storeId
    },
    _count: true
  })

  const syncStatusCount = syncStats.reduce((acc: Record<string, number>, item: any) => {
    acc[item.syncStatus] = item._count
    return acc
  }, {} as Record<string, number>)

  // Get failed orders for troubleshooting
  const failedOrders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      syncStatus: 'FAILED'
    },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      total: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  res.json({
    success: true,
    data: {
      syncWorker: status,
      statistics: syncStatusCount,
      failedOrders,
      lastChecked: new Date().toISOString()
    }
  })
}))

/**
 * POST /api/sync/trigger
 * Manually trigger synchronization (Manager/Admin only)
 */
router.post('/trigger',
  requireRole(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await triggerManualSync()

      res.json({
        success: true,
        message: 'Sync triggered successfully',
        triggeredAt: new Date().toISOString(),
        triggeredBy: req.user!.name
      })

    } catch (error) {
      throw createError('Failed to trigger sync', 500)
    }
  })
)

/**
 * PUT /api/sync/retry-failed
 * Retry failed sync orders (Admin only)
 */
router.put('/retry-failed',
  requireRole(['ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()

    // Reset failed orders to pending
    const result = await db.order.updateMany({
      where: {
        storeId: req.user!.storeId,
        syncStatus: 'FAILED'
      },
      data: {
        syncStatus: 'PENDING'
      }
    })

    res.json({
      success: true,
      data: {
        ordersReset: result.count
      },
      message: `Reset ${result.count} failed orders for retry`
    })
  })
)

/**
 * GET /api/sync/orders/pending
 * Get list of pending sync orders
 */
router.get('/orders/pending', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  const pendingOrders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      syncStatus: 'PENDING'
    },
    select: {
      id: true,
      orderNumber: true,
      clientOrderId: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
      idempotencyKey: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  res.json({
    success: true,
    data: {
      orders: pendingOrders,
      count: pendingOrders.length
    }
  })
}))

/**
 * GET /api/sync/orders/failed
 * Get list of failed sync orders with error details
 */
router.get('/orders/failed', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  const failedOrders = await db.order.findMany({
    where: {
      storeId: req.user!.storeId,
      syncStatus: 'FAILED'
    },
    select: {
      id: true,
      orderNumber: true,
      clientOrderId: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      idempotencyKey: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  res.json({
    success: true,
    data: {
      orders: failedOrders,
      count: failedOrders.length
    }
  })
}))

/**
 * POST /api/sync/orders/:id/retry
 * Retry sync for specific order
 */
router.post('/orders/:id/retry',
  requireRole(['ADMIN', 'MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params

    const order = await db.order.findFirst({
      where: {
        id,
        storeId: req.user!.storeId,
        syncStatus: 'FAILED'
      }
    })

    if (!order) {
      throw createError('Failed order not found', 404)
    }

    // Reset to pending for retry
    await db.order.update({
      where: { id },
      data: {
        syncStatus: 'PENDING'
      }
    })

    res.json({
      success: true,
      message: `Order ${order.orderNumber} queued for retry`
    })
  })
)

/**
 * GET /api/sync/health
 * Get sync system health information
 */
router.get('/health', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`
    const dbHealthy = true

    // Check sync worker status
    const syncStatus = await getSyncStatus()

    // Check for old pending orders (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const oldPendingOrders = await db.order.count({
      where: {
        storeId: req.user!.storeId,
        syncStatus: 'PENDING',
        createdAt: {
          lt: oneHourAgo
        }
      }
    })

    // Determine overall health
    const isHealthy = dbHealthy && syncStatus.isRunning && oldPendingOrders < 10

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'connected' : 'disconnected',
        syncWorker: syncStatus.isRunning ? 'running' : 'stopped',
        pendingOrders: syncStatus.pendingOrders,
        oldPendingOrders,
        warnings: oldPendingOrders > 5 ? ['High number of old pending orders'] : [],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'error',
        error: 'Database connectivity check failed'
      }
    })
  }
}))

/**
 * GET /api/sync/statistics
 * Get detailed sync statistics
 */
router.get('/statistics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { days = 7 } = req.query

  const daysBack = parseInt(String(days))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Get sync statistics by day
  const dailyStats = await db.order.groupBy({
    by: ['syncStatus'],
    where: {
      storeId: req.user!.storeId,
      createdAt: {
        gte: startDate
      }
    },
    _count: true
  })

  // Get order creation vs sync timeline
  const timeline = await db.$queryRaw`
    SELECT
      DATE(created_at) as date,
      sync_status,
      COUNT(*) as count
    FROM orders
    WHERE store_id = ${req.user!.storeId}
      AND created_at >= ${startDate}
    GROUP BY DATE(created_at), sync_status
    ORDER BY date DESC
  `

  res.json({
    success: true,
    data: {
      period: `${daysBack} days`,
      summary: dailyStats.reduce((acc: Record<string, number>, item: any) => {
        acc[item.syncStatus] = item._count
        return acc
      }, {} as Record<string, number>),
      timeline,
      generatedAt: new Date().toISOString()
    }
  })
}))

export default router