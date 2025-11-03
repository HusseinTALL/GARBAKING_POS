/**
 * Test-specific Express application setup
 * Creates isolated app instance for testing without starting a server
 */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import authRoutes from '../routes/auth'
import ordersRoutes from '../routes/orders'
import paymentRoutes from '../routes/payment'
import analyticsRoutes from '../routes/analytics'
import { authenticateToken } from '../middleware/authMiddleware'
import { errorHandler } from '../middleware/errorHandler'

export const createTestApp = () => {
  const app = express()

  // Basic middleware
  app.use(cors())
  app.use(express.json())
  app.use(morgan('combined'))

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Health check endpoints
  const healthCheck = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    })
  }

  app.get('/health', healthCheck)
  app.get('/api/health', healthCheck)

  // Routes
  app.use('/api/auth', authLimiter, authRoutes)
  app.use('/api/orders', authenticateToken, ordersRoutes)
  app.use('/api/payment', authenticateToken, paymentRoutes)
  app.use('/api/analytics', authenticateToken, analyticsRoutes)

  // Error handling
  app.use(errorHandler)

  return app
}