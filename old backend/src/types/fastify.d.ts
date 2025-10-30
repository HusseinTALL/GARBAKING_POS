/**
 * TypeScript declarations for Fastify extensions
 * Extends Fastify interfaces with custom decorators and properties
 */

import 'fastify'
import { PrismaClient } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'
import { preHandlerHookHandler } from 'fastify'
import { Role } from '../config/permissions'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id?: string
      userId: string
      email: string
      name?: string
      role: string
      storeId: string
      sessionId: string
    }
  }

  export interface FastifyInstance {
    prisma: PrismaClient
    io: SocketIOServer

    // Auth decorators
    authenticate: preHandlerHookHandler
    optionalAuthenticate: preHandlerHookHandler
    requireRole: (roles: string | string[]) => preHandlerHookHandler
    requirePermission: (permission: string) => preHandlerHookHandler
    requireAnyPermission: (permissions: string[]) => preHandlerHookHandler
    requireAllPermissions: (permissions: string[]) => preHandlerHookHandler
    requireMinimumRole: (minimumRole: Role) => preHandlerHookHandler
    requireResourceAccess: (resource: string, action: string) => preHandlerHookHandler
    requireOwnershipOrAdmin: (userIdField?: string) => preHandlerHookHandler
    rateLimitAuth: (maxAttempts?: number, windowMs?: number) => preHandlerHookHandler

    // Error helper
    createError: (message: string, statusCode?: number, code?: string) => Error
  }
}
