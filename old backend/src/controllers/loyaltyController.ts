/**
 * Loyalty Program Controller
 * Handles HTTP requests for loyalty programs, customer rewards, tiers, campaigns, and redemptions
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { loyaltyService } from '../services/loyaltyService';

class LoyaltyController {
  /**
   * Get customer loyalty profile
   */
  async getCustomerLoyalty(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      const loyalty = await loyaltyService.getCustomerLoyalty(customerId);

      res.json({
        success: true,
        data: loyalty
      });
    } catch (error) {
      console.error('Error getting customer loyalty:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customer loyalty profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Enroll customer in loyalty program
   */
  async enrollCustomer(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { customerId } = req.params;
      const { programId } = req.body;

      const result = await loyaltyService.enrollCustomer(customerId, programId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error enrolling customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll customer in loyalty program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get customer loyalty rewards history
   */
  async getCustomerRewards(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const rewards = await loyaltyService.getCustomerRewards(
        customerId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: rewards
      });
    } catch (error) {
      console.error('Error getting customer rewards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customer rewards',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get customer redemption history
   */
  async getCustomerRedemptions(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const redemptions = await loyaltyService.getCustomerRedemptions(
        customerId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: redemptions
      });
    } catch (error) {
      console.error('Error getting customer redemptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customer redemptions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Redeem loyalty points
   */
  async redeemPoints(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { customerId } = req.params;
      const { pointsToRedeem, redemptionType, description, orderId, expiresAt } = req.body;

      const result = await loyaltyService.redeemPoints({
        customerId,
        pointsToRedeem,
        redemptionType,
        description,
        orderId,
        expiresAt
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error redeeming points:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to redeem points',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Award loyalty points for an order
   */
  async awardPointsForOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const result = await loyaltyService.awardPointsForOrder(orderId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error awarding points for order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to award points for order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Apply loyalty redemption to an order
   */
  async applyRedemptionToOrder(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { orderId } = req.params;
      const { redemptionId, customerId } = req.body;

      const result = await loyaltyService.applyRedemptionToOrder(
        orderId,
        redemptionId,
        customerId
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error applying redemption to order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply redemption to order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all loyalty programs
   */
  async getAllPrograms(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const programs = await loyaltyService.getAllPrograms(storeId);

      res.json({
        success: true,
        data: programs
      });
    } catch (error) {
      console.error('Error getting programs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get loyalty programs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new loyalty program
   */
  async createProgram(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { storeId } = req.user!;
      const programData = { ...req.body, storeId };

      const result = await loyaltyService.createProgram(programData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create loyalty program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update loyalty program
   */
  async updateProgram(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { programId } = req.params;
      const { storeId } = req.user!;

      const result = await loyaltyService.updateProgram(programId, req.body, storeId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error updating program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update loyalty program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete loyalty program
   */
  async deleteProgram(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const { storeId } = req.user!;

      const result = await loyaltyService.deleteProgram(programId, storeId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error deleting program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete loyalty program',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get program tiers
   */
  async getProgramTiers(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;

      const tiers = await loyaltyService.getProgramTiers(programId);

      res.json({
        success: true,
        data: tiers
      });
    } catch (error) {
      console.error('Error getting program tiers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get program tiers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new loyalty tier
   */
  async createTier(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { programId } = req.params;
      const tierData = { ...req.body, programId };

      const result = await loyaltyService.createTier(tierData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating tier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create loyalty tier',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update loyalty tier
   */
  async updateTier(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { tierId } = req.params;

      const result = await loyaltyService.updateTier(tierId, req.body);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error updating tier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update loyalty tier',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete loyalty tier
   */
  async deleteTier(req: Request, res: Response): Promise<void> {
    try {
      const { tierId } = req.params;

      const result = await loyaltyService.deleteTier(tierId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error deleting tier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete loyalty tier',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get active loyalty campaigns
   */
  async getActiveCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const campaigns = await loyaltyService.getActiveCampaigns(storeId);

      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active campaigns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all loyalty campaigns (admin)
   */
  async getAllCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const campaigns = await loyaltyService.getAllCampaigns(storeId);

      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get campaigns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new loyalty campaign
   */
  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { storeId } = req.user!;
      const campaignData = { ...req.body, storeId };

      const result = await loyaltyService.createCampaign(campaignData);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create loyalty campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update loyalty campaign
   */
  async updateCampaign(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { campaignId } = req.params;
      const { storeId } = req.user!;

      const result = await loyaltyService.updateCampaign(campaignId, req.body, storeId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update loyalty campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete loyalty campaign
   */
  async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const { storeId } = req.user!;

      const result = await loyaltyService.deleteCampaign(campaignId, storeId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete loyalty campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get loyalty program analytics overview
   */
  async getLoyaltyAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const { startDate, endDate, programId } = req.query;

      const analytics = await loyaltyService.getLoyaltyAnalytics(
        storeId,
        startDate as string,
        endDate as string,
        programId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting loyalty analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get loyalty analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get customer loyalty analytics
   */
  async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const { startDate, endDate, tierId } = req.query;

      const analytics = await loyaltyService.getCustomerAnalytics(
        storeId,
        startDate as string,
        endDate as string,
        tierId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customer analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get redemption analytics
   */
  async getRedemptionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.user!;
      const { startDate, endDate, programId } = req.query;

      const analytics = await loyaltyService.getRedemptionAnalytics(
        storeId,
        startDate as string,
        endDate as string,
        programId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting redemption analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get redemption analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const loyaltyController = new LoyaltyController();