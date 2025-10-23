/**
 * Loyalty Program API Service
 * Handles all loyalty-related API calls with proper error handling and TypeScript support
 */

import { apiService } from './api'
import type { ApiService } from './api'
import type { ApiResponse } from './api'

// Types for loyalty program entities
export interface LoyaltyCustomer {
  id: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  joinDate: string
  tier?: LoyaltyTier
}

export interface LoyaltyTier {
  id: string
  programId: string
  name: string
  minSpent: number
  minVisits: number
  pointsMultiplier: number
  discountPercent: number
  freeDelivery: boolean
  prioritySupport: boolean
  birthdayReward: number
  color?: string
  icon?: string
  description?: string
  benefits?: string[]
  sortOrder: number
}

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  pointsPerDollar: number
  dollarPerPoint: number
  minPointsRedeem: number
  maxPointsPerOrder?: number
  signupBonus: number
  birthdayBonus: number
  referralBonus: number
  pointsExpireDays?: number
  isActive: boolean
  startDate: string
  endDate?: string
  storeId: string
  tiers?: LoyaltyTier[]
  campaigns?: LoyaltyCampaign[]
}

export interface LoyaltyCampaign {
  id: string
  programId: string
  name: string
  description?: string
  type: 'DOUBLE_POINTS' | 'BONUS_POINTS' | 'CATEGORY_MULTIPLIER' | 'SPEND_THRESHOLD'
  pointsBonus: number
  multiplier: number
  minSpend?: number
  categoryId?: string
  menuItemId?: string
  maxRedemptions?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  storeId: string
}

export interface LoyaltyReward {
  id: string
  customerId: string
  type: string
  points: number
  value?: number
  orderId?: string
  campaignId?: string
  reason?: string
  description?: string
  expiresAt?: string
  isActive: boolean
  processedAt?: string
  createdAt: string
}

export interface LoyaltyRedemption {
  id: string
  customerId: string
  orderId?: string
  pointsUsed: number
  discountValue: number
  type: 'DISCOUNT' | 'FREE_ITEM' | 'PERCENTAGE_OFF'
  description: string
  status: 'PENDING' | 'APPLIED' | 'CANCELLED' | 'EXPIRED'
  appliedAt?: string
  expiresAt?: string
  createdAt: string
}

export interface CustomerLoyaltyProfile {
  customer: LoyaltyCustomer
  tierProgress?: {
    currentTier: LoyaltyTier
    nextTier?: LoyaltyTier
    progress: number
    remainingSpend: number
  }
  recentRewards: LoyaltyReward[]
  activeRedemptions: LoyaltyRedemption[]
}

export interface LoyaltyAnalytics {
  enrolledCustomers: number
  pointsIssued: number
  pointsRedeemed: number
  redemptionValue: number
  pointsOutstanding: number
}

export interface RedemptionRequest {
  pointsToRedeem: number
  redemptionType: 'DISCOUNT' | 'FREE_ITEM' | 'PERCENTAGE_OFF'
  description: string
  orderId?: string
  expiresAt?: string
}

class LoyaltyService {
  private api: ApiService

  constructor() {
    this.api = apiService
  }

  // Customer Loyalty Operations

  /**
   * Get customer loyalty profile
   */
  async getCustomerLoyalty(customerId: string): Promise<ApiResponse<CustomerLoyaltyProfile>> {
    return this.api.get(`/loyalty/customer/${customerId}`)
  }

  /**
   * Enroll customer in loyalty program
   */
  async enrollCustomer(customerId: string, programId?: string): Promise<ApiResponse<any>> {
    return this.api.post(`/loyalty/customer/${customerId}/join`, { programId })
  }

