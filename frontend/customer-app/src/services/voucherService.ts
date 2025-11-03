/**
 * Voucher Service
 * Provides mock voucher data and API methods (can be replaced with real API calls later)
 */

import type { Voucher, VoucherCategory, ClaimedVoucher } from '@/types/voucher'
import { VoucherType, VoucherStatus } from '@/types/voucher'

// Mock voucher data
export const mockVouchers: Voucher[] = [
  {
    id: 'V001',
    code: 'FIRST25',
    title: '25% OFF First Order',
    description: 'Get 25% off on your first order with us!',
    type: VoucherType.PERCENTAGE,
    discountValue: 25,
    minOrderAmount: 15,
    maxDiscount: 10,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Valid for new customers only',
      'Minimum order of $15 required',
      'Maximum discount of $10',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ],
    imageUrl: '/images/vouchers/first-order.jpg',
    isNewUser: true,
    maxUsage: 1
  },
  {
    id: 'V002',
    code: 'SAVE10',
    title: '$10 OFF',
    description: 'Save $10 on orders above $50',
    type: VoucherType.FIXED_AMOUNT,
    discountValue: 10,
    minOrderAmount: 50,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-06-30'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Minimum order of $50 required',
      'Valid for all menu items',
      'One use per customer',
      'Valid until June 30, 2025'
    ],
    maxUsage: 1
  },
  {
    id: 'V003',
    code: 'FREEDEL',
    title: 'Free Delivery',
    description: 'Enjoy free delivery on any order!',
    type: VoucherType.FREE_DELIVERY,
    discountValue: 0,
    minOrderAmount: 0,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-03-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Free delivery for all orders',
      'No minimum order required',
      'Valid within delivery zones only',
      'Valid until March 31, 2025'
    ],
    maxUsage: 3
  },
  {
    id: 'V004',
    code: 'BOGO50',
    title: 'Buy 1 Get 1 50% OFF',
    description: 'Get 50% off on second item of equal or lesser value',
    type: VoucherType.BUY_ONE_GET_ONE,
    discountValue: 50,
    minOrderAmount: 20,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Second item must be of equal or lesser value',
      'Minimum order of $20 required',
      'Valid for all menu items',
      'Valid until December 31, 2025'
    ],
    category: 'Mains',
    maxUsage: 5
  },
  {
    id: 'V005',
    code: 'DESSERT20',
    title: '20% OFF Desserts',
    description: 'Get 20% off on all dessert items',
    type: VoucherType.CATEGORY_DISCOUNT,
    discountValue: 20,
    minOrderAmount: 10,
    maxDiscount: 5,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Valid for dessert category only',
      'Minimum order of $10 required',
      'Maximum discount of $5',
      'Valid until December 31, 2025'
    ],
    category: 'Desserts',
    maxUsage: 10
  },
  {
    id: 'V006',
    code: 'WEEKEND15',
    title: 'Weekend Special 15%',
    description: '15% off on all weekend orders',
    type: VoucherType.PERCENTAGE,
    discountValue: 15,
    minOrderAmount: 25,
    maxDiscount: 15,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Valid on weekends only (Friday-Sunday)',
      'Minimum order of $25 required',
      'Maximum discount of $15',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ]
  },
  {
    id: 'V007',
    code: 'LUNCH10',
    title: 'Lunch Hour Deal',
    description: '$10 off on lunch orders between 11 AM - 2 PM',
    type: VoucherType.FIXED_AMOUNT,
    discountValue: 10,
    minOrderAmount: 30,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Valid from 11:00 AM to 2:00 PM only',
      'Minimum order of $30 required',
      'Monday to Friday only',
      'Valid until December 31, 2025'
    ],
    maxUsage: 20
  },
  {
    id: 'V008',
    code: 'FAMILY30',
    title: '$30 OFF Family Meal',
    description: 'Save $30 on family-sized orders',
    type: VoucherType.FIXED_AMOUNT,
    discountValue: 30,
    minOrderAmount: 100,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    status: VoucherStatus.AVAILABLE,
    termsAndConditions: [
      'Minimum order of $100 required',
      'Valid for 4 or more items',
      'One use per transaction',
      'Valid until December 31, 2025'
    ],
    maxUsage: 1
  }
]

