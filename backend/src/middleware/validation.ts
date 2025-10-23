/**
 * Request validation middleware using express-validator
 * Validates incoming request data and sanitizes inputs
 */

import { body, param, query, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    })
    return
  }

  next()
}

// Authentication validation rules
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
]

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN_STAFF'])
    .withMessage('Invalid role specified'),
  handleValidationErrors
]

// Menu item validation rules
export const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU must be 3-20 characters and contain only uppercase letters, numbers, underscore, or dash'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('categoryId')
    .isUUID()
    .withMessage('Valid category ID is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  handleValidationErrors
]

// Category validation rules
export const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  handleValidationErrors
]

// Order validation rules
export const validateOrder = [
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customerPhone')
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{7,15}$/)
    .withMessage('Invalid phone number format'),
  body('tableNumber')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Table number must not exceed 10 characters'),
  body('orderType')
    .isIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
    .withMessage('Invalid order type'),
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('At least one order item is required'),
  body('orderItems.*.menuItemId')
    .isUUID()
    .withMessage('Valid menu item ID is required'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('orderItems.*.notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Order notes must not exceed 500 characters'),
  handleValidationErrors
]

// Public order validation (for customer app - no auth required)
export const validatePublicOrder = [
  body('storeId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Invalid store ID'),
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customerPhone')
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{7,15}$/)
    .withMessage('Invalid phone number format'),
  body('tableNumber')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Table number must not exceed 10 characters'),
  body('orderType')
    .isIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
    .withMessage('Invalid order type'),
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('At least one order item is required'),
  body('orderItems.*.menuItemId')
    .isUUID()
    .withMessage('Valid menu item ID is required'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('orderItems.*.notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Order notes must not exceed 500 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'CARD', 'MOBILE_MONEY', 'OTHER'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
]

// Order status update validation
export const validateOrderStatus = [
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'])
    .withMessage('Invalid order status'),
  body('kitchenNotes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Kitchen notes must not exceed 200 characters'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 0, max: 240 })
    .withMessage('Estimated time must be between 0 and 240 minutes'),
  handleValidationErrors
]

// Payment validation rules
export const validatePayment = [
  body('paymentMethod')
    .isIn(['CASH', 'CARD', 'MOBILE', 'OTHER'])
    .withMessage('Invalid payment method'),
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment reference must not exceed 100 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors
]

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  handleValidationErrors
]

// UUID parameter validation
export const validateUUID = (paramName: string) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
]