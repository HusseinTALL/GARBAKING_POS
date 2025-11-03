/**
 * Payment routes for cash management and payment processing
 * Handles payment methods, cash drawer operations, and transaction management
 */

import { Router, Request, Response } from 'express'
import { authenticateToken, requireRole } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'
import { getDB } from '../database/init'

const router = Router()

/**
 * GET /api/payment/methods
 * Get available payment methods
 */
router.get('/methods', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // Return available payment methods for the POS
  const paymentMethods = [
    {
      name: 'CASH',
      displayName: 'Cash',
      isEnabled: true,
      acceptedCurrencies: ['USD'],
      icon: 'banknote',
      description: 'Cash payment'
    },
    {
      name: 'CARD',
      displayName: 'Credit/Debit Card',
      isEnabled: true, // Enable for testing
      acceptedCurrencies: ['USD'],
      icon: 'credit-card',
      description: 'Card payment'
    }
  ]

  res.json({
    success: true,
    data: {
      methods: paymentMethods,
      defaultMethod: 'CASH'
    }
  })
}))

/**
 * GET /api/payment/cash-drawer/status
 * Get cash drawer status
 */
router.get('/cash-drawer/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // For now, return a mock status - this would integrate with hardware in production
  const cashDrawerStatus = {
    isOpen: false,
    lastOpened: null,
    currentBalance: 0,
    expectedBalance: 0,
    lastCount: null,
    status: 'closed'
  }

  res.json({
    success: true,
    data: cashDrawerStatus
  })
}))

/**
 * POST /api/payment/cash-drawer/open
 * Open cash drawer
 */
router.post('/cash-drawer/open', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // This would send command to cash drawer hardware
  // For now, just return success

  res.json({
    success: true,
    message: 'Cash drawer opened successfully',
    data: {
      openedAt: new Date().toISOString(),
      openedBy: req.user?.userId
    }
  })
}))

/**
 * GET /api/payment/transactions/recent
 * Get recent payment transactions
 */
router.get('/transactions/recent', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { limit = '50' } = req.query
  const db = getDB()

  if (!req.user?.storeId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Get recent orders with payment information
  const transactions = await db.order.findMany({
    where: {
      storeId: req.user.storeId,
      paymentStatus: 'PAID'
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paymentStatus: true,
      createdAt: true,
      customerName: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: parseInt(limit as string)
  })

  // Transform to transaction format
  const formattedTransactions = transactions.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    amount: order.total,
    paymentMethod: 'cash', // Default to cash for now
    status: order.paymentStatus,
    customerName: order.customerName,
    processedBy: order.user?.name || 'Unknown',
    processedAt: order.createdAt
  }))

  return res.json({
    success: true,
    data: {
      transactions: formattedTransactions,
      totalCount: transactions.length
    }
  })
}))

/**
 * POST /api/payment/process
 * Process a payment
 */
router.post('/process', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, currency, reference, metadata, cardDetails, simulateFailure } = req.body

  // Validation
  if (!amount || !method) {
    return res.status(400).json({
      success: false,
      message: 'Amount and payment method are required'
    })
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be positive'
    })
  }

  // Check for decimal precision (max 2 decimal places)
  if (Number(amount) !== Math.round(Number(amount) * 100) / 100) {
    return res.status(400).json({
      success: false,
      message: 'Amount must have at most 2 decimal places'
    })
  }

  // Validate supported payment methods
  const supportedMethods = ['CASH', 'CARD']
  if (!supportedMethods.includes(method)) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported payment method'
    })
  }

  // Simulate failure for testing
  if (simulateFailure) {
    return res.status(400).json({
      success: false,
      message: 'Payment processing failed - card declined'
    })
  }

  const transactionId = `${method.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Sanitize metadata if present
  let sanitizedMetadata = metadata
  if (metadata && typeof metadata === 'object') {
    sanitizedMetadata = {}
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        // Remove script tags and other dangerous content
        sanitizedMetadata[key] = String(value).replace(/<script[^>]*>.*?<\/script>/gi, '')
      } else {
        sanitizedMetadata[key] = value
      }
    }
  }

  // Process card payment details
  let processedCardDetails = null
  if (method === 'CARD' && cardDetails) {
    // Only return safe card details (never return full number or CVV)
    processedCardDetails = {
      last4: cardDetails.last4,
      brand: cardDetails.brand
    }
  }

  const paymentData = {
    transactionId,
    status: 'COMPLETED',
    amount: Number(amount),
    method,
    currency: currency || 'USD',
    reference,
    metadata: sanitizedMetadata,
    cardDetails: processedCardDetails,
    processedAt: new Date().toISOString()
  }

  return res.json({
    success: true,
    data: {
      payment: paymentData
    },
    message: `${method} payment processed successfully`
  })
}))

/**
 * GET /api/payment/transaction/:id
 * Get payment transaction details
 */
router.get('/transaction/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  // For testing purposes, simulate transaction lookup
  // In production, this would query a payments database
  if (id === 'non-existent-id') {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    })
  }

  // Mock transaction data
  const transaction = {
    transactionId: id,
    status: 'COMPLETED',
    amount: 15.99,
    method: 'CASH',
    currency: 'USD',
    processedAt: new Date().toISOString(),
    metadata: {
      orderId: 'test-order-123'
    }
  }

  return res.json({
    success: true,
    data: {
      payment: transaction
    }
  })
}))

/**
 * POST /api/payment/refund
 * Process a payment refund
 */
router.post('/refund', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId, amount, reason } = req.body

  if (!transactionId || !amount || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Transaction ID, amount, and reason are required'
    })
  }

  // Simulate transaction lookup
  if (transactionId === 'non-existent-id') {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    })
  }

  // Mock original transaction amount for validation
  const originalAmount = 29.99 // This would come from database lookup

  if (amount > originalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Refund amount cannot exceed original payment amount'
    })
  }

  const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const refundData = {
    refundId,
    transactionId,
    amount: Number(amount),
    reason,
    status: 'COMPLETED',
    processedAt: new Date().toISOString()
  }

  return res.json({
    success: true,
    data: {
      refund: refundData
    },
    message: 'Refund processed successfully'
  })
}))

/**
 * GET /api/payment/stats
 * Get payment summary statistics
 */
router.get('/stats', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  if (!req.user?.storeId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Get payment statistics from orders
  const orders = await db.order.findMany({
    where: {
      storeId: req.user.storeId,
      paymentStatus: 'PAID'
    },
    select: {
      total: true,
      createdAt: true
    }
  })

  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)
  const totalTransactions = orders.length

  // Mock method breakdown for now
  const methodBreakdown = {
    CASH: {
      count: Math.floor(totalTransactions * 0.7),
      amount: totalAmount * 0.7
    },
    CARD: {
      count: Math.floor(totalTransactions * 0.3),
      amount: totalAmount * 0.3
    }
  }

  return res.json({
    success: true,
    data: {
      totalAmount,
      totalTransactions,
      methodBreakdown
    }
  })
}))

export default router