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
  // Set custom error handler
  fastify.setErrorHandler(
    async (error: CustomError, request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode || 500

      // Log error
      fastify.log.error({
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          statusCode
        },
        request: {
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query
        }
      }, 'Error occurred')

      // Handle validation errors
      if (error.validation) {
        return reply.status(400).send({
          success: false,
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          details: error.validation,
          message: 'Request validation failed'
        })
      }

      // Handle JWT errors
      if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          code: 'TOKEN_REQUIRED',
          message: 'Access token required'
        })
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        })
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
          code: 'TOKEN_INVALID',
          message: 'Invalid or malformed token'
        })
      }

      // Handle Prisma errors
      if (error.code?.startsWith('P')) {
        if (error.code === 'P2002') {
          return reply.status(409).send({
            success: false,
            error: 'Conflict',
            code: 'DUPLICATE_ENTRY',
            message: 'Record already exists'
          })
        }

        if (error.code === 'P2025') {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            code: 'RECORD_NOT_FOUND',
            message: 'Record not found'
          })
        }

        // Generic database error
        return reply.status(500).send({
          success: false,
          error: 'Database Error',
          code: 'DATABASE_ERROR',
          message: process.env.NODE_ENV === 'production'
            ? 'A database error occurred'
            : error.message
        })
      }

      // Default error response
      reply.status(statusCode).send({
        success: false,
        error: statusCode >= 500 ? 'Internal Server Error' : error.message,
        code: error.code || 'UNKNOWN_ERROR',
        message: process.env.NODE_ENV === 'production' && statusCode >= 500
          ? 'An unexpected error occurred'
          : error.message
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
      method: request.method
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
