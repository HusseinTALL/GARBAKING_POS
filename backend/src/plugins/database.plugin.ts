/**
 * Database Plugin
 * Provides Prisma client as a Fastify decorator for database access
 */

import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  // Create Prisma client
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: 'minimal'
  })

  // Connect to database
  try {
    await prisma.$connect()
    fastify.log.info('📦 Database connection established')
  } catch (error: any) {
    fastify.log.error({ error }, '❌ Failed to connect to database')
    fastify.log.error('')
    fastify.log.error('🔧 Database connection failed. Possible causes:')
    fastify.log.error('   1. Database file does not exist')
    fastify.log.error('   2. Database schema not initialized')
    fastify.log.error('   3. Prisma client not generated')
    fastify.log.error('')
    fastify.log.error('💡 Fix: Run "npm run db:setup" in the backend directory')
    fastify.log.error('')
    throw new Error(`Database connection failed: ${error.message}`)
  }

  // Health check
  try {
    await prisma.$queryRaw`SELECT 1`
    fastify.log.info('✅ Database health check passed')
  } catch (error: any) {
    fastify.log.error({ error }, '❌ Database health check failed')
    fastify.log.error('')
    fastify.log.error('🔧 Database is not properly initialized.')
    fastify.log.error('   The database file may be empty or missing tables.')
    fastify.log.error('')
    fastify.log.error('💡 Fix: Run "npm run db:setup" in the backend directory')
    fastify.log.error('')
    throw new Error(`Database health check failed: ${error.message}`)
  }

  // Add Prisma as decorator
  fastify.decorate('prisma', prisma)

  // Close connection on app close
  fastify.addHook('onClose', async (instance) => {
    instance.log.info('Closing database connection...')
    await instance.prisma.$disconnect()
    instance.log.info('✅ Database connection closed')
  })
}

export default fp(databasePlugin, {
  name: 'database'
})

// Export getDB function for backward compatibility
export function getDB(): PrismaClient {
  // This will be replaced with fastify.prisma in routes
  // Kept for compatibility during migration
  return new PrismaClient()
}
