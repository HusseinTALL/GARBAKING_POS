/**
 * Loyalty Program API Service
 * Handles all loyalty-related API calls with proper error handling and TypeScript support
 */

import { loyaltyApi } from './api-spring'

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

const unwrapData = <T = any>(response: any): T => (response?.data ?? response) as T

const arrayFrom = <T>(response: any, key: string): T[] => {
  const data = unwrapData(response)
  if (Array.isArray(data)) {
    return data as T[]
  }
  if (Array.isArray(data?.[key])) {
    return data[key] as T[]
  }
  if (Array.isArray(data?.result)) {
    return data.result as T[]
  }
  return []
}

const paginationFrom = (response: any, fallback: any = {}) => {
  const data = unwrapData(response)
  return data?.pagination ?? data?.meta ?? fallback
}

const valueFrom = <T>(response: any, key?: string): T => {
  const data = unwrapData(response)
  if (key) {
    if (data?.[key] !== undefined) {
      return data[key] as T
    }
    if (data?.profile?.[key] !== undefined) {
      return data.profile[key] as T
    }
    if (data?.result?.[key] !== undefined) {
      return data.result[key] as T
    }
  }
  return (data?.profile ?? data) as T
}

class LoyaltyService {
  async getCustomerLoyalty(customerId: string): Promise<CustomerLoyaltyProfile> {
    const response = await loyaltyApi.getCustomerDetails(customerId)
    const base = unwrapData(response)
    const profile = base?.profile ?? base
    const customer = (profile?.customer ?? base?.customer ?? profile) as LoyaltyCustomer

    return {
      customer,
      tierProgress: (profile?.tierProgress ?? base?.tierProgress) as CustomerLoyaltyProfile['tierProgress'],
      recentRewards: arrayFrom<LoyaltyReward>(profile, 'recentRewards'),
      activeRedemptions: arrayFrom<LoyaltyRedemption>(profile, 'activeRedemptions')
    }
  }

  async enrollCustomer(customerId: string, programId?: string) {
    const response = await loyaltyApi.enrollCustomer(customerId, { programId })
    return valueFrom(response, 'enrollment')
  }

  async getCustomerRewards(
    customerId: string,
    limit = 50,
    offset = 0
  ): Promise<{ rewards: LoyaltyReward[]; pagination: any }> {
    const response = await loyaltyApi.getCustomerRewards(customerId, { limit, offset })
    const rewards = arrayFrom<LoyaltyReward>(response, 'rewards')
    const pagination = paginationFrom(response, { limit, offset, total: rewards.length })
    return { rewards, pagination }
  }

  async getCustomerRedemptions(
    customerId: string,
    limit = 50,
    offset = 0
  ): Promise<{ redemptions: LoyaltyRedemption[]; pagination: any }> {
    const response = await loyaltyApi.getCustomerRedemptions(customerId, { limit, offset })
    const redemptions = arrayFrom<LoyaltyRedemption>(response, 'redemptions')
    const pagination = paginationFrom(response, { limit, offset, total: redemptions.length })
    return { redemptions, pagination }
  }

  async redeemPoints(
    customerId: string,
    redemption: RedemptionRequest
  ): Promise<{ redemption: LoyaltyRedemption; discountValue: number }> {
    const response = await loyaltyApi.redeemPoints(customerId, redemption)
    const data = unwrapData(response)
    const redemptionData = (data?.redemption ?? data) as LoyaltyRedemption
    const discountValue = data?.discountValue ?? redemptionData?.discountValue ?? 0
    return { redemption: redemptionData, discountValue }
  }

  async awardPointsForOrder(orderId: string) {
    return unwrapData(await loyaltyApi.awardPointsForOrder(orderId))
  }

  async applyRedemptionToOrder(orderId: string, redemptionId: string, customerId: string) {
    return unwrapData(
      await loyaltyApi.applyRedemption(orderId, {
        redemptionId,
        customerId
      })
    )
  }

  async awardPoints(customerId: string, payload: any) {
    return unwrapData(await loyaltyApi.awardPoints(customerId, payload))
  }

  async getAllPrograms(): Promise<LoyaltyProgram[]> {
    return arrayFrom<LoyaltyProgram>(await loyaltyApi.getPrograms(), 'programs')
  }

  async createProgram(program: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    return valueFrom<LoyaltyProgram>(await loyaltyApi.createProgram(program), 'program')
  }

