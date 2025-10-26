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

  // Health check endpoints
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.environment,
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      websocket: 'active'
    }
  })

  fastify.get('/api/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.environment,
      version: process.env.npm_package_version || '1.0.0'
    }
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
    // Initialize database
    await initializeDatabase()
    console.log('✅ Database initialized')

    // Build app
    const fastify = await buildApp()

    // Start sync worker if in offline mode
    if (process.env.OFFLINE_MODE === 'true') {
      startSyncWorker()
      fastify.log.info('✅ Sync worker started')
    }

    // Start listening
    await fastify.listen({
      port: serverConfig.port,
      host: serverConfig.host
    })

    fastify.log.info(`🚀 Garbaking POS Backend (Fastify) running on port ${serverConfig.port}`)
    fastify.log.info(`📊 Environment: ${serverConfig.environment}`)
    fastify.log.info(`🏪 Store ID: ${serverConfig.storeId}`)
    fastify.log.info(`💾 Database: ${process.env.DATABASE_URL}`)
    fastify.log.info(`📡 Health check: http://${serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host}:${serverConfig.port}/health`)

  } catch (error) {
    console.error('❌ Failed to start server:', error)
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
