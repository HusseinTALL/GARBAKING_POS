/**
 * Main entry point for the Garbaking POS backend server
 * Initializes Express app, middleware, routes, and WebSocket server
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes and middleware
import authRoutes from './routes/auth'
import orderRoutes from './routes/orders'
import menuRoutes from './routes/menu'
import analyticsRoutes from './routes/analytics'
import syncRoutes from './routes/sync'
import userRoutes from './routes/users'
import loyaltyRoutes from './routes/loyalty'
import paymentRoutes from './routes/payment'
import tablesRoutes from './routes/tables'
import receiptsRoutes from './routes/receipts'
import { errorHandler } from './middleware/errorHandler'
import { authenticateToken } from './middleware/authMiddleware'
import { setupWebSocket } from './services/websocket'
import { startSyncWorker } from './services/syncWorker'
import { initializeDatabase } from './database/init'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://admin.garbaking.com', 'https://kds.garbaking.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 8000

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased to 1000 requests
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for auth routes in development
    if (process.env.NODE_ENV !== 'production' && req.path.startsWith('/api/auth')) {
      return true
    }
    return false
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(limiter)

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

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/sync', syncRoutes)
app.use('/api/users', userRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/tables', tablesRoutes)
app.use('/api/floor-plans', tablesRoutes) // Floor plans use the same router
app.use('/api/receipts', receiptsRoutes)

// Local endpoints (for restaurant devices)
app.use('/local', orderRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    console.log('✅ Database initialized')

    // Setup WebSocket
    setupWebSocket(io)
    console.log('✅ WebSocket server initialized')

    // Start sync worker if in offline mode
    if (process.env.OFFLINE_MODE === 'true') {
      startSyncWorker()
      console.log('✅ Sync worker started')
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Garbaking POS Backend running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV}`)
      console.log(`🏪 Store ID: ${process.env.STORE_ID}`)
      console.log(`💾 Database: ${process.env.DATABASE_URL}`)
      console.log(`📡 Health check: http://localhost:${PORT}/health`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Graceful shutdown initiated...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()

export { app, io }