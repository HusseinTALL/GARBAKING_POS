/**
 * Global error handling middleware
 * Catches and processes all application errors
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal server error'

  // Log error details
  console.error('Error Details:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    body: req.body,
    user: (req as any).user?.id
  })

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        message = 'Duplicate entry. This record already exists.'
        break
      case 'P2025':
        statusCode = 404
        message = 'Record not found.'
        break
      case 'P2003':
        statusCode = 400
        message = 'Invalid reference. Related record does not exist.'
        break
      case 'P2014':
        statusCode = 400
        message = 'Invalid data provided.'
        break
      default:
        statusCode = 500
        message = 'Database operation failed.'
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed. Please check your input.'
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid authentication token.'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Authentication token has expired.'
  }

  // Response format
  const response: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack
    response.details = error
  }

  // Send error response
  res.status(statusCode).json(response)
}

/**
 * Create operational error
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}