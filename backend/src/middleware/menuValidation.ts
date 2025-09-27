/**
 * Menu Validation Middleware - Comprehensive validation for menu operations
 * Validates menu items, categories, and related data with business rules
 */

import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'

// Helper function to handle validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    })
    return
  }
  next()
  return
}

// === MENU ITEM VALIDATION ===

export const validateCreateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be between 1-100 characters'),

  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU is required and must be between 1-50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('shortDesc')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Short description must be less than 100 characters'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),

  body('salePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value && req.body.price && value >= req.body.price) {
        throw new Error('Sale price must be less than regular price')
      }
      return true
    }),

  body('categoryId')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some((tag: any) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with max 50 characters')
      }
      return true
    }),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('prepTime')
    .optional()
    .isInt({ min: 1, max: 9999 })
    .withMessage('Prep time must be between 1-9999 minutes'),

  body('calories')
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage('Calories must be between 0-9999'),

  body('stockCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),

  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),

  body('maxPerOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max per order must be at least 1'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  // Boolean validations
  body('isAvailable').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('isSpicy').optional().isBoolean(),
  body('isVegetarian').optional().isBoolean(),
  body('isVegan').optional().isBoolean(),
  body('isGlutenFree').optional().isBoolean(),

  handleValidationErrors
]

export const validateUpdateMenuItem = [
  param('id')
    .isUUID()
    .withMessage('Menu item ID must be a valid UUID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1-100 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU must be between 1-50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('shortDesc')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Short description must be less than 100 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),

  body('salePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Sale price must be a positive number'),

  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('prepTime')
    .optional()
    .isInt({ min: 1, max: 9999 })
    .withMessage('Prep time must be between 1-9999 minutes'),

  body('calories')
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage('Calories must be between 0-9999'),

  body('stockCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),

  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),

  body('maxPerOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max per order must be at least 1'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  // Boolean validations
  body('isAvailable').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('isSpicy').optional().isBoolean(),
  body('isVegetarian').optional().isBoolean(),
  body('isVegan').optional().isBoolean(),
  body('isGlutenFree').optional().isBoolean(),

  handleValidationErrors
]

// === CATEGORY VALIDATION ===

export const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be between 1-100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),

  handleValidationErrors
]

export const validateUpdateCategory = [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1-100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),

  handleValidationErrors
]

// === BULK OPERATIONS VALIDATION ===

export const validateBulkUpdate = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),

  body('ids.*')
    .isUUID()
    .withMessage('Each ID must be a valid UUID'),

  body('updateData')
    .isObject()
    .withMessage('Update data must be an object'),

  body('updateData.price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('updateData.isAvailable').optional().isBoolean(),
  body('updateData.isActive').optional().isBoolean(),
  body('updateData.isVisible').optional().isBoolean(),
  body('updateData.isFeatured').optional().isBoolean(),

  handleValidationErrors
]

// === STOCK VALIDATION ===

export const validateStockUpdate = [
  param('id')
    .isUUID()
    .withMessage('Menu item ID must be a valid UUID'),

  body('stockCount')
    .custom((value) => {
      if (value !== null && (!Number.isInteger(value) || value < 0)) {
        throw new Error('Stock count must be null or a non-negative integer')
      }
      return true
    }),

  handleValidationErrors
]

// === QUERY VALIDATION ===

export const validateMenuFilters = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),

  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),

  query('priceMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),

  query('priceMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),

  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'sortOrder', 'category'])
    .withMessage('Sort by must be one of: name, price, createdAt, sortOrder, category'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters'),

  // Boolean query parameters
  query('isAvailable').optional().isBoolean(),
  query('isActive').optional().isBoolean(),
  query('isVisible').optional().isBoolean(),
  query('isFeatured').optional().isBoolean(),
  query('isVegetarian').optional().isBoolean(),
  query('isVegan').optional().isBoolean(),
  query('isGlutenFree').optional().isBoolean(),
  query('isSpicy').optional().isBoolean(),

  handleValidationErrors
]

// === UUID PARAMETER VALIDATION ===

export const validateUUIDParam = (paramName: string = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),

  handleValidationErrors
]

// === SEARCH VALIDATION ===

export const validateSearch = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be between 1-100 characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1-50'),

  handleValidationErrors
]