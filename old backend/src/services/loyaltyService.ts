/**
 * Loyalty Program Service
 * Handles loyalty program business logic, point calculations, tier management, and reward processing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LoyaltyResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface RedemptionRequest {
  customerId: string;
  pointsToRedeem: number;
  redemptionType: 'DISCOUNT' | 'FREE_ITEM' | 'PERCENTAGE_OFF';
  description: string;
  orderId?: string;
  expiresAt?: string;
}

export interface ProgramData {
  name: string;
  description?: string;
  pointsPerDollar: number;
  dollarPerPoint: number;
  minPointsRedeem: number;
  maxPointsPerOrder?: number;
  signupBonus?: number;
  birthdayBonus?: number;
  referralBonus?: number;
  pointsExpireDays?: number;
  startDate?: string;
  endDate?: string;
  storeId: string;
}

export interface TierData {
  programId: string;
  name: string;
  minSpent: number;
  minVisits?: number;
  pointsMultiplier: number;
  discountPercent?: number;
  freeDelivery?: boolean;
  prioritySupport?: boolean;
  birthdayReward?: number;
  color?: string;
  icon?: string;
  description?: string;
  benefits?: string[];
  sortOrder?: number;
}

export interface CampaignData {
  programId: string;
  name: string;
  description?: string;
  type: 'DOUBLE_POINTS' | 'BONUS_POINTS' | 'CATEGORY_MULTIPLIER' | 'SPEND_THRESHOLD';
  pointsBonus?: number;
  multiplier?: number;
  minSpend?: number;
  categoryId?: string;
  menuItemId?: string;
  maxRedemptions?: number;
  startDate: string;
  endDate: string;
  storeId: string;
}

class LoyaltyService {
  /**
   * Get customer loyalty profile
   */
  async getCustomerLoyalty(customerId: string): Promise<any> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyaltyTier: {
          include: {
            program: true
          }
        },
        loyaltyRewards: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        loyaltyRedemptions: {
          where: { status: { in: ['PENDING', 'APPLIED'] } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate tier progress
    let tierProgress = null;
    if (customer.loyaltyTier) {
      const nextTier = await prisma.loyaltyTier.findFirst({
        where: {
          programId: customer.loyaltyTier.programId,
          minSpent: { gt: customer.totalSpent },
          isActive: true
        },
        orderBy: { minSpent: 'asc' }
      });

      if (nextTier) {
        tierProgress = {
          currentTier: customer.loyaltyTier,
          nextTier,
          progress: (customer.totalSpent / nextTier.minSpent) * 100,
          remainingSpend: nextTier.minSpent - customer.totalSpent
        };
      }
    }

    return {
      customer: {
        id: customer.id,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
        visitCount: customer.visitCount,
        joinDate: customer.joinDate,
        tier: customer.loyaltyTier
      },
      tierProgress,
      recentRewards: customer.loyaltyRewards,
      activeRedemptions: customer.loyaltyRedemptions
    };
  }

  /**
   * Enroll customer in loyalty program
   */
  async enrollCustomer(customerId: string, programId?: string): Promise<LoyaltyResponse> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        return { success: false, message: 'Customer not found' };
      }

      if (customer.loyaltyTierId) {
        return { success: false, message: 'Customer is already enrolled in a loyalty program' };
      }

      // Get default program if not specified
      let program;
      if (programId) {
        program = await prisma.loyaltyProgram.findUnique({
          where: { id: programId, isActive: true }
        });
      } else {
        program = await prisma.loyaltyProgram.findFirst({
          where: { storeId: customer.storeId, isActive: true }
        });
      }

      if (!program) {
        return { success: false, message: 'No active loyalty program found' };
      }

      // Get the entry-level tier (lowest minSpent)
      const entryTier = await prisma.loyaltyTier.findFirst({
        where: { programId: program.id, isActive: true },
        orderBy: { minSpent: 'asc' }
      });

      if (!entryTier) {
        return { success: false, message: 'No loyalty tiers configured for this program' };
      }

      // Update customer with loyalty tier and award signup bonus
      const updatedCustomer = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyTierId: entryTier.id,
            loyaltyPoints: { increment: program.signupBonus },
            joinDate: new Date()
          }
        });

        // Create signup bonus reward record
        if (program.signupBonus > 0) {
          await tx.loyaltyReward.create({
            data: {
              customerId,
              type: 'SIGNUP_BONUS',
              points: program.signupBonus,
              reason: 'Loyalty program signup bonus',
              description: `Welcome bonus: ${program.signupBonus} points`,
              processedAt: new Date()
            }
          });
        }

        return customer;
      });

      return {
        success: true,
        message: 'Customer successfully enrolled in loyalty program',
        data: {
          customer: updatedCustomer,
          tier: entryTier,
          signupBonus: program.signupBonus
        }
      };
    } catch (error) {
      console.error('Error enrolling customer:', error);
      return { success: false, message: 'Failed to enroll customer in loyalty program' };
    }
  }

  /**
   * Get customer rewards history
   */
  async getCustomerRewards(customerId: string, limit: number = 50, offset: number = 0): Promise<any> {
    const rewards = await prisma.loyaltyReward.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.loyaltyReward.count({
      where: { customerId }
    });

    return {
      rewards,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Get customer redemption history
   */
  async getCustomerRedemptions(customerId: string, limit: number = 50, offset: number = 0): Promise<any> {
    const redemptions = await prisma.loyaltyRedemption.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.loyaltyRedemption.count({
      where: { customerId }
    });

    return {
      redemptions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Redeem loyalty points
   */
  async redeemPoints(request: RedemptionRequest): Promise<LoyaltyResponse> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: request.customerId },
        include: { loyaltyTier: { include: { program: true } } }
      });

      if (!customer) {
        return { success: false, message: 'Customer not found' };
      }

      if (!customer.loyaltyTier) {
        return { success: false, message: 'Customer is not enrolled in a loyalty program' };
      }

      const program = customer.loyaltyTier.program;

      // Check if customer has enough points
      if (customer.loyaltyPoints < request.pointsToRedeem) {
        return { success: false, message: 'Insufficient loyalty points' };
      }

      // Check minimum redemption requirement
      if (request.pointsToRedeem < program.minPointsRedeem) {
        return { success: false, message: `Minimum redemption is ${program.minPointsRedeem} points` };
      }

      // Check maximum points per order if applicable
      if (program.maxPointsPerOrder && request.pointsToRedeem > program.maxPointsPerOrder) {
        return { success: false, message: `Maximum redemption per order is ${program.maxPointsPerOrder} points` };
      }

      // Calculate redemption value
      const discountValue = request.pointsToRedeem * program.dollarPerPoint;

      // Create redemption record and deduct points
      const redemption = await prisma.$transaction(async (tx) => {
        // Deduct points from customer
        await tx.customer.update({
          where: { id: request.customerId },
          data: { loyaltyPoints: { decrement: request.pointsToRedeem } }
        });

        // Create redemption record
        const redemption = await tx.loyaltyRedemption.create({
          data: {
            customerId: request.customerId,
            orderId: request.orderId,
            pointsUsed: request.pointsToRedeem,
            discountValue,
            type: request.redemptionType,
            description: request.description,
            status: 'PENDING',
            expiresAt: request.expiresAt ? new Date(request.expiresAt) : undefined
          }
        });

        // Create reward record for tracking
        await tx.loyaltyReward.create({
          data: {
            customerId: request.customerId,
            type: 'POINTS_REDEEMED',
            points: -request.pointsToRedeem,
            value: discountValue,
            orderId: request.orderId,
            reason: 'Points redemption',
            description: request.description,
            processedAt: new Date()
          }
        });

        return redemption;
      });

      return {
        success: true,
        message: 'Points redeemed successfully',
        data: { redemption, discountValue }
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      return { success: false, message: 'Failed to redeem points' };
    }
  }

  /**
   * Award loyalty points for an order
   */
  async awardPointsForOrder(orderId: string): Promise<LoyaltyResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            include: { loyaltyTier: { include: { program: true } } }
          },
          orderItems: {
            include: { menuItem: { include: { category: true } } }
          }
        }
      });

      if (!order || !order.customer) {
        return { success: false, message: 'Order or customer not found' };
      }

      if (!order.customer.loyaltyTier) {
        return { success: false, message: 'Customer is not enrolled in a loyalty program' };
      }

      const program = order.customer.loyaltyTier.program;
      const tier = order.customer.loyaltyTier;

      // Calculate base points (order total * points per dollar * tier multiplier)
      let basePoints = Math.floor(order.total * program.pointsPerDollar * tier.pointsMultiplier);

      // Check for active campaigns that apply to this order
      const campaigns = await this.getApplicableCampaigns(order, program.id);
      let campaignBonus = 0;
      let campaignUsages: any[] = [];

      for (const campaign of campaigns) {
        let bonusPoints = 0;

        switch (campaign.type) {
          case 'DOUBLE_POINTS':
            bonusPoints = basePoints; // Double the base points
            break;
          case 'BONUS_POINTS':
            bonusPoints = campaign.pointsBonus;
            break;
          case 'CATEGORY_MULTIPLIER':
            // Apply multiplier to items in specific category
            const categoryItems = order.orderItems.filter(
              item => item.menuItem.categoryId === campaign.categoryId
            );
            const categoryTotal = categoryItems.reduce(
              (sum, item) => sum + item.totalPrice, 0
            );
            bonusPoints = Math.floor(categoryTotal * program.pointsPerDollar * (campaign.multiplier - 1));
            break;
          case 'SPEND_THRESHOLD':
            if (order.total >= (campaign.minSpend || 0)) {
              bonusPoints = campaign.pointsBonus;
            }
            break;
        }

        if (bonusPoints > 0) {
          campaignBonus += bonusPoints;
          campaignUsages.push({
            campaignId: campaign.id,
            customerId: order.customerId,
            orderId: order.id,
            pointsAwarded: bonusPoints
          });
        }
      }

      const totalPoints = basePoints + campaignBonus;

      // Update customer points and create reward records
      const result = await prisma.$transaction(async (tx) => {
        // Update customer points, total spent, and visit count
        const updatedCustomer = await tx.customer.update({
          where: { id: order.customerId! },
          data: {
            loyaltyPoints: { increment: totalPoints },
            totalSpent: { increment: order.total },
            visitCount: { increment: 1 },
            lastVisit: new Date()
          }
        });

        // Create base points reward record
        await tx.loyaltyReward.create({
          data: {
            customerId: order.customerId!,
            type: 'POINTS_EARNED',
            points: basePoints,
            value: order.total,
            orderId: order.id,
            reason: 'Order purchase',
            description: `Earned ${basePoints} points for order #${order.orderNumber}`,
            processedAt: new Date()
          }
        });

        // Create campaign bonus records and usage tracking
        for (const usage of campaignUsages) {
          await tx.loyaltyReward.create({
            data: {
              customerId: usage.customerId,
              type: 'CAMPAIGN_BONUS',
              points: usage.pointsAwarded,
              orderId: usage.orderId,
              campaignId: usage.campaignId,
              reason: 'Campaign bonus',
              description: `Bonus points from campaign`,
              processedAt: new Date()
            }
          });

          await tx.loyaltyCampaignUsage.create({
            data: {
              campaignId: usage.campaignId,
              customerId: usage.customerId,
              orderId: usage.orderId,
              pointsAwarded: usage.pointsAwarded
            }
          });

          // Update campaign usage count
          await tx.loyaltyCampaign.update({
            where: { id: usage.campaignId },
            data: { usageCount: { increment: 1 } }
          });
        }

        // Check if customer should be upgraded to a new tier
        const newTier = await this.checkTierUpgrade(tx, updatedCustomer.id, updatedCustomer.totalSpent);

        return { updatedCustomer, newTier, totalPoints, basePoints, campaignBonus };
      });

      return {
        success: true,
        message: 'Loyalty points awarded successfully',
        data: result
      };
    } catch (error) {
      console.error('Error awarding points for order:', error);
      return { success: false, message: 'Failed to award loyalty points' };
    }
  }

  /**
   * Apply loyalty redemption to an order
   */
  async applyRedemptionToOrder(orderId: string, redemptionId: string, customerId: string): Promise<LoyaltyResponse> {
    try {
      const redemption = await prisma.loyaltyRedemption.findUnique({
        where: { id: redemptionId }
      });

      if (!redemption) {
        return { success: false, message: 'Redemption not found' };
      }

      if (redemption.customerId !== customerId) {
        return { success: false, message: 'Redemption does not belong to this customer' };
      }

      if (redemption.status !== 'PENDING') {
        return { success: false, message: 'Redemption is not available for use' };
      }

      if (redemption.expiresAt && redemption.expiresAt < new Date()) {
        return { success: false, message: 'Redemption has expired' };
      }

      // Apply redemption to order
      const result = await prisma.$transaction(async (tx) => {
        // Update redemption status
        const updatedRedemption = await tx.loyaltyRedemption.update({
          where: { id: redemptionId },
          data: {
            orderId,
            status: 'APPLIED',
            appliedAt: new Date()
          }
        });

        // Update order with discount
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            discount: { increment: redemption.discountValue },
            discountType: 'LOYALTY',
            discountReason: redemption.description,
            total: { decrement: redemption.discountValue }
          }
        });

        return { updatedRedemption, updatedOrder };
      });

      return {
        success: true,
        message: 'Redemption applied to order successfully',
        data: result
      };
    } catch (error) {
      console.error('Error applying redemption to order:', error);
      return { success: false, message: 'Failed to apply redemption to order' };
    }
  }

  /**
   * Get applicable campaigns for an order
   */
  private async getApplicableCampaigns(order: any, programId: string): Promise<any[]> {
    const now = new Date();

    return await prisma.loyaltyCampaign.findMany({
      where: {
        programId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { maxRedemptions: null },
          { usageCount: { lt: prisma.loyaltyCampaign.fields.maxRedemptions } }
        ]
      }
    });
  }

  /**
   * Check and upgrade customer tier if eligible
   */
  private async checkTierUpgrade(tx: any, customerId: string, totalSpent: number): Promise<any> {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      include: { loyaltyTier: true }
    });

    if (!customer || !customer.loyaltyTier) return null;

    const higherTier = await tx.loyaltyTier.findFirst({
      where: {
        programId: customer.loyaltyTier.programId,
        minSpent: { lte: totalSpent },
        sortOrder: { gt: customer.loyaltyTier.sortOrder },
        isActive: true
      },
      orderBy: { sortOrder: 'desc' }
    });

    if (higherTier) {
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyTierId: higherTier.id }
      });

      // Create tier upgrade reward
      await tx.loyaltyReward.create({
        data: {
          customerId,
          type: 'TIER_BONUS',
          points: 0,
          reason: 'Tier upgrade',
          description: `Upgraded to ${higherTier.name} tier`,
          processedAt: new Date()
        }
      });

      return higherTier;
    }

    return null;
  }

  /**
   * Get all loyalty programs for a store
   */
  async getAllPrograms(storeId: string): Promise<any[]> {
    return await prisma.loyaltyProgram.findMany({
      where: { storeId },
      include: {
        tiers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        campaigns: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create new loyalty program
   */
  async createProgram(data: ProgramData): Promise<LoyaltyResponse> {
    try {
      const program = await prisma.loyaltyProgram.create({
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });

      return {
        success: true,
        message: 'Loyalty program created successfully',
        data: program
      };
    } catch (error) {
      console.error('Error creating program:', error);
      return { success: false, message: 'Failed to create loyalty program' };
    }
  }

  /**
   * Update loyalty program
   */
  async updateProgram(programId: string, data: Partial<ProgramData>, storeId: string): Promise<LoyaltyResponse> {
    try {
      const program = await prisma.loyaltyProgram.findFirst({
        where: { id: programId, storeId }
      });

      if (!program) {
        return { success: false, message: 'Program not found' };
      }

      const updatedProgram = await prisma.loyaltyProgram.update({
        where: { id: programId },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });

      return {
        success: true,
        message: 'Loyalty program updated successfully',
        data: updatedProgram
      };
    } catch (error) {
      console.error('Error updating program:', error);
      return { success: false, message: 'Failed to update loyalty program' };
    }
  }

  /**
   * Delete loyalty program
   */
  async deleteProgram(programId: string, storeId: string): Promise<LoyaltyResponse> {
    try {
      const program = await prisma.loyaltyProgram.findFirst({
        where: { id: programId, storeId }
      });

      if (!program) {
        return { success: false, message: 'Program not found' };
      }

      // Check if program has active customers
      const customerCount = await prisma.customer.count({
        where: {
          loyaltyTier: {
            programId: programId
          }
        }
      });

      if (customerCount > 0) {
        return { success: false, message: 'Cannot delete program with active customers' };
      }

      await prisma.loyaltyProgram.delete({
        where: { id: programId }
      });

      return {
        success: true,
        message: 'Loyalty program deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting program:', error);
      return { success: false, message: 'Failed to delete loyalty program' };
    }
  }

  /**
   * Get program tiers
   */
  async getProgramTiers(programId: string): Promise<any[]> {
    return await prisma.loyaltyTier.findMany({
      where: { programId, isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  /**
   * Create new loyalty tier
   */
  async createTier(data: TierData): Promise<LoyaltyResponse> {
    try {
      const tier = await prisma.loyaltyTier.create({
        data: {
          ...data,
          benefits: data.benefits ? JSON.stringify(data.benefits) : undefined
        }
      });

      return {
        success: true,
        message: 'Loyalty tier created successfully',
        data: tier
      };
    } catch (error) {
      console.error('Error creating tier:', error);
      return { success: false, message: 'Failed to create loyalty tier' };
    }
  }

  /**
   * Update loyalty tier
   */
  async updateTier(tierId: string, data: Partial<TierData>): Promise<LoyaltyResponse> {
    try {
      const tier = await prisma.loyaltyTier.findUnique({
        where: { id: tierId }
      });

      if (!tier) {
        return { success: false, message: 'Tier not found' };
      }

      const updatedTier = await prisma.loyaltyTier.update({
        where: { id: tierId },
        data: {
          ...data,
          benefits: data.benefits ? JSON.stringify(data.benefits) : undefined
        }
      });

      return {
        success: true,
        message: 'Loyalty tier updated successfully',
        data: updatedTier
      };
    } catch (error) {
      console.error('Error updating tier:', error);
      return { success: false, message: 'Failed to update loyalty tier' };
    }
  }

  /**
   * Delete loyalty tier
   */
  async deleteTier(tierId: string): Promise<LoyaltyResponse> {
    try {
      const tier = await prisma.loyaltyTier.findUnique({
        where: { id: tierId }
      });

      if (!tier) {
        return { success: false, message: 'Tier not found' };
      }

      // Check if tier has active customers
      const customerCount = await prisma.customer.count({
        where: { loyaltyTierId: tierId }
      });

      if (customerCount > 0) {
        return { success: false, message: 'Cannot delete tier with active customers' };
      }

      await prisma.loyaltyTier.delete({
        where: { id: tierId }
      });

      return {
        success: true,
        message: 'Loyalty tier deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting tier:', error);
      return { success: false, message: 'Failed to delete loyalty tier' };
    }
  }

  /**
   * Get active campaigns for a store
   */
  async getActiveCampaigns(storeId: string): Promise<any[]> {
    const now = new Date();

    return await prisma.loyaltyCampaign.findMany({
      where: {
        storeId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        program: true,
        category: true,
        menuItem: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get all campaigns for a store (admin)
   */
  async getAllCampaigns(storeId: string): Promise<any[]> {
    return await prisma.loyaltyCampaign.findMany({
      where: { storeId },
      include: {
        program: true,
        category: true,
        menuItem: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create new loyalty campaign
   */
  async createCampaign(data: CampaignData): Promise<LoyaltyResponse> {
    try {
      const campaign = await prisma.loyaltyCampaign.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate)
        }
      });

      return {
        success: true,
        message: 'Loyalty campaign created successfully',
        data: campaign
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, message: 'Failed to create loyalty campaign' };
    }
  }

  /**
   * Update loyalty campaign
   */
  async updateCampaign(campaignId: string, data: Partial<CampaignData>, storeId: string): Promise<LoyaltyResponse> {
    try {
      const campaign = await prisma.loyaltyCampaign.findFirst({
        where: { id: campaignId, storeId }
      });

      if (!campaign) {
        return { success: false, message: 'Campaign not found' };
      }

      const updatedCampaign = await prisma.loyaltyCampaign.update({
        where: { id: campaignId },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });

      return {
        success: true,
        message: 'Loyalty campaign updated successfully',
        data: updatedCampaign
      };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return { success: false, message: 'Failed to update loyalty campaign' };
    }
  }

  /**
   * Delete loyalty campaign
   */
  async deleteCampaign(campaignId: string, storeId: string): Promise<LoyaltyResponse> {
    try {
      const campaign = await prisma.loyaltyCampaign.findFirst({
        where: { id: campaignId, storeId }
      });

      if (!campaign) {
        return { success: false, message: 'Campaign not found' };
      }

      await prisma.loyaltyCampaign.delete({
        where: { id: campaignId }
      });

      return {
        success: true,
        message: 'Loyalty campaign deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return { success: false, message: 'Failed to delete loyalty campaign' };
    }
  }

  /**
   * Get loyalty program analytics overview
   */
  async getLoyaltyAnalytics(storeId: string, startDate?: string, endDate?: string, programId?: string): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = { storeId };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    const programFilter: any = programId ? { programId } : {};

    // Get total enrolled customers
    const enrolledCustomers = await prisma.customer.count({
      where: {
        storeId,
        loyaltyTierId: { not: null }
      }
    });

    // Get points issued and redeemed
    const pointsIssued = await prisma.loyaltyReward.aggregate({
      where: {
        customer: { storeId },
        type: { in: ['POINTS_EARNED', 'SIGNUP_BONUS', 'BIRTHDAY_BONUS', 'CAMPAIGN_BONUS', 'TIER_BONUS'] },
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      },
      _sum: { points: true }
    });

    const pointsRedeemed = await prisma.loyaltyRedemption.aggregate({
      where: {
        customer: { storeId },
        status: { in: ['APPLIED', 'PENDING'] },
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      },
      _sum: { pointsUsed: true }
    });

    // Get redemption value
    const redemptionValue = await prisma.loyaltyRedemption.aggregate({
      where: {
        customer: { storeId },
        status: 'APPLIED',
        ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {})
      },
      _sum: { discountValue: true }
    });

    return {
      enrolledCustomers,
      pointsIssued: pointsIssued._sum.points || 0,
      pointsRedeemed: pointsRedeemed._sum.pointsUsed || 0,
      redemptionValue: redemptionValue._sum.discountValue || 0,
      pointsOutstanding: (pointsIssued._sum.points || 0) - (pointsRedeemed._sum.pointsUsed || 0)
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(storeId: string, startDate?: string, endDate?: string, tierId?: string): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = { storeId };
    if (tierId) whereClause.loyaltyTierId = tierId;

    // Get customer distribution by tier
    const tierDistribution = await prisma.customer.groupBy({
      by: ['loyaltyTierId'],
      where: whereClause,
      _count: true
    });

    // Get average spend and visit frequency
    const customerStats = await prisma.customer.aggregate({
      where: whereClause,
      _avg: {
        totalSpent: true,
        visitCount: true,
        loyaltyPoints: true
      }
    });

    return {
      tierDistribution,
      averageSpend: customerStats._avg.totalSpent || 0,
      averageVisits: customerStats._avg.visitCount || 0,
      averagePoints: customerStats._avg.loyaltyPoints || 0
    };
  }

  /**
   * Get redemption analytics
   */
  async getRedemptionAnalytics(storeId: string, startDate?: string, endDate?: string, programId?: string): Promise<any> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = {
      customer: { storeId }
    };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    // Get redemption stats by type
    const redemptionsByType = await prisma.loyaltyRedemption.groupBy({
      by: ['type'],
      where: whereClause,
      _count: true,
      _sum: {
        pointsUsed: true,
        discountValue: true
      }
    });

    // Get redemption trends over time
    const redemptionTrends = await prisma.loyaltyRedemption.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: true,
      _sum: {
        pointsUsed: true,
        discountValue: true
      }
    });

    return {
      redemptionsByType,
      redemptionTrends
    };
  }
}

export const loyaltyService = new LoyaltyService();