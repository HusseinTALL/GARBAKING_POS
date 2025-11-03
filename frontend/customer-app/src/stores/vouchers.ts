/**
 * Voucher Store
 * Manages vouchers, claimed vouchers, and applied vouchers with persistence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Voucher, ClaimedVoucher, AppliedVoucher } from '@/types/voucher'
import { VoucherStatus } from '@/types/voucher'
import { voucherService } from '@/services/voucherService'

const STORAGE_KEY = 'garbaking_claimed_vouchers'

export const useVoucherStore = defineStore('vouchers', () => {
  // State
  const availableVouchers = ref<Voucher[]>([])
  const claimedVouchers = ref<ClaimedVoucher[]>([])
  const appliedVoucher = ref<AppliedVoucher | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasClaimedVouchers = computed(() => claimedVouchers.value.length > 0)
  const unusedClaimedVouchers = computed(() =>
    claimedVouchers.value.filter(v => v.status === VoucherStatus.CLAIMED)
  )
  const usedVouchers = computed(() =>
    claimedVouchers.value.filter(v => v.status === VoucherStatus.USED)
  )

  // Load claimed vouchers from localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        claimedVouchers.value = parsed.map((v: any) => ({
          ...v,
          validFrom: new Date(v.validFrom),
          validUntil: new Date(v.validUntil),
          claimedAt: new Date(v.claimedAt),
          usedAt: v.usedAt ? new Date(v.usedAt) : undefined
        }))
      }
    } catch (err) {
      console.error('Error loading claimed vouchers from storage:', err)
    }
  }

  // Save claimed vouchers to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claimedVouchers.value))
    } catch (err) {
      console.error('Error saving claimed vouchers to storage:', err)
    }
  }

  // Fetch available vouchers
  const fetchAvailableVouchers = async () => {
    isLoading.value = true
    error.value = null
    try {
      availableVouchers.value = await voucherService.getAvailableVouchers()
    } catch (err) {
      error.value = 'Failed to load vouchers'
      console.error('Error fetching vouchers:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch vouchers by category
  const fetchVouchersByCategory = async (categoryId: string) => {
    isLoading.value = true
    error.value = null
    try {
      availableVouchers.value = await voucherService.getVouchersByCategory(categoryId)
    } catch (err) {
      error.value = 'Failed to load vouchers'
      console.error('Error fetching vouchers by category:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Check if voucher is claimed
  const isVoucherClaimed = (voucherId: string): boolean => {
    return claimedVouchers.value.some(v => v.id === voucherId)
  }

  // Claim a voucher
  const claimVoucher = (voucher: Voucher): boolean => {
    if (isVoucherClaimed(voucher.id)) {
      error.value = 'Voucher already claimed'
      return false
    }

    const claimedVoucher: ClaimedVoucher = {
      ...voucher,
      status: VoucherStatus.CLAIMED,
      claimedAt: new Date()
    }

    claimedVouchers.value.unshift(claimedVoucher)
    saveToStorage()
    return true
  }

  // Apply voucher to order
  const applyVoucher = async (voucherCode: string, orderAmount: number): Promise<{
    success: boolean
    message: string
    appliedVoucher?: AppliedVoucher
  }> => {
    try {
      const validation = await voucherService.validateVoucher(voucherCode, orderAmount)

      if (!validation.valid) {
        return { success: false, message: validation.message }
      }

      const voucher = await voucherService.getVoucherByCode(voucherCode)
      if (!voucher) {
        return { success: false, message: 'Voucher not found' }
      }

      const discountAmount = validation.discount || 0
      const finalAmount = Math.max(0, orderAmount - discountAmount)

      const applied: AppliedVoucher = {
        voucher,
        discountAmount,
        finalAmount
      }

      appliedVoucher.value = applied

      return {
        success: true,
        message: 'Voucher applied successfully!',
        appliedVoucher: applied
      }
    } catch (err) {
      console.error('Error applying voucher:', err)
      return { success: false, message: 'Failed to apply voucher' }
    }
  }

  // Remove applied voucher
  const removeAppliedVoucher = () => {
    appliedVoucher.value = null
  }

  // Mark voucher as used
  const markVoucherAsUsed = (voucherId: string) => {
    const voucher = claimedVouchers.value.find(v => v.id === voucherId)
    if (voucher) {
      voucher.status = VoucherStatus.USED
      voucher.usedAt = new Date()
      saveToStorage()
    }

    // Also remove from applied if it matches
    if (appliedVoucher.value?.voucher.id === voucherId) {
      appliedVoucher.value = null
    }
  }

  // Get voucher by code
  const getVoucherByCode = async (code: string): Promise<Voucher | null> => {
    return await voucherService.getVoucherByCode(code)
  }

  // Calculate discount for a voucher
  const calculateDiscount = (voucher: Voucher, orderAmount: number): number => {
    return voucherService.calculateDiscount(voucher, orderAmount)
  }

  // Clear expired vouchers
  const clearExpiredVouchers = () => {
    const now = new Date()
    claimedVouchers.value = claimedVouchers.value.filter(v => v.validUntil >= now)
    saveToStorage()
  }

  // Initialize
  loadFromStorage()
  clearExpiredVouchers()

  return {
    // State
    availableVouchers,
    claimedVouchers,
    appliedVoucher,
    isLoading,
    error,

    // Computed
    hasClaimedVouchers,
    unusedClaimedVouchers,
    usedVouchers,

    // Actions
    fetchAvailableVouchers,
    fetchVouchersByCategory,
    isVoucherClaimed,
    claimVoucher,
    applyVoucher,
    removeAppliedVoucher,
    markVoucherAsUsed,
    getVoucherByCode,
    calculateDiscount,
    clearExpiredVouchers
  }
})
