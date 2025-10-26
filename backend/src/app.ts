/**
 * Fastify Application Setup
 * Main Fastify server configuration with plugins and routes
 */

import Fastify from 'fastify'
import { fastifyConfig, corsConfig, helmetConfig, rateLimitConfig, serverConfig } from './config/fastify.config'
import { initializeDatabase } from './database/init'
import { startSyncWorker } from './services/syncWorker'

// Import plugins
import errorHandlerPlugin from './plugins/error-handler.plugin'
import databasePlugin from './plugins/database.plugin'
import authPlugin from './plugins/auth.plugin'
import websocketPlugin from './plugins/websocket.plugin'

// Import route plugins
import authRoutes from './routes/fastify/auth.routes'
import menuRoutes from './routes/fastify/menu.routes'
import orderRoutes from './routes/fastify/orders.routes'
import uploadRoutes from './routes/fastify/upload.routes'

/**
 * Build Fastify application
 */
export async function buildApp() {
  const fastify = Fastify(fastifyConfig)

  // Register core plugins
  await fastify.register(import('@fastify/cors'), corsConfig)
  await fastify.register(import('@fastify/helmet'), helmetConfig)
  await fastify.register(import('@fastify/compress'), { global: true })
  await fastify.register(import('@fastify/rate-limit'), rateLimitConfig)
  await fastify.register(import('@fastify/formbody'))
  await fastify.register(import('@fastify/sensible'))

  // Register static file serving for uploads
  await fastify.register(import('@fastify/static'), {
    root: require('path').join(process.cwd(), 'public'),
    prefix: '/'
  })

  // Register multipart for file uploads
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 1
    }
  })

  // Register custom plugins
  await fastify.register(errorHandlerPlugin)
  await fastify.register(databasePlugin)
  await fastify.register(authPlugin)
  await fastify.register(websocketPlugin)

  // Add request/response logging hooks
  fastify.addHook('onRequest', async (request, reply) => {
    request.log.info({
      requestId: (request as any).id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }, 'Incoming request')
  })

  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.getResponseTime()

    request.log.info({
      requestId: (request as any).id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`
    }, 'Request completed')

    // Log slow requests as warnings
    if (responseTime > 5000) {
      request.log.warn({
        requestId: (request as any).id,
        duration: responseTime,
        method: request.method,
        url: request.url
      }, 'Slow request detected')
    }
  })

  // Health check endpoints with database verification
  fastify.get('/health', async (request, reply) => {
    let dbStatus = 'unknown'
    let dbError = null

    try {
      // Test database connection
      await fastify.prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (error: any) {
      dbStatus = 'disconnected'
      dbError = error.message
      fastify.log.error({ error }, 'Database health check failed')
    }

    const isHealthy = dbStatus === 'connected'

    return reply.code(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.environment,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        error: dbError
      },
      websocket: 'active'
    })
  })

  fastify.get('/api/health', async (request, reply) => {
    let dbStatus = 'unknown'

    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (error) {
      dbStatus = 'disconnected'
    }

    const isHealthy = dbStatus === 'connected'

    return reply.code(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.environment,
      version: process.env.npm_package_version || '1.0.0',
      database: dbStatus
    })
  })

  // Register route plugins for customer app
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(menuRoutes, { prefix: '/api/menu' })
  await fastify.register(orderRoutes, { prefix: '/api/orders' })
  await fastify.register(uploadRoutes, { prefix: '/api/upload' })

  // Also register menu under /local prefix for backward compatibility
  await fastify.register(menuRoutes, { prefix: '/local' })

  // TODO: Register other routes for admin/staff apps later
  // await fastify.register(userRoutes, { prefix: '/api/users' })
  // await fastify.register(analyticsRoutes, { prefix: '/api/analytics' })
  // etc.

  return fastify
}

/**
 * Start the Fastify server
 */
export async function startServer() {
  try {
    console.log('🚀 Starting Garbaking POS Backend...')
    console.log('📊 Environment:', serverConfig.environment)
    console.log('🏪 Store ID:', serverConfig.storeId)
    console.log('💾 Database:', process.env.DATABASE_URL || './dev.db')

    // Initialize database
    console.log('🔄 Initializing database...')
    try {
      await initializeDatabase()
      console.log('✅ Database initialized')
    } catch (dbError: any) {
      console.error('❌ Database initialization failed:', dbError.message)
      console.error('')
      console.error('🔧 Quick fix:')
      console.error('   cd backend')
      console.error('   npm run db:setup')
      console.error('')
      throw dbError
    }

    // Build app
    console.log('🔄 Building Fastify application...')
    const fastify = await buildApp()
    console.log('✅ Application built successfully')

    // Start sync worker if in offline mode
    if (process.env.OFFLINE_MODE === 'true') {
      startSyncWorker()
      fastify.log.info('✅ Sync worker started')
    }

    // Start listening
    console.log(`🔄 Starting server on ${serverConfig.host}:${serverConfig.port}...`)
    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host
    })

    const displayHost = serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host

    console.log('')
    console.log('✅ Server started successfully!')
    console.log('')
    console.log(`🚀 Garbaking POS Backend (Fastify) running`)
    console.log(`📡 API: http://${displayHost}:${serverConfig.port}/api`)
    console.log(`💚 Health: http://${displayHost}:${serverConfig.port}/health`)
    console.log(`🔌 WebSocket: ws://${displayHost}:${serverConfig.port}`)
    console.log('')

  } catch (error: any) {
    console.error('')
    console.error('❌ Failed to start server')
    console.error('❌ Error:', error.message)
    console.error('')

    if (error.code === 'EADDRINUSE') {
      console.error('⚠️  Port', serverConfig.port, 'is already in use')
      console.error('🔧 Solutions:')
      console.error('   1. Stop the other process using port', serverConfig.port)
      console.error('   2. Change PORT in .env file')
      console.error('   3. Kill process: lsof -ti:', serverConfig.port, '| xargs kill')
    } else if (error.message.includes('database') || error.message.includes('Prisma')) {
      console.error('⚠️  Database error detected')
      console.error('🔧 Try running: npm run db:setup')
    }

    console.error('')
    process.exit(1)
  }
}

// Create instance for export
let appInstance: any

export async function getApp() {
  if (!appInstance) {
    appInstance = await buildApp()
  }
  return appInstance
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']

signals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n🔄 ${signal} received, shutting down gracefully...`)

    if (appInstance) {
      await appInstance.close()
      console.log('✅ Server closed')
    }

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

// Start server if this file is run directly
if (require.main === module) {
  startServer()
}
