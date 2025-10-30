/**
 * Jest test setup configuration
 * Sets up test database, environment variables, and global test utilities
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Global test database instance
declare global {
  var testDb: PrismaClient
}

// Set up test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing'
process.env.STORE_ID = 'test-store-001'
process.env.PORT = '0' // Use random available port for tests

// Initialize test database
global.testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Global test timeout
jest.setTimeout(30000)

// Before all tests
beforeAll(async () => {
  // Ensure database is connected
  await global.testDb.$connect()

  // Push schema to create tables if they don't exist
  const { execSync } = require('child_process')
  try {
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      cwd: process.cwd(),
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    })
  } catch (error) {
    console.log('Schema push completed (error is expected for fresh DB)')
  }

  // Clean up and reset database
  await global.testDb.$executeRaw`PRAGMA foreign_keys = OFF`

  // Get all table names
  const tables = await global.testDb.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'
  `

  // Delete all data from tables
  for (const table of tables) {
    try {
      await global.testDb.$executeRawUnsafe(`DELETE FROM "${table.name}"`)
    } catch (error) {
      // Table might not exist, continue
    }
  }

  await global.testDb.$executeRaw`PRAGMA foreign_keys = ON`
})

// After each test
afterEach(async () => {
  // Clean up data after each test but keep schema
  const tables = ['order_items', 'orders', 'menu_items', 'categories', 'users', 'payments', 'settings']

  for (const table of tables) {
    try {
      await global.testDb.$executeRawUnsafe(`DELETE FROM "${table}"`)
    } catch (error) {
      // Table might not exist, continue
    }
  }
})

// After all tests
afterAll(async () => {
  await global.testDb.$disconnect()
})

// Helper function to create test user
export const createTestUser = async () => {
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('testpass123', 10)

  return await global.testDb.user.create({
    data: {
      email: 'test@garbaking.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'ADMIN',
      storeId: 'test-store-001',
      isActive: true
    }
  })
}

// Helper function to create test auth headers
export const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
})

// Helper function to generate JWT token for testing
export const generateTestToken = (userId: string, storeId: string = 'test-store-001') => {
  const jwt = require('jsonwebtoken')
  return jwt.sign(
    { userId, storeId, role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}