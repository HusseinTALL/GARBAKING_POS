/**
 * Authentication API endpoint tests
 * Tests login, registration, token validation, and security features
 */

import request from 'supertest'
import { Express } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createTestUser, generateTestToken } from './setup'

// We'll import the app after setup
let app: Express

beforeAll(async () => {
  // Import isolated test app
  const { createTestApp } = await import('./testApp')
  app = createTestApp()
})

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@garbaking.com',
        password: 'securepass123',
        name: 'New User',
        role: 'CASHIER'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.name).toBe(userData.name)
      expect(response.body.data.token).toBeDefined()
      expect(response.body.data.user.password).toBeUndefined() // Password should not be returned
    })

    it('should not register user with existing email', async () => {
      // Create a user first
      await createTestUser()

      const userData = {
        email: 'test@garbaking.com', // Same as test user
        password: 'securepass123',
        name: 'Duplicate User',
        role: 'CASHIER'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('email')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
          name: '',
          role: 'INVALID_ROLE'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should hash password before storing', async () => {
      const userData = {
        email: 'hashtest@garbaking.com',
        password: 'plainpassword123',
        name: 'Hash Test User',
        role: 'CASHIER'
      }

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Check that password was hashed in database
      const user = await global.testDb.user.findUnique({
        where: { email: userData.email }
      })

      expect(user).toBeTruthy()
      expect(user!.password).not.toBe(userData.password)
      expect(await bcrypt.compare(userData.password, user!.password)).toBe(true)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser()
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@garbaking.com',
          password: 'testpass123'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('test@garbaking.com')
      expect(response.body.data.token).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.user.password).toBeUndefined()
    })

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@garbaking.com',
          password: 'testpass123'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid credentials')
    })

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@garbaking.com',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid credentials')
    })

    it('should not login inactive user', async () => {
      // Deactivate the test user
      await global.testDb.user.update({
        where: { email: 'test@garbaking.com' },
        data: { isActive: false }
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@garbaking.com',
          password: 'testpass123'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Account is deactivated')
    })

    it('should include user permissions in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@garbaking.com',
          password: 'testpass123'
        })
        .expect(200)

      expect(response.body.data.user.role).toBe('ADMIN')
      expect(response.body.data.permissions).toBeDefined()
      expect(Array.isArray(response.body.data.permissions)).toBe(true)
    })
  })

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string

    beforeEach(async () => {
      await createTestUser()

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@garbaking.com',
          password: 'testpass123'
        })

      refreshToken = loginResponse.body.data.refreshToken
    })

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.token).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/logout', () => {
    let token: string

    beforeEach(async () => {
      const user = await createTestUser()
      token = generateTestToken(user.id)
    })

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logged out successfully')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    let user: any
    let token: string

    beforeEach(async () => {
      user = await createTestUser()
      token = generateTestToken(user.id)
    })

    it('should return current user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.id).toBe(user.id)
      expect(response.body.data.user.email).toBe(user.email)
      expect(response.body.data.user.password).toBeUndefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should not work with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login attempts', async () => {
      await createTestUser()

      // Make multiple failed login attempts
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@garbaking.com',
            password: 'wrongpassword'
          })
      )

      const responses = await Promise.all(promises)

      // Some of the later requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('JWT Token Validation', () => {
    let user: any

    beforeEach(async () => {
      user = await createTestUser()
    })

    it('should validate token structure and claims', async () => {
      const token = generateTestToken(user.id)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

      expect(decoded.userId).toBe(user.id)
      expect(decoded.storeId).toBe(user.storeId)
      expect(decoded.role).toBe(user.role)
      expect(decoded.exp).toBeDefined()
    })

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: user.id, storeId: user.storeId, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' } // Expired 1 hour ago
      )

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})