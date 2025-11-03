/**
 * Loyalty Program Routes
 * Defines all loyalty program API endpoints for customer rewards, tiers, campaigns, and redemptions
 */

import { Router } from 'express';
import { loyaltyController } from '../controllers/loyaltyController';
import {
  authenticateToken,
  requireRole,
  ROLES
} from '../middleware/authMiddleware';
import { loyaltyValidation } from '../middleware/loyaltyValidation';

const router = Router();

// Customer Loyalty Program Routes

/**
 * @route   GET /api/loyalty/customer/:customerId
 * @desc    Get customer loyalty profile
 * @access  Private
 */
router.get(
  '/customer/:customerId',
  authenticateToken,
  loyaltyController.getCustomerLoyalty
);

/**
 * @route   POST /api/loyalty/customer/:customerId/join
 * @desc    Enroll customer in loyalty program
 * @access  Private
 */
router.post(
  '/customer/:customerId/join',
  authenticateToken,
  loyaltyValidation.enrollCustomer,
  loyaltyController.enrollCustomer
);

/**
 * @route   GET /api/loyalty/customer/:customerId/rewards
 * @desc    Get customer loyalty rewards history
 * @access  Private
 */
router.get(
  '/customer/:customerId/rewards',
  authenticateToken,
  loyaltyController.getCustomerRewards
);

/**
 * @route   GET /api/loyalty/customer/:customerId/redemptions
 * @desc    Get customer redemption history
 * @access  Private
 */
router.get(
  '/customer/:customerId/redemptions',
  authenticateToken,
  loyaltyController.getCustomerRedemptions
);

/**
 * @route   POST /api/loyalty/customer/:customerId/redeem
 * @desc    Redeem loyalty points
 * @access  Private
 */
router.post(
  '/customer/:customerId/redeem',
  authenticateToken,
  loyaltyValidation.redeemPoints,
  loyaltyController.redeemPoints
);

// Order Integration Routes

/**
 * @route   POST /api/loyalty/order/:orderId/award-points
 * @desc    Award loyalty points for an order
 * @access  Private
 */
router.post(
  '/order/:orderId/award-points',
  authenticateToken,
  loyaltyController.awardPointsForOrder
);

/**
 * @route   POST /api/loyalty/order/:orderId/apply-redemption
 * @desc    Apply loyalty redemption to an order
 * @access  Private
 */
router.post(
  '/order/:orderId/apply-redemption',
  authenticateToken,
  loyaltyValidation.applyRedemption,
  loyaltyController.applyRedemptionToOrder
);

// Loyalty Program Management (Admin Only)

/**
 * @route   GET /api/loyalty/programs
 * @desc    Get all loyalty programs
 * @access  Private (Manager+)
 */
router.get(
  '/programs',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getAllPrograms
);

/**
 * @route   POST /api/loyalty/programs
 * @desc    Create new loyalty program
 * @access  Private (Admin+)
 */
router.post(
  '/programs',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.createProgram,
  loyaltyController.createProgram
);

/**
 * @route   PUT /api/loyalty/programs/:programId
 * @desc    Update loyalty program
 * @access  Private (Admin+)
 */
router.put(
  '/programs/:programId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.updateProgram,
  loyaltyController.updateProgram
);

/**
 * @route   DELETE /api/loyalty/programs/:programId
 * @desc    Delete loyalty program
 * @access  Private (Admin+)
 */
router.delete(
  '/programs/:programId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.deleteProgram
);

// Loyalty Tiers Management

/**
 * @route   GET /api/loyalty/programs/:programId/tiers
 * @desc    Get all tiers for a program
 * @access  Private (Manager+)
 */
router.get(
  '/programs/:programId/tiers',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getProgramTiers
);

/**
 * @route   POST /api/loyalty/programs/:programId/tiers
 * @desc    Create new loyalty tier
 * @access  Private (Admin+)
 */
router.post(
  '/programs/:programId/tiers',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.createTier,
  loyaltyController.createTier
);

/**
 * @route   PUT /api/loyalty/tiers/:tierId
 * @desc    Update loyalty tier
 * @access  Private (Admin+)
 */
router.put(
  '/tiers/:tierId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.updateTier,
  loyaltyController.updateTier
);

/**
 * @route   DELETE /api/loyalty/tiers/:tierId
 * @desc    Delete loyalty tier
 * @access  Private (Admin+)
 */
router.delete(
  '/tiers/:tierId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.deleteTier
);

// Loyalty Campaigns Management

/**
 * @route   GET /api/loyalty/campaigns
 * @desc    Get active loyalty campaigns
 * @access  Private
 */
router.get(
  '/campaigns',
  authenticateToken,
  loyaltyController.getActiveCampaigns
);

/**
 * @route   GET /api/loyalty/campaigns/all
 * @desc    Get all loyalty campaigns (admin)
 * @access  Private (Manager+)
 */
router.get(
  '/campaigns/all',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getAllCampaigns
);

/**
 * @route   POST /api/loyalty/campaigns
 * @desc    Create new loyalty campaign
 * @access  Private (Admin+)
 */
router.post(
  '/campaigns',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.createCampaign,
  loyaltyController.createCampaign
);

/**
 * @route   PUT /api/loyalty/campaigns/:campaignId
 * @desc    Update loyalty campaign
 * @access  Private (Admin+)
 */
router.put(
  '/campaigns/:campaignId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyValidation.updateCampaign,
  loyaltyController.updateCampaign
);

/**
 * @route   DELETE /api/loyalty/campaigns/:campaignId
 * @desc    Delete loyalty campaign
 * @access  Private (Admin+)
 */
router.delete(
  '/campaigns/:campaignId',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.deleteCampaign
);

// Analytics and Reporting

/**
 * @route   GET /api/loyalty/analytics/overview
 * @desc    Get loyalty program analytics overview
 * @access  Private (Manager+)
 */
router.get(
  '/analytics/overview',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getLoyaltyAnalytics
);

/**
 * @route   GET /api/loyalty/analytics/customers
 * @desc    Get customer loyalty analytics
 * @access  Private (Manager+)
 */
router.get(
  '/analytics/customers',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getCustomerAnalytics
);

/**
 * @route   GET /api/loyalty/analytics/redemptions
 * @desc    Get redemption analytics
 * @access  Private (Manager+)
 */
router.get(
  '/analytics/redemptions',
  authenticateToken,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  loyaltyController.getRedemptionAnalytics
);

export default router;