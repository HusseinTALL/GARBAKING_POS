/**
 * Authentication Plugin
 * Provides JWT authentication, authorization hooks, and user decorators for Fastify
 */

import { FastifyPluginAsync, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'
import { authService } from '../services/authService'
import {
  Role,
  hasPermission,
  hasMinimumRole,
  canAccessResource
} from '../config/permissions'

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN'
} as const

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  })

  /**
   * Main authentication hook - validates JWT token
   */
  const authenticate: preHandlerHookHandler = async (request, reply) => {
    try {
      const authHeader = request.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return reply.status(401).send({
          success: false,
          message: 'Access token required',
          code: 'TOKEN_REQUIRED'
        })
      }

      // Validate token using authService
      const tokenPayload = await authService.validateToken(token)

      if (!tokenPayload) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid or expired token',
          code: 'TOKEN_INVALID'
        })
      }

      // Add user to request
      request.user = {
        id: tokenPayload.userId,
        userId: tokenPayload.userId,
        email: tokenPayload.email,
        name: tokenPayload.name,
        role: tokenPayload.role,
        storeId: tokenPayload.storeId,
        sessionId: tokenPayload.sessionId
      }
    } catch (error: any) {
      fastify.log.error({ error }, 'Authentication error')
      return reply.status(401).send({
        success: false,
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
      })
    }
  }

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  const optionalAuthenticate: preHandlerHookHandler = async (request, reply) => {
    try {
      const authHeader = request.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]

      if (token) {
        const tokenPayload = await authService.validateToken(token)

        if (tokenPayload) {
          request.user = {
            id: tokenPayload.userId,
            userId: tokenPayload.userId,
            email: tokenPayload.email,
            name: tokenPayload.name,
            role: tokenPayload.role,
            storeId: tokenPayload.storeId,
            sessionId: tokenPayload.sessionId
          }
        }
      }
    } catch (error) {
      // Continue without authentication if token validation fails
      fastify.log.debug('Optional auth failed, continuing without user')
    }
  }

  /**
   * Require specific role(s)
   */
  const requireRole = (allowedRoles: string | string[]): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          message: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          requiredRoles: roles,
          currentRole: request.user.role
        })
      }
    }
  }

  /**
   * Require specific permission
   */
  const requirePermission = (permission: string): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      if (!hasPermission(userRole, permission)) {
        return reply.status(403).send({
          success: false,
          message: `Permission denied: ${permission}`,
          code: 'PERMISSION_DENIED',
          requiredPermission: permission
        })
      }
    }
  }

  /**
   * Require ANY of the provided permissions
   */
  const requireAnyPermission = (permissions: string[]): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      const hasAnyPermission = permissions.some(permission => hasPermission(userRole, permission))

      if (!hasAnyPermission) {
        return reply.status(403).send({
          success: false,
          message: 'Insufficient permissions',
          code: 'ALTERNATIVE_PERMISSIONS_DENIED',
          requiredPermissions: permissions
        })
      }
    }
  }

  /**
   * Require ALL of the provided permissions
   */
  const requireAllPermissions = (permissions: string[]): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      const missingPermissions = permissions.filter(permission => !hasPermission(userRole, permission))

      if (missingPermissions.length > 0) {
        return reply.status(403).send({
          success: false,
          message: 'Insufficient permissions',
          code: 'MULTIPLE_PERMISSIONS_DENIED',
          missingPermissions
        })
      }
    }
  }

  /**
   * Require minimum role level
   */
  const requireMinimumRole = (minimumRole: Role): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      if (!hasMinimumRole(userRole, minimumRole)) {
        return reply.status(403).send({
          success: false,
          message: `Minimum role required: ${minimumRole}`,
          code: 'ROLE_INSUFFICIENT',
          currentRole: userRole,
          minimumRole
        })
      }
    }
  }

  /**
   * Require resource access with specific action
   */
  const requireResourceAccess = (resource: string, action: string): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      if (!canAccessResource(userRole, resource, action)) {
        return reply.status(403).send({
          success: false,
          message: `Access denied: Cannot ${action} ${resource}`,
          code: 'RESOURCE_ACCESS_DENIED',
          resource,
          action
        })
      }
    }
  }

  /**
   * Require ownership or admin access
   */
  const requireOwnershipOrAdmin = (userIdField: string = 'userId'): preHandlerHookHandler => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        })
      }

      const userRole = request.user.role as Role
      const requestedUserId = (request.params as any)[userIdField] || (request.body as any)?.[userIdField]

      // Admin and above can access any resource
      if (hasMinimumRole(userRole, 'ADMIN' as Role)) {
        return
      }

      // User can only access their own resources
      if (request.user.userId !== requestedUserId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied: Can only access own resources',
          code: 'OWNERSHIP_REQUIRED'
        })
      }
    }
  }

  /**
   * Rate limiting for authentication endpoints
   */
  const rateLimitAuth = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): preHandlerHookHandler => {
    const attempts = new Map<string, { count: number; resetTime: number }>()

    return async (request, reply) => {
      const identifier = request.ip || 'unknown'
      const now = Date.now()

      const userAttempts = attempts.get(identifier)

      if (!userAttempts || now > userAttempts.resetTime) {
        // Reset or initialize counter
        attempts.set(identifier, { count: 1, resetTime: now + windowMs })
        return
      }

      if (userAttempts.count >= maxAttempts) {
        return reply.status(429).send({
          success: false,
          message: 'Too many authentication attempts. Please try again later.',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
        })
      }

      userAttempts.count++
    }
  }

  // Decorate fastify instance with auth helpers
  fastify.decorate('authenticate', authenticate)
  fastify.decorate('optionalAuthenticate', optionalAuthenticate)
  fastify.decorate('requireRole', requireRole)
  fastify.decorate('requirePermission', requirePermission)
  fastify.decorate('requireAnyPermission', requireAnyPermission)
  fastify.decorate('requireAllPermissions', requireAllPermissions)
  fastify.decorate('requireMinimumRole', requireMinimumRole)
  fastify.decorate('requireResourceAccess', requireResourceAccess)
  fastify.decorate('requireOwnershipOrAdmin', requireOwnershipOrAdmin)
  fastify.decorate('rateLimitAuth', rateLimitAuth)

  fastify.log.info('✅ Authentication plugin registered')
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['database']
})
