/**
 * Database initialization and connection management
 * Handles Prisma client setup and database health checks
 */

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

// Singleton pattern for Prisma client
function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
      errorFormat: 'pretty',
    })
  }
  return prisma
}

/**
 * Initialize database connection and run basic health checks
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const client = getPrismaClient()

    // Test database connection
    await client.$connect()
    console.log('📦 Database connection established')

    // Run health check query
    await client.$queryRaw`SELECT 1`
    console.log('✅ Database health check passed')

    // Ensure default settings exist
    await ensureDefaultSettings(client)
    console.log('⚙️ Default settings verified')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

/**
 * Ensure default system settings are in place
 */
async function ensureDefaultSettings(client: PrismaClient): Promise<void> {
  const defaultSettings = [
    {
      key: 'store_name',
      value: process.env.STORE_NAME || 'Garbaking Restaurant',
      description: 'Restaurant name displayed on receipts'
    },
    {
      key: 'store_id',
      value: process.env.STORE_ID || 'store_001',
      description: 'Unique store identifier'
    },
    {
      key: 'tax_rate',
      value: '0.10',
      description: 'Default tax rate (decimal)'
    },
    {
      key: 'currency',
      value: 'FCFA',
      description: 'Default currency symbol'
    },
    {
      key: 'receipt_footer',
      value: 'Thank you for dining with us!',
      description: 'Footer text on receipts'
    },
    {
      key: 'order_timeout_minutes',
      value: '30',
      description: 'Default estimated preparation time'
    },
    {
      key: 'sync_interval_minutes',
      value: process.env.SYNC_INTERVAL_MINUTES || '5',
      description: 'Cloud sync interval in minutes'
    }
  ]

  for (const setting of defaultSettings) {
    await client.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    console.log('📦 Database connection closed')
  }
}

/**
 * Get Prisma client instance
 */
export function getDB(): PrismaClient {
  return getPrismaClient()
}

/**
 * Database health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getPrismaClient()
    await client.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}