  /**
   * Get customer rewards history
   */
  async getCustomerRewards(
    customerId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<{ rewards: LoyaltyReward[], pagination: any }>> {
    return this.api.get(`/loyalty/customer/${customerId}/rewards`, {
      params: { limit, offset }
    })
  }

  /**
   * Get customer redemption history
   */
  async getCustomerRedemptions(
    customerId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<{ redemptions: LoyaltyRedemption[], pagination: any }>> {
    return this.api.get(`/loyalty/customer/${customerId}/redemptions`, {
      params: { limit, offset }
    })
  }

  /**
   * Redeem loyalty points
   */
  async redeemPoints(
    customerId: string,
    redemption: RedemptionRequest
  ): Promise<ApiResponse<{ redemption: LoyaltyRedemption, discountValue: number }>> {
    return this.api.post(`/loyalty/customer/${customerId}/redeem`, redemption)
  }

  // Order Integration

  /**
   * Award loyalty points for an order
   */
  async awardPointsForOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.api.post(`/loyalty/order/${orderId}/award-points`)
  }

  /**
   * Apply loyalty redemption to an order
   */
  async applyRedemptionToOrder(
    orderId: string,
    redemptionId: string,
    customerId: string
  ): Promise<ApiResponse<any>> {
    return this.api.post(`/loyalty/order/${orderId}/apply-redemption`, {
      redemptionId,
      customerId
    })
  }

  // Program Management (Admin)

  /**
   * Get all loyalty programs
   */
  async getAllPrograms(): Promise<ApiResponse<LoyaltyProgram[]>> {
    return this.api.get('/loyalty/programs')
  }

  /**
   * Create new loyalty program
   */
  async createProgram(program: Partial<LoyaltyProgram>): Promise<ApiResponse<LoyaltyProgram>> {
    return this.api.post('/loyalty/programs', program)
  }

  /**
   * Update loyalty program
   */
  async updateProgram(
    programId: string,
    program: Partial<LoyaltyProgram>
  ): Promise<ApiResponse<LoyaltyProgram>> {
    return this.api.put(`/loyalty/programs/${programId}`, program)
  }

  /**
   * Delete loyalty program
   */
  async deleteProgram(programId: string): Promise<ApiResponse<void>> {
    return this.api.delete(`/loyalty/programs/${programId}`)
  }

  // Tier Management

  /**
   * Get program tiers
   */
  async getProgramTiers(programId: string): Promise<ApiResponse<LoyaltyTier[]>> {
    return this.api.get(`/loyalty/programs/${programId}/tiers`)
  }

  /**
   * Create new loyalty tier
   */
  async createTier(programId: string, tier: Partial<LoyaltyTier>): Promise<ApiResponse<LoyaltyTier>> {
    return this.api.post(`/loyalty/programs/${programId}/tiers`, tier)
  }

  /**
   * Update loyalty tier
   */
  async updateTier(tierId: string, tier: Partial<LoyaltyTier>): Promise<ApiResponse<LoyaltyTier>> {
    return this.api.put(`/loyalty/tiers/${tierId}`, tier)
  }

  /**
   * Delete loyalty tier
   */
  async deleteTier(tierId: string): Promise<ApiResponse<void>> {
    return this.api.delete(`/loyalty/tiers/${tierId}`)
  }

  // Campaign Management

  /**
   * Get active loyalty campaigns
   */
  async getActiveCampaigns(): Promise<ApiResponse<LoyaltyCampaign[]>> {
    return this.api.get('/loyalty/campaigns')
  }

  /**
   * Get all loyalty campaigns (admin)
   */
  async getAllCampaigns(): Promise<ApiResponse<LoyaltyCampaign[]>> {
    return this.api.get('/loyalty/campaigns/all')
  }

  /**
   * Create new loyalty campaign
   */
  async createCampaign(campaign: Partial<LoyaltyCampaign>): Promise<ApiResponse<LoyaltyCampaign>> {
    return this.api.post('/loyalty/campaigns', campaign)
  }

  /**
   * Update loyalty campaign
   */
  async updateCampaign(
    campaignId: string,
    campaign: Partial<LoyaltyCampaign>
  ): Promise<ApiResponse<LoyaltyCampaign>> {
    return this.api.put(`/loyalty/campaigns/${campaignId}`, campaign)
  }

  /**
   * Delete loyalty campaign
   */
  async deleteCampaign(campaignId: string): Promise<ApiResponse<void>> {
    return this.api.delete(`/loyalty/campaigns/${campaignId}`)
  }

  // Analytics and Reporting

  /**
   * Get loyalty program analytics overview
   */
  async getLoyaltyAnalytics(
    startDate?: string,
    endDate?: string,
    programId?: string
  ): Promise<ApiResponse<LoyaltyAnalytics>> {
    return this.api.get('/loyalty/analytics/overview', {
      params: { startDate, endDate, programId }
    })
  }

  /**
   * Get customer loyalty analytics
   */
  async getCustomerAnalytics(
    startDate?: string,
    endDate?: string,
    tierId?: string
  ): Promise<ApiResponse<any>> {
    return this.api.get('/loyalty/analytics/customers', {
      params: { startDate, endDate, tierId }
    })
  }

  /**
   * Get redemption analytics
   */
  async getRedemptionAnalytics(
    startDate?: string,
    endDate?: string,
    programId?: string
  ): Promise<ApiResponse<any>> {
    return this.api.get('/loyalty/analytics/redemptions', {
      params: { startDate, endDate, programId }
    })
  }
}

export const loyaltyService = new LoyaltyService()