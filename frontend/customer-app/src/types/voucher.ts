/**
 * Voucher Types and Interfaces
 * Defines voucher-related data structures for the customer app
 */

export enum VoucherType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_DELIVERY = 'FREE_DELIVERY',
  BUY_ONE_GET_ONE = 'BUY_ONE_GET_ONE',
  CATEGORY_DISCOUNT = 'CATEGORY_DISCOUNT'
}

export enum VoucherStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

export interface Voucher {
  id: string
  code: string
  title: string
  description: string
  type: VoucherType
  discountValue: number  // Percentage or amount depending on type
  minOrderAmount?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  status: VoucherStatus
  termsAndConditions: string[]
  imageUrl?: string
  category?: string
  usageCount?: number
  maxUsage?: number
  isNewUser?: boolean
}

export interface ClaimedVoucher extends Voucher {
  claimedAt: Date
  usedAt?: Date
}

export interface VoucherCategory {
  id: string
  name: string
  icon: string
  count: number
}

export interface AppliedVoucher {
  voucher: Voucher
  discountAmount: number
  finalAmount: number
}
