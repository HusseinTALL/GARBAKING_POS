/**
 * Fastify Server Configuration
 * Defines core server settings, plugins, and middleware for the Fastify instance
 */

import { FastifyServerOptions } from 'fastify'

export const fastifyConfig: FastifyServerOptions = {
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true
            }
          }
        : undefined
  },
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) => {
    // Use existing request ID if provided, otherwise generate new one
    const existingId = req.headers['x-request-id']
    if (existingId && typeof existingId === 'string') {
      return existingId
    }
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  trustProxy: true,
  bodyLimit: 10485760, // 10MB
  keepAliveTimeout: 5000,
  connectionTimeout: 60000, // 60 seconds - allows time for slow connections
  pluginTimeout: 10000,
  requestTimeout: 120000, // 120 seconds - allows time for analytics queries
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true,
  caseSensitive: false,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true
    }
  }
}

export const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://admin.garbaking.com', 'https://kds.garbaking.com', 'https://customer.garbaking.com']
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3003'
      ],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}

export const helmetConfig = {
  global: true,
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}

export const rateLimitConfig = {
  global: true,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  cache: 10000,
  allowList: (req: any) => {
    // Skip rate limiting for health checks
    if (req.url === '/health' || req.url === '/api/health') {
      return true
    }
    return false
  },
  skipOnError: true
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  verify: {
    maxAge: process.env.JWT_EXPIRES_IN || '1h'
  }
}

export const serverConfig = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '0.0.0.0',
  storeId: process.env.STORE_ID || 'store_001',
  environment: process.env.NODE_ENV || 'development'
}
