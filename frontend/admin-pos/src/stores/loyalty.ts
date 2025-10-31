/**
 * Loyalty Program Store - Comprehensive customer loyalty management
 * Handles enrollment, points, tiers, campaigns, and redemptions
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loyaltyApi } from '@/services/api-spring'
import type {
  LoyaltyProgram,
  LoyaltyTier,
  LoyaltyCustomer,
  LoyaltyCampaign,
  LoyaltyReward,
  LoyaltyRedemption
} from '@/services/loyalty'

export interface LoyaltyEnrollment {
  customerId: string
  customerName: string
  email: string
  phone: string
  enrolledAt: string
  points: number
  tier?: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
}

export interface PointsTransaction {
  id: string
  customerId: string
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'
  points: number
  balance: number
  orderId?: string
  campaignId?: string
  description: string
  createdAt: string
}

export interface LoyaltyAnalytics {
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  totalPointsExpired: number
  totalRedemptionValue: number
  averagePointsPerMember: number
  enrollmentRate: number
  redemptionRate: number
  membersByTier: Record<string, number>
  topMembers: Array<{
    customerId: string
    name: string
    points: number
    tier: string
    totalSpent: number
  }>
  recentTransactions: PointsTransaction[]
  campaignPerformance: Array<{
    campaignId: string
    name: string
    pointsIssued: number
    participations: number
    conversionRate: number
  }>
}

const unwrapResponse = <T = any>(response: any): T => (response?.data ?? response)

const extractArray = <T>(response: any, ...keys: string[]): T[] => {
  const data: any = unwrapResponse(response)

  if (Array.isArray(data)) {
    return data as T[]
  }

  for (const key of keys) {
    const value = data?.[key]
    if (Array.isArray(value)) {
      return value as T[]
    }
  }

  if (Array.isArray(data?.items)) {
    return data.items as T[]
  }

  if (Array.isArray(data?.content)) {
    return data.content as T[]
  }

  if (Array.isArray(data?.results)) {
    return data.results as T[]
  }

  return []
}

const extractValue = <T>(response: any, ...keys: string[]): T | undefined => {
  const data: any = unwrapResponse(response)

  for (const key of keys) {
    if (data?.[key] !== undefined) {
      return data[key] as T
    }

    if (data?.result?.[key] !== undefined) {
      return data.result[key] as T
    }

    if (data?.payload?.[key] !== undefined) {
      return data.payload[key] as T
    }
  }

  if (data !== undefined && data !== null) {
    return data as T
  }

  return undefined
}

const ensureNumber = (value: unknown, fallback = 0): number => {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
}

export const useLoyaltyStore = defineStore('loyalty', () => {
  // State
  const programs = ref<LoyaltyProgram[]>([])
  const customers = ref<LoyaltyEnrollment[]>([])
  const campaigns = ref<LoyaltyCampaign[]>([])
  const rewards = ref<LoyaltyReward[]>([])
  const redemptions = ref<LoyaltyRedemption[]>([])
  const pointsTransactions = ref<PointsTransaction[]>([])
  const analytics = ref<LoyaltyAnalytics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activePrograms = computed(() =>
    programs.value.filter(p => p.isActive)
  )

  const activeCustomers = computed(() =>
    customers.value.filter(c => c.status === 'ACTIVE')
  )

  const activeCampaigns = computed(() =>
    campaigns.value.filter(c => c.isActive && new Date(c.endDate) > new Date())
  )

  const defaultProgram = computed(() =>
    programs.value.find(p => p.isActive) || programs.value[0]
  )

  // Program Management
  const fetchPrograms = async (): Promise<boolean> => {
    isLoading.value = true
    try {
      const data = await loyaltyApi.getPrograms()
      programs.value = extractArray<LoyaltyProgram>(data, 'programs', 'data')
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const createProgram = async (program: Omit<LoyaltyProgram, 'id'>): Promise<LoyaltyProgram | null> => {
    try {
      const data = await loyaltyApi.createProgram(program)
      const newProgram =
        extractValue<LoyaltyProgram>(data, 'program') ?? unwrapResponse<LoyaltyProgram>(data)
      programs.value.push(newProgram)
      return newProgram
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updateProgram = async (programId: string, updates: Partial<LoyaltyProgram>): Promise<boolean> => {
    try {
      const updatedResponse = await loyaltyApi.updateProgram(programId, updates)
      const index = programs.value.findIndex(p => p.id === programId)
      if (index !== -1) {
        const updatedProgram = extractValue<LoyaltyProgram>(updatedResponse, 'program')
        programs.value[index] = {
          ...programs.value[index],
          ...updates,
          ...(updatedProgram ?? {})
        }
      }
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Customer Enrollment
  const enrollCustomer = async (customerData: {
    customerId: string
    customerName: string
    email: string
    phone: string
    programId?: string
  }): Promise<LoyaltyEnrollment | null> => {
    try {
      const data = await loyaltyApi.enrollCustomer(customerData.customerId, {
        customerName: customerData.customerName,
        email: customerData.email,
        phone: customerData.phone,
        programId: customerData.programId || defaultProgram.value?.id
      })

      const enrollment =
        extractValue<LoyaltyEnrollment>(data, 'enrollment', 'customer') ??
        unwrapResponse<LoyaltyEnrollment>(data)
      if (enrollment && enrollment.customerId) {
        customers.value.push(enrollment)
        return enrollment
      }
      throw new Error('Failed to enroll customer')
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const fetchCustomers = async (filters?: {
    status?: string
    tier?: string
    minPoints?: number
  }): Promise<boolean> => {
    isLoading.value = true
    try {
      const data = await loyaltyApi.getCustomers(filters)
      customers.value = extractArray<LoyaltyEnrollment>(data, 'customers', 'items')
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getCustomerDetails = async (customerId: string): Promise<any> => {
    try {
      const data = await loyaltyApi.getCustomerDetails(customerId)
      if (!data) {
        throw new Error('Failed to fetch customer')
      }
      const customer = extractValue<any>(data, 'customer', 'profile') ?? unwrapResponse(data)
      if (customer) {
        return customer
      }
      throw new Error('Failed to fetch customer')
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  // Points Management
  const awardPoints = async (customerId: string, points: number, reason: string, orderId?: string): Promise<boolean> => {
    try {
      const response = await loyaltyApi.awardPoints(customerId, {
        points,
        reason,
        orderId
      })

      const data = unwrapResponse(response)
      const transaction = extractValue<PointsTransaction>(data, 'transaction')
      if (transaction) {
        pointsTransactions.value.unshift(transaction)
      }

      const customer = customers.value.find(c => c.customerId === customerId)
      if (customer) {
        const rawBalance = data?.newBalance ?? data?.balance ?? transaction?.balance
        if (typeof rawBalance === 'number' && !Number.isNaN(rawBalance)) {
          customer.points = rawBalance
        } else {
          customer.points += points
        }
      }

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const redeemPoints = async (customerId: string, points: number, orderId?: string): Promise<{
    success: boolean
    discountValue?: number
    newBalance?: number
  }> => {
    try {
      const response = await loyaltyApi.redeemPoints(customerId, {
        points,
        orderId
      })

      const data = unwrapResponse(response)
      const transaction = extractValue<PointsTransaction>(data, 'transaction')
      if (transaction) {
        pointsTransactions.value.unshift(transaction)
      }

      const redemption = extractValue<LoyaltyRedemption>(data, 'redemption')
      if (redemption) {
        redemptions.value.unshift(redemption)
      }

      const rawBalance = data?.newBalance ?? data?.balance ?? redemption?.balance

      const customer = customers.value.find(c => c.customerId === customerId)
      if (customer) {
        if (typeof rawBalance === 'number' && !Number.isNaN(rawBalance)) {
          customer.points = rawBalance
        }
      }

      const discountValue = ensureNumber(data?.discountValue ?? redemption?.discountValue, 0)
      const newBalance = ensureNumber(rawBalance, customer?.points ?? 0)

      return { success: true, discountValue, newBalance }
    } catch (err: any) {
      error.value = err.message
      return { success: false }
    }
  }

  const adjustPoints = async (customerId: string, points: number, reason: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.adjustPoints({
        customerId,
        points,
        reason
      })

      const transaction = extractValue<PointsTransaction>(data, 'transaction')
      if (transaction) {
        pointsTransactions.value.unshift(transaction)
      }

      const customer = customers.value.find(c => c.customerId === customerId)
      if (customer) {
        const rawBalance = transaction?.balance ?? unwrapResponse(data)?.newBalance
        if (typeof rawBalance === 'number' && !Number.isNaN(rawBalance)) {
          customer.points = rawBalance
        } else {
          customer.points += points
        }
      }

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const fetchPointsHistory = async (customerId: string): Promise<PointsTransaction[]> => {
    try {
      const data = await loyaltyApi.getPointsHistory(customerId)
      return extractArray<PointsTransaction>(data, 'transactions', 'history')
    } catch (err: any) {
      error.value = err.message
      return []
    }
  }

  // Tier Management
  const createTier = async (programId: string, tier: Omit<LoyaltyTier, 'id' | 'programId'>): Promise<LoyaltyTier | null> => {
    try {
      const data = await loyaltyApi.createTier(programId, tier)

      const newTier = extractValue<LoyaltyTier>(data, 'tier') ?? unwrapResponse<LoyaltyTier>(data)
      const program = programs.value.find(p => p.id === programId)
      if (program) {
        if (!program.tiers) program.tiers = []
        program.tiers.push(newTier)
      }
      return newTier
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updateTier = async (tierId: string, updates: Partial<LoyaltyTier>): Promise<boolean> => {
    try {
      const data = await loyaltyApi.updateTier(tierId, updates)
      const updatedTier = extractValue<LoyaltyTier>(data, 'tier')

      programs.value.forEach(program => {
        if (program.tiers) {
          const index = program.tiers.findIndex(t => t.id === tierId)
          if (index !== -1) {
            program.tiers[index] = { ...program.tiers[index], ...updates, ...(updatedTier ?? {}) }
          }
        }
      })
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const deleteTier = async (tierId: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.deleteTier(tierId)
      const result = unwrapResponse(data)
      if (result?.success === false) {
        throw new Error('Failed to delete tier')
      }

      programs.value.forEach(program => {
        if (program.tiers) {
          program.tiers = program.tiers.filter(t => t.id !== tierId)
        }
      })
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Campaign Management
  const createCampaign = async (campaign: Omit<LoyaltyCampaign, 'id' | 'usageCount'>): Promise<LoyaltyCampaign | null> => {
    try {
      const data = await loyaltyApi.createCampaign(campaign)

      const newCampaign =
        extractValue<LoyaltyCampaign>(data, 'campaign') ?? unwrapResponse<LoyaltyCampaign>(data)
      campaigns.value.push(newCampaign)
      return newCampaign
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updateCampaign = async (campaignId: string, updates: Partial<LoyaltyCampaign>): Promise<boolean> => {
    try {
      const data = await loyaltyApi.updateCampaign(campaignId, updates)
      const index = campaigns.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        const updatedCampaign = extractValue<LoyaltyCampaign>(data, 'campaign')
        campaigns.value[index] = {
          ...campaigns.value[index],
          ...updates,
          ...(updatedCampaign ?? {})
        }
      }
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.deleteCampaign(campaignId)
      const result = unwrapResponse(data)
      if (result?.success === false) {
        throw new Error('Failed to delete campaign')
      }

      campaigns.value = campaigns.value.filter(c => c.id !== campaignId)
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const fetchCampaigns = async (): Promise<boolean> => {
    try {
      const data = await loyaltyApi.getCampaigns()

      campaigns.value = extractArray<LoyaltyCampaign>(data, 'campaigns', 'items')
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Analytics
  const fetchAnalytics = async (startDate?: string, endDate?: string): Promise<boolean> => {
    try {
      const params = {
        startDate,
        endDate
      }

      const [overviewResponse, customerResponse, redemptionResponse] = await Promise.all([
        loyaltyApi.getAnalyticsOverview(params),
        loyaltyApi.getCustomerAnalytics(params),
        loyaltyApi.getRedemptionAnalytics(params)
      ])

      const overview = extractValue<any>(overviewResponse, 'analytics', 'overview') || {}
      const customerStats = extractValue<any>(customerResponse, 'analytics', 'customers') || {}
      const redemptionStats = extractValue<any>(redemptionResponse, 'analytics', 'redemptions') || {}

      const customerTransactions = extractArray<PointsTransaction>(customerStats, 'recentTransactions')
      const overviewTransactions = extractArray<PointsTransaction>(overview, 'recentTransactions')
      const campaignPerformance = extractArray<any>(redemptionStats, 'campaignPerformance', 'campaigns')

      analytics.value = {
        totalMembers: ensureNumber(
          overview.totalMembers ?? overview.enrolledCustomers ?? overview.totalCustomers,
          0
        ),
        activeMembers: ensureNumber(overview.activeMembers ?? overview.activeCustomers, 0),
        totalPointsIssued: ensureNumber(overview.totalPointsIssued ?? overview.pointsIssued, 0),
        totalPointsRedeemed: ensureNumber(overview.totalPointsRedeemed ?? overview.pointsRedeemed, 0),
        totalPointsExpired: ensureNumber(overview.totalPointsExpired ?? overview.pointsExpired, 0),
        totalRedemptionValue: ensureNumber(
          overview.totalRedemptionValue ?? overview.redemptionValue ?? redemptionStats.totalRedemptionValue,
          0
        ),
        averagePointsPerMember: ensureNumber(
          overview.averagePointsPerMember ?? overview.avgPointsPerMember,
          0
        ),
        enrollmentRate: ensureNumber(overview.enrollmentRate, 0),
        redemptionRate: ensureNumber(overview.redemptionRate ?? redemptionStats.redemptionRate, 0),
        membersByTier: (overview.membersByTier ?? customerStats.membersByTier ?? {}) as Record<string, number>,
        topMembers: customerStats.topMembers ?? [],
        recentTransactions:
          customerTransactions.length > 0 ? customerTransactions : overviewTransactions,
        campaignPerformance
      }
      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Data Export
  const exportData = async (type: 'customers' | 'transactions' | 'campaigns', format: 'CSV' | 'EXCEL'): Promise<boolean> => {
    try {
      const response = await loyaltyApi.exportData(type, { format })
      const blobSource = response?.data ?? response
      const blob =
        blobSource instanceof Blob
          ? blobSource
          : new Blob([blobSource], {
              type:
                format === 'CSV'
                  ? 'text/csv'
                  : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `loyalty-${type}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
      link.click()
      URL.revokeObjectURL(url)

      return true
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Helper Functions
  const calculatePointsForOrder = (orderTotal: number): number => {
    if (!defaultProgram.value) return 0
    return Math.floor(orderTotal * defaultProgram.value.pointsPerDollar)
  }

  const calculateDiscountFromPoints = (points: number): number => {
    if (!defaultProgram.value) return 0
    return points * defaultProgram.value.dollarPerPoint
  }

  const canRedeemPoints = (customerId: string, points: number): boolean => {
    const customer = customers.value.find(c => c.customerId === customerId)
    if (!customer || !defaultProgram.value) return false

    return customer.points >= points && points >= defaultProgram.value.minPointsRedeem
  }

  return {
    // State
    programs,
    customers,
    campaigns,
    rewards,
    redemptions,
    pointsTransactions,
    analytics,
    isLoading,
    error,

    // Computed
    activePrograms,
    activeCustomers,
    activeCampaigns,
    defaultProgram,

    // Actions - Programs
    fetchPrograms,
    createProgram,
    updateProgram,

    // Actions - Enrollment
    enrollCustomer,
    fetchCustomers,
    getCustomerDetails,

    // Actions - Points
    awardPoints,
    redeemPoints,
    adjustPoints,
    fetchPointsHistory,

    // Actions - Tiers
    createTier,
    updateTier,
    deleteTier,

    // Actions - Campaigns
    createCampaign,
    updateCampaign,
    deleteCampaign,
    fetchCampaigns,

    // Actions - Analytics
    fetchAnalytics,

    // Actions - Export
    exportData,

    // Helpers
    calculatePointsForOrder,
    calculateDiscountFromPoints,
    canRedeemPoints
  }
})