  async updateProgram(programId: string, program: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    return valueFrom<LoyaltyProgram>(await loyaltyApi.updateProgram(programId, program), 'program')
  }

  async deleteProgram(programId: string): Promise<void> {
    await loyaltyApi.deleteProgram(programId)
  }

  async getProgramTiers(programId: string): Promise<LoyaltyTier[]> {
    return arrayFrom<LoyaltyTier>(await loyaltyApi.getProgramTiers(programId), 'tiers')
  }

  async createTier(programId: string, tier: Partial<LoyaltyTier>): Promise<LoyaltyTier> {
    return valueFrom<LoyaltyTier>(await loyaltyApi.createTier(programId, tier), 'tier')
  }

  async updateTier(tierId: string, tier: Partial<LoyaltyTier>): Promise<LoyaltyTier> {
    return valueFrom<LoyaltyTier>(await loyaltyApi.updateTier(tierId, tier), 'tier')
  }

  async deleteTier(tierId: string): Promise<void> {
    await loyaltyApi.deleteTier(tierId)
  }

  async getActiveCampaigns(): Promise<LoyaltyCampaign[]> {
    return arrayFrom<LoyaltyCampaign>(await loyaltyApi.getCampaigns(), 'campaigns')
  }

  async getAllCampaigns(): Promise<LoyaltyCampaign[]> {
    return arrayFrom<LoyaltyCampaign>(await loyaltyApi.getAllCampaigns(), 'campaigns')
  }

  async createCampaign(campaign: Partial<LoyaltyCampaign>): Promise<LoyaltyCampaign> {
    return valueFrom<LoyaltyCampaign>(await loyaltyApi.createCampaign(campaign), 'campaign')
  }

  async updateCampaign(campaignId: string, campaign: Partial<LoyaltyCampaign>): Promise<LoyaltyCampaign> {
    return valueFrom<LoyaltyCampaign>(await loyaltyApi.updateCampaign(campaignId, campaign), 'campaign')
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await loyaltyApi.deleteCampaign(campaignId)
  }

  async getLoyaltyAnalytics(
    startDate?: string,
    endDate?: string,
    programId?: string
  ): Promise<LoyaltyAnalytics> {
    return valueFrom<LoyaltyAnalytics>(
      await loyaltyApi.getAnalyticsOverview({ startDate, endDate, programId }),
      'analytics'
    )
  }

  async getCustomerAnalytics(
    startDate?: string,
    endDate?: string,
    tierId?: string
  ): Promise<any> {
    return valueFrom(await loyaltyApi.getCustomerAnalytics({ startDate, endDate, tierId }), 'analytics')
  }

  async getRedemptionAnalytics(
    startDate?: string,
    endDate?: string,
    programId?: string
  ): Promise<any> {
    return valueFrom(await loyaltyApi.getRedemptionAnalytics({ startDate, endDate, programId }), 'analytics')
  }

  async getAllRewards(params?: { type?: string; limit?: number; offset?: number }): Promise<{ rewards: LoyaltyReward[]; pagination: any }> {
    const response = await loyaltyApi.getAllRewards(params)
    const rewards = arrayFrom<LoyaltyReward>(response, 'rewards')
    const pagination = paginationFrom(response, {
      limit: params?.limit ?? rewards.length,
      offset: params?.offset ?? 0,
      total: rewards.length
    })
    return { rewards, pagination }
  }

  async reverseReward(rewardId: string) {
    return unwrapData(await loyaltyApi.reverseReward(rewardId))
  }

  async getAllRedemptions(params?: { status?: string; limit?: number; offset?: number }): Promise<{ redemptions: LoyaltyRedemption[]; pagination: any }> {
    const response = await loyaltyApi.getAllRedemptions(params)
    const redemptions = arrayFrom<LoyaltyRedemption>(response, 'redemptions')
    const pagination = paginationFrom(response, {
      limit: params?.limit ?? redemptions.length,
      offset: params?.offset ?? 0,
      total: redemptions.length
    })
    return { redemptions, pagination }
  }

  async updateRedemptionStatus(redemptionId: string, status: string): Promise<LoyaltyRedemption> {
    return valueFrom<LoyaltyRedemption>(await loyaltyApi.updateRedemptionStatus(redemptionId, status), 'redemption')
  }
}

export const loyaltyService = new LoyaltyService()
