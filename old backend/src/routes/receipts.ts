/**
 * Receipts routes for receipt generation and printing management
 * Handles receipt templates, printing, and receipt history
 */

import { Router, Request, Response } from 'express'
import { authenticateToken, requireRole } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'
import { getDB } from '../database/init'

const router = Router()

/**
 * GET /api/receipts/templates
 * Get available receipt templates
 */
router.get('/templates', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const templates = [
    {
      id: 'standard',
      name: 'Standard Receipt',
      type: 'RECEIPT',
      isDefault: true,
      format: 'thermal',
      width: 80, // mm
      settings: {
        showLogo: true,
        showTax: true,
        showDiscounts: true,
        showFooter: true,
        fontSize: 'normal'
      }
    },
    {
      id: 'kitchen',
      name: 'Kitchen Order',
      type: 'KITCHEN',
      isDefault: false,
      format: 'thermal',
      width: 80,
      settings: {
        showLogo: false,
        showPrices: false,
        showSpecialInstructions: true,
        fontSize: 'large'
      }
    }
  ]

  res.json({
    success: true,
    data: {
      templates,
      defaultTemplate: 'standard'
    }
  })
}))

/**
 * GET /api/receipts/printer/status
 * Get printer status
 */
router.get('/printer/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // Mock printer status - would integrate with actual printer in production
  const printerStatus = {
    isOnline: true,
    isReady: true,
    paperLevel: 'good', // good, low, empty
    lastPrint: new Date().toISOString(),
    model: 'EPSON TM-T88VI',
    connectionType: 'USB',
    errors: []
  }

  res.json({
    success: true,
    data: printerStatus
  })
}))

/**
 * POST /api/receipts/print
 * Print a receipt
 */
router.post('/print', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { orderId, templateId = 'standard', copies = 1 } = req.body

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    })
  }

  const db = getDB()

  // Get order details
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      },
      user: true
    }
  })

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    })
  }

  // Generate receipt content
  const receiptContent = generateReceiptContent(order, templateId)

  // In production, this would send to actual printer
  // For now, just return success with receipt data
  return res.json({
    success: true,
    data: {
      orderId,
      receiptId: `receipt_${Date.now()}`,
      templateId,
      copies,
      printedAt: new Date().toISOString(),
      printedBy: req.user?.userId,
      content: receiptContent
    },
    message: 'Receipt printed successfully'
  })
}))

/**
 * GET /api/receipts/order/:orderId
 * Get receipt for a specific order
 */
router.get('/order/:orderId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params
  const { templateId = 'standard' } = req.query

  const db = getDB()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      },
      user: true
    }
  })

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    })
  }

  const receiptContent = generateReceiptContent(order, templateId as string)

  return res.json({
    success: true,
    data: {
      orderId,
      templateId,
      content: receiptContent,
      generatedAt: new Date().toISOString()
    }
  })
}))

/**
 * Helper function to generate receipt content
 */
function generateReceiptContent(order: any, templateId: string) {
  const storeName = "GARBAKING"
  const storeAddress = "123 Restaurant Street\nCity, State 12345\nPhone: (555) 123-4567"

  let content = []

  // Header
  content.push("================================")
  content.push(`         ${storeName}`)
  content.push("================================")
  content.push(storeAddress)
  content.push("================================")
  content.push(`Order #: ${order.orderNumber}`)
  content.push(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
  content.push(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`)
  content.push(`Server: ${order.user?.name || 'N/A'}`)
  content.push(`Customer: ${order.customerName || 'Walk-in'}`)
  content.push("================================")

  // Items
  content.push("ITEMS:")
  content.push("--------------------------------")

  order.orderItems.forEach((item: any) => {
    const name = item.menuItem.name
    const qty = item.quantity
    const price = item.totalPrice.toFixed(2)

    content.push(`${qty}x ${name}`)
    content.push(`    $${(item.unitPrice).toFixed(2)} each    $${price}`)

    if (item.notes) {
      content.push(`    Note: ${item.notes}`)
    }
  })

  content.push("--------------------------------")

  // Totals
  content.push(`Subtotal:           $${order.subtotal.toFixed(2)}`)
  content.push(`Tax:                $${order.tax.toFixed(2)}`)
  content.push(`TOTAL:              $${order.total.toFixed(2)}`)
  content.push("================================")

  // Footer
  content.push("Thank you for your business!")
  content.push("Please come again!")
  content.push("================================")

  return content.join('\n')
}

export default router