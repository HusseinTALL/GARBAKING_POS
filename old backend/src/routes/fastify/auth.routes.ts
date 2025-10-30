/**
 * Auth Routes (Fastify Plugin)
 * Minimal authentication endpoints - primarily for admin/staff
 * Customer app uses anonymous orders
 */

import { FastifyPluginAsync } from 'fastify'
import {
  authController,
  registerValidation,
  loginValidation
} from '../../controllers/authController'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/auth/login
   * Login user (admin/staff only - not used by customer app)
   */
  fastify.post('/login', {
    schema: {
      description: 'User login',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: { type: 'object' },
                token: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: [fastify.rateLimitAuth(5, 15 * 60 * 1000)]
  }, async (request, reply) => {
    // Call existing auth controller
    return authController.login(request as any, reply as any)
  })

  /**
   * POST /api/auth/register
   * Register new user (admin only - not used by customer app)
   */
  fastify.post('/register', {
    schema: {
      description: 'Register new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 1 },
          role: { type: 'string', enum: ['CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN'] }
        }
      }
    },
    preHandler: [fastify.rateLimitAuth(3, 15 * 60 * 1000)]
  }, async (request, reply) => {
    return authController.register(request as any, reply as any)
  })

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  fastify.get('/profile', {
    schema: {
      description: 'Get user profile',
      tags: ['auth'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: { type: 'object' }
              }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return authController.getProfile(request as any, reply as any)
  })

  /**
   * POST /api/auth/logout
   * Logout user
   */
  fastify.post('/logout', {
    schema: {
      description: 'Logout user',
      tags: ['auth']
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return authController.logout(request as any, reply as any)
  })

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  fastify.post('/refresh', {
    schema: {
      description: 'Refresh access token',
      tags: ['auth']
    },
    preHandler: [fastify.rateLimitAuth(10, 15 * 60 * 1000)]
  }, async (request, reply) => {
    return authController.refreshToken(request as any, reply as any)
  })

  fastify.log.info('✅ Auth routes registered')
}

export default authRoutes
