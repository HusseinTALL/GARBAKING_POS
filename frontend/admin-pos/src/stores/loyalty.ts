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
      programs.value = data.programs || data || []
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
      const newProgram = data.program || data
      programs.value.push(newProgram)
      return newProgram
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updateProgram = async (programId: string, updates: Partial<LoyaltyProgram>): Promise<boolean> => {
    try {
      await loyaltyApi.updateProgram(programId, updates)
      const index = programs.value.findIndex(p => p.id === programId)
      if (index !== -1) {
        programs.value[index] = { ...programs.value[index], ...updates }
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
      const data = await loyaltyApi.enrollCustomer({
        ...customerData,
        programId: customerData.programId || defaultProgram.value?.id
      })

      const enrollment = data.enrollment || data
      customers.value.push(enrollment)
      return enrollment
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
      
        customers.value = data.customers || data || []
        return true
}
      throw new Error('Failed to fetch customers')
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
      
        return data.customer || data
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
      const data = await loyaltyApi.awardPoints(', {
        customerId,
        points,
        reason,
        orderId
})

      
        const transaction = data.transaction || data
        pointsTransactions.value.unshift(transaction)

        // Update customer points
        const customer = customers.value.find(c => c.customerId === customerId)
        if (customer) {
          customer.points += points
  }

        return true
}
      throw new Error('Failed to award points')
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
      const data = await loyaltyApi.redeemPoints(', {
        customerId,
        points,
        orderId
})

      
        const { discountValue, newBalance, transaction, redemption } = data

        pointsTransactions.value.unshift(transaction)
        redemptions.value.unshift(redemption)

        // Update customer points
        const customer = customers.value.find(c => c.customerId === customerId)
        if (customer) {
          customer.points = newBalance
  }

        return { success: true, discountValue, newBalance }
}
      throw new Error('Failed to redeem points')
    } catch (err: any) {
      error.value = err.message
      return { success: false }
    }
  }

  const adjustPoints = async (customerId: string, points: number, reason: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.adjustPoints(', {
        customerId,
        points,
        reason
})

      
        const transaction = data.transaction || data
        pointsTransactions.value.unshift(transaction)

        const customer = customers.value.find(c => c.customerId === customerId)
        if (customer) {
          customer.points = transaction.balance
  }

        return true
}
      throw new Error('Failed to adjust points')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const fetchPointsHistory = async (customerId: string): Promise<PointsTransaction[]> => {
    try {
      const data = await loyaltyApi.getPointsHistory(customerId)
      
        return data.transaction || datas || []
}
      throw new Error('Failed to fetch history')
    } catch (err: any) {
      error.value = err.message
      return []
    }
  }

  // Tier Management
  const createTier = async (programId: string, tier: Omit<LoyaltyTier, 'id' | 'programId'>): Promise<LoyaltyTier | null> => {
    try {
      const data = await loyaltyApi.createTier(programId, tier)
      
        const newTier = data.tier || data
        const program = programs.value.find(p => p.id === programId)
        if (program) {
          if (!program.tiers) program.tiers = []
          program.tiers.push(newTier)
  }
        return newTier
}
      throw new Error('Failed to create tier')
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const updateTier = async (tierId: string, updates: Partial<LoyaltyTier>): Promise<boolean> => {
    try {
      const data = await loyaltyApi.updateTier(tierId, updates)
      
        programs.value.forEach(program => {
          if (program.tiers) {
            const index = program.tiers.findIndex(t => t.id === tierId)
            if (index !== -1) {
              program.tiers[index] = { ...program.tiers[index], ...updates }
      }
    }
  })
        return true
}
      throw new Error('Failed to update tier')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const deleteTier = async (tierId: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.deleteTier(tierId)
      
        programs.value.forEach(program => {
          if (program.tiers) {
            program.tiers = program.tiers.filter(t => t.id !== tierId)
    }
  })
        return true
}
      throw new Error('Failed to delete tier')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Campaign Management
  const createCampaign = async (campaign: Omit<LoyaltyCampaign, 'id' | 'usageCount'>): Promise<LoyaltyCampaign | null> => {
    try {
      const data = await loyaltyApi.createCampaign(campaign)
      
        const newCampaign = data.campaign || data
        campaigns.value.push(newCampaign)
        return newCampaign
}
      throw new Error('Failed to create campaign')
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
          campaigns.value[index] = { ...campaigns.value[index], ...updates }
  }
        return true
}
      throw new Error('Failed to update campaign')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.deleteCampaign(campaignId)
      
        campaigns.value = campaigns.value.filter(c => c.id !== campaignId)
        return true
}
      throw new Error('Failed to delete campaign')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  const fetchCampaigns = async (): Promise<boolean> => {
    try {
      const data = await loyaltyApi.getCampaigns()
      
        campaigns.value = data.campaign || datas || []
        return true
}
      throw new Error('Failed to fetch campaigns')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Analytics
  const fetchAnalytics = async (startDate?: string, endDate?: string): Promise<boolean> => {
    try {
      const data = await loyaltyApi.getAnalytics({
        params: { startDate, endDate }
})
      
        analytics.value = data.analytics || data
        return true
}
      throw new Error('Failed to fetch analytics')
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Data Export
  const exportData = async (type: 'customers' | 'transactions' | 'campaigns', format: 'CSV' | 'EXCEL'): Promise<boolean> => {
    try {
      const response = await loyaltyApi.exportData(type, {
        params: { format },
        responseType: 'blob'
})

      const blob = new Blob([response.data], {
        type: format === 'CSV' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
