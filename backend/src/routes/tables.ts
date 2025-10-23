/**
 * Tables management routes for restaurant table tracking
 * Handles table status, assignments, and floor plan management
 */

import { Router, Request, Response } from 'express'
import { authenticateToken, requireRole } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'
import { getDB } from '../database/init'

const router = Router()

/**
 * GET /api/tables
 * Get all tables for the store
 */
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.storeId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // For now, return mock table data - would be stored in database in production
  const tables = Array.from({ length: 20 }, (_, i) => ({
    id: `table_${i + 1}`,
    number: i + 1,
    capacity: i < 10 ? 4 : i < 15 ? 6 : 8,
    status: Math.random() > 0.7 ? 'occupied' : 'available',
    currentOrder: Math.random() > 0.5 ? `order_${Math.floor(Math.random() * 1000)}` : null,
    section: i < 10 ? 'main' : i < 15 ? 'patio' : 'bar',
    position: {
      x: (i % 5) * 100 + 50,
      y: Math.floor(i / 5) * 100 + 50
    },
    assignedServer: Math.random() > 0.5 ? req.user?.name : null,
    lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }))

  return res.json({
    success: true,
    data: {
      tables,
      summary: {
        total: tables.length,
        available: tables.filter(t => t.status === 'available').length,
        occupied: tables.filter(t => t.status === 'occupied').length
      }
    }
  })
}))

/**
 * PUT /api/tables/:tableId/status
 * Update table status
 */
router.put('/:tableId/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { tableId } = req.params
  const { status, orderId } = req.body

  if (!['available', 'occupied', 'reserved', 'cleaning'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid table status'
    })
  }

  // In production, this would update the database
  return res.json({
    success: true,
    data: {
      tableId,
      status,
      orderId,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.userId
    },
    message: `Table ${tableId} status updated to ${status}`
  })
}))

/**
 * GET /api/floor-plans/active
 * Get active floor plan
 */
router.get('/active', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.storeId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Mock floor plan data
  const floorPlan = {
    id: 'floor_001',
    name: 'Main Floor',
    isActive: true,
    layout: {
      width: 800,
      height: 600,
      sections: [
        {
          id: 'main',
          name: 'Main Dining',
          color: '#3B82F6',
          area: { x: 0, y: 0, width: 500, height: 400 }
        },
        {
          id: 'patio',
          name: 'Patio',
          color: '#10B981',
          area: { x: 500, y: 0, width: 300, height: 300 }
        },
        {
          id: 'bar',
          name: 'Bar Area',
          color: '#F59E0B',
          area: { x: 0, y: 400, width: 800, height: 200 }
        }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return res.json({
    success: true,
    data: floorPlan
  })
}))

export default router