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
    throw error
  }

  // Health check
  try {
    await prisma.$queryRaw`SELECT 1`
    fastify.log.info('✅ Database health check passed')
  } catch (error: any) {
    fastify.log.error({ error }, '❌ Database health check failed')
    throw error
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

// Singleton instance for backward compatibility
let prismaInstance: PrismaClient | null = null

// Export getDB function for backward compatibility with singleton pattern
export function getDB(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
      errorFormat: 'minimal'
    })
  }
  return prismaInstance
}

// Graceful shutdown helper
export async function disconnectDB(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
  }
}
