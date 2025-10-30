/**
 * Loyalty Program Validation Middleware
 * Validates request data for loyalty program operations with comprehensive business rule checks
 */

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Handle validation result
 */
const handleValidationResult = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

/**
 * Validate customer enrollment in loyalty program
 */
const enrollCustomer = [
  param('customerId')
    .isUUID()
    .withMessage('Valid customer ID is required'),
  body('programId')
    .optional()
    .isUUID()
    .withMessage('Valid program ID is required if provided'),
  handleValidationResult
];

/**
 * Validate points redemption request
 */
const redeemPoints = [
  param('customerId')
    .isUUID()
    .withMessage('Valid customer ID is required'),
  body('pointsToRedeem')
    .isInt({ min: 1 })
    .withMessage('Points to redeem must be a positive integer'),
  body('redemptionType')
    .isIn(['DISCOUNT', 'FREE_ITEM', 'PERCENTAGE_OFF'])
    .withMessage('Invalid redemption type'),
  body('description')
    .isLength({ min: 1, max: 255 })
    .withMessage('Description is required and must be less than 255 characters'),
  body('orderId')
    .optional()
    .isUUID()
    .withMessage('Valid order ID is required if provided'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  handleValidationResult
];

/**
 * Validate applying redemption to order
 */
const applyRedemption = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required'),
  body('redemptionId')
    .isUUID()
    .withMessage('Valid redemption ID is required'),
  body('customerId')
    .isUUID()
    .withMessage('Valid customer ID is required'),
  handleValidationResult
];

/**
 * Validate loyalty program creation
 */
const createProgram = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Program name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('pointsPerDollar')
    .isFloat({ min: 0 })
    .withMessage('Points per dollar must be a non-negative number'),
  body('dollarPerPoint')
    .isFloat({ min: 0 })
    .withMessage('Dollar per point must be a non-negative number'),
  body('minPointsRedeem')
    .isInt({ min: 0 })
    .withMessage('Minimum points to redeem must be a non-negative integer'),
  body('maxPointsPerOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum points per order must be a positive integer'),
  body('signupBonus')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Signup bonus must be a non-negative integer'),
  body('birthdayBonus')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Birthday bonus must be a non-negative integer'),
  body('referralBonus')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Referral bonus must be a non-negative integer'),
  body('pointsExpireDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points expiration days must be a positive integer'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  handleValidationResult
];

/**
 * Validate loyalty program update
 */
const updateProgram = [
  param('programId')
    .isUUID()
    .withMessage('Valid program ID is required'),
  ...createProgram.slice(0, -1), // Reuse creation validation without handleValidationResult
  handleValidationResult
];

/**
 * Validate loyalty tier creation
 */
const createTier = [
  param('programId')
    .isUUID()
    .withMessage('Valid program ID is required'),
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tier name is required and must be less than 50 characters'),
  body('minSpent')
    .isFloat({ min: 0 })
    .withMessage('Minimum spent must be a non-negative number'),
  body('minVisits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum visits must be a non-negative integer'),
  body('pointsMultiplier')
    .isFloat({ min: 0 })
    .withMessage('Points multiplier must be a non-negative number'),
  body('discountPercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percent must be between 0 and 100'),
  body('freeDelivery')
    .optional()
    .isBoolean()
    .withMessage('Free delivery must be a boolean'),
  body('prioritySupport')
    .optional()
    .isBoolean()
    .withMessage('Priority support must be a boolean'),
  body('birthdayReward')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Birthday reward must be a non-negative number'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  handleValidationResult
];

/**
 * Validate loyalty tier update
 */
const updateTier = [
  param('tierId')
    .isUUID()
    .withMessage('Valid tier ID is required'),
  ...createTier.slice(1, -1), // Reuse creation validation without programId param and handleValidationResult
  handleValidationResult
];

/**
 * Validate loyalty campaign creation
 */
const createCampaign = [
  body('programId')
    .isUUID()
    .withMessage('Valid program ID is required'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Campaign name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('type')
    .isIn(['DOUBLE_POINTS', 'BONUS_POINTS', 'CATEGORY_MULTIPLIER', 'SPEND_THRESHOLD'])
    .withMessage('Invalid campaign type'),
  body('pointsBonus')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points bonus must be a non-negative integer'),
  body('multiplier')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Multiplier must be at least 1.0'),
  body('minSpend')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum spend must be a non-negative number'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Valid category ID is required if provided'),
  body('menuItemId')
    .optional()
    .isUUID()
    .withMessage('Valid menu item ID is required if provided'),
  body('maxRedemptions')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum redemptions must be a positive integer'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(endDate);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  handleValidationResult
];

/**
 * Validate loyalty campaign update
 */
const updateCampaign = [
  param('campaignId')
    .isUUID()
    .withMessage('Valid campaign ID is required'),
  ...createCampaign.slice(0, -1), // Reuse creation validation without handleValidationResult
  handleValidationResult
];

/**
 * Validate analytics query parameters
 */
const analyticsQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('programId')
    .optional()
    .isUUID()
    .withMessage('Valid program ID is required if provided'),
  query('tierId')
    .optional()
    .isUUID()
    .withMessage('Valid tier ID is required if provided'),
  handleValidationResult
];

export const loyaltyValidation = {
  enrollCustomer,
  redeemPoints,
  applyRedemption,
  createProgram,
  updateProgram,
  createTier,
  updateTier,
  createCampaign,
  updateCampaign,
  analyticsQuery
};