export const voucherCategories: VoucherCategory[] = [
  { id: 'all', name: 'All', icon: '🎫', count: 8 },
  { id: 'new-user', name: 'New User', icon: '⭐', count: 1 },
  { id: 'percentage', name: 'Percentage Off', icon: '%', count: 3 },
  { id: 'fixed', name: 'Fixed Amount', icon: '$', count: 3 },
  { id: 'delivery', name: 'Free Delivery', icon: '🚚', count: 1 },
  { id: 'bogo', name: 'BOGO', icon: '🎁', count: 1 }
]

class VoucherService {
  private vouchers: Voucher[] = [...mockVouchers]

  /**
   * Get all available vouchers
   */
  async getAvailableVouchers(): Promise<Voucher[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return this.vouchers.filter(v => {
      const now = new Date()
      return v.status === VoucherStatus.AVAILABLE &&
             v.validFrom <= now &&
             v.validUntil >= now
    })
  }

  /**
   * Get vouchers by category
   */
  async getVouchersByCategory(categoryId: string): Promise<Voucher[]> {
    const allVouchers = await this.getAvailableVouchers()

    if (categoryId === 'all') return allVouchers
    if (categoryId === 'new-user') return allVouchers.filter(v => v.isNewUser)
    if (categoryId === 'percentage') return allVouchers.filter(v => v.type === VoucherType.PERCENTAGE)
    if (categoryId === 'fixed') return allVouchers.filter(v => v.type === VoucherType.FIXED_AMOUNT)
    if (categoryId === 'delivery') return allVouchers.filter(v => v.type === VoucherType.FREE_DELIVERY)
    if (categoryId === 'bogo') return allVouchers.filter(v => v.type === VoucherType.BUY_ONE_GET_ONE)

    return allVouchers
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(id: string): Promise<Voucher | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.vouchers.find(v => v.id === id) || null
  }

  /**
   * Get voucher by code
   */
  async getVoucherByCode(code: string): Promise<Voucher | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.vouchers.find(v => v.code.toUpperCase() === code.toUpperCase()) || null
  }

  /**
   * Validate voucher for order
   */
  async validateVoucher(voucherCode: string, orderAmount: number): Promise<{
    valid: boolean
    message: string
    discount?: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const voucher = await this.getVoucherByCode(voucherCode)

    if (!voucher) {
      return { valid: false, message: 'Invalid voucher code' }
    }

    const now = new Date()
    if (voucher.validFrom > now) {
      return { valid: false, message: 'Voucher is not yet valid' }
    }

    if (voucher.validUntil < now) {
      return { valid: false, message: 'Voucher has expired' }
    }

    if (voucher.status !== VoucherStatus.AVAILABLE) {
      return { valid: false, message: 'Voucher is not available' }
    }

    if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of $${voucher.minOrderAmount} required`
      }
    }

    let discount = 0
    switch (voucher.type) {
      case VoucherType.PERCENTAGE:
        discount = (orderAmount * voucher.discountValue) / 100
        if (voucher.maxDiscount) {
          discount = Math.min(discount, voucher.maxDiscount)
        }
        break
      case VoucherType.FIXED_AMOUNT:
        discount = voucher.discountValue
        break
      case VoucherType.FREE_DELIVERY:
        discount = 5 // Assume $5 delivery fee
        break
      default:
        discount = 0
    }

    return {
      valid: true,
      message: 'Voucher applied successfully',
      discount: Math.min(discount, orderAmount)
    }
  }

  /**
   * Calculate discount for voucher
   */
  calculateDiscount(voucher: Voucher, orderAmount: number): number {
    switch (voucher.type) {
      case VoucherType.PERCENTAGE:
        const percentDiscount = (orderAmount * voucher.discountValue) / 100
        return voucher.maxDiscount ? Math.min(percentDiscount, voucher.maxDiscount) : percentDiscount

      case VoucherType.FIXED_AMOUNT:
        return Math.min(voucher.discountValue, orderAmount)

      case VoucherType.FREE_DELIVERY:
        return 5 // Delivery fee

      default:
        return 0
    }
  }
}

export const voucherService = new VoucherService()
