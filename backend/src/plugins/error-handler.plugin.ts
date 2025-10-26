/**
 * Error Handler Plugin
 * Centralized error handling for Fastify with custom error responses
 */

import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

interface CustomError extends Error {
  statusCode?: number
  code?: string
  validation?: any[]
}

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // Helper function to determine if error is retryable
  const isRetryable = (statusCode: number): boolean => {
    return [408, 429, 500, 502, 503, 504].includes(statusCode)
  }

  // Helper function to get error code
  const getErrorCode = (error: CustomError): string => {
    if (error.code?.startsWith('P')) {
      return `DB_${error.code}`
    }
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR'
    if (error.statusCode === 504) return 'GATEWAY_TIMEOUT'
    return error.code || 'INTERNAL_ERROR'
  }

  // Set custom error handler
  fastify.setErrorHandler(
    async (error: CustomError, request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode || 500

      // Log error with request ID
      fastify.log.error({
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          statusCode
        },
        request: {
          id: (request as any).id,
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query
        }
      }, 'Error occurred')

      // Base response object
      const baseResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: (request as any).id || 'unknown'
      }

      // Handle validation errors
      if (error.validation) {
        return reply.status(400).send({
          ...baseResponse,
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          details: error.validation,
          message: 'Request validation failed',
          retryable: false
        })
      }

      // Handle JWT errors
      if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.status(401).send({
          ...baseResponse,
          error: 'Unauthorized',
          code: 'TOKEN_REQUIRED',
          message: 'Access token required',
          retryable: false
        })
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
        return reply.status(401).send({
          ...baseResponse,
          error: 'Unauthorized',
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
          retryable: false
        })
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
        return reply.status(401).send({
          ...baseResponse,
          error: 'Unauthorized',
          code: 'TOKEN_INVALID',
          message: 'Invalid or malformed token',
          retryable: false
        })
      }

      // Handle Prisma errors
      if (error.code?.startsWith('P')) {
        if (error.code === 'P2002') {
          return reply.status(409).send({
            ...baseResponse,
            error: 'Conflict',
            code: 'DUPLICATE_ENTRY',
            message: 'Record already exists',
            retryable: false
          })
        }

        if (error.code === 'P2025') {
          return reply.status(404).send({
            ...baseResponse,
            error: 'Not Found',
            code: 'RECORD_NOT_FOUND',
            message: 'Record not found',
            retryable: false
          })
        }

        // Generic database error
        return reply.status(500).send({
          ...baseResponse,
          error: 'Database Error',
          code: getErrorCode(error),
          message: process.env.NODE_ENV === 'production'
            ? 'A database error occurred'
            : error.message,
          retryable: true
        })
      }

      // Default error response
      reply.status(statusCode).send({
        ...baseResponse,
        error: statusCode >= 500 ? 'Internal Server Error' : error.message,
        code: getErrorCode(error),
        message: process.env.NODE_ENV === 'production' && statusCode >= 500
          ? 'An unexpected error occurred'
          : error.message,
        retryable: isRetryable(statusCode)
      })
    }
  )

  // Set not found handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Not Found',
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId: (request as any).id || 'unknown',
      retryable: false
    })
  })

  // Add helper function to create custom errors
  fastify.decorate('createError', (message: string, statusCode: number = 500, code?: string) => {
    const error = new Error(message) as CustomError
    error.statusCode = statusCode
    error.code = code
    return error
  })
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler'
})
