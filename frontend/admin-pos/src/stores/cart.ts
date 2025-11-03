/**
 * Cart/Order management store for GARBAKING POS
 * Handles cart state, order processing, and payment workflow with real-time synchronization
 *
 * NOTE: This is a client-side state management store with no direct API calls.
 * Cart operations are processed when orders are created via the orders store.
 * Loyalty integration uses loyaltyService (to be migrated when loyalty store is updated).
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from './menu'
import { loyaltyService, type CustomerLoyaltyProfile, type RedemptionRequest } from '@/services/loyalty'
import { draftStorage, type CartDraft } from '@/utils/draftStorage'

// Cart item interface
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  specialInstructions?: string
  addedAt: Date
}

// Customer interface for orders
export interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

// Applied discount interface
export interface AppliedDiscount {
  id: string
  type: 'LOYALTY_REDEMPTION' | 'PROMO_CODE' | 'MANUAL'
  description: string
  amount: number
  pointsUsed?: number
}

// Order interface
export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  finalTotal: number // After discounts
  paymentMethod?: 'cash' | 'card' | 'mobile'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: Date
  completedAt?: Date
  customer?: Customer
  appliedDiscounts: AppliedDiscount[]
  loyaltyPointsEarned?: number
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
}

// Payment processing result
export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  order?: Order
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isProcessingPayment = ref(false)
  const currentOrder = ref<Order | null>(null)
  const taxRate = ref(0.1) // 10% tax rate
  const paymentMethod = ref<'cash' | 'card' | 'mobile'>('card')

  // Loyalty-related state
  const selectedCustomer = ref<Customer | null>(null)
  const customerLoyaltyProfile = ref<CustomerLoyaltyProfile | null>(null)
  const appliedDiscounts = ref<AppliedDiscount[]>([])
  const isLoadingLoyalty = ref(false)
  const loyaltyError = ref<string | null>(null)

  // Draft-related state
  const availableDrafts = ref<CartDraft[]>([])
  const currentDraftId = ref<string | null>(null)
  const isLoadingDrafts = ref(false)
  const draftError = ref<string | null>(null)
  const customerInfo = ref<{name?: string, phone?: string}>({})
  const hasUnsavedChanges = ref(false)

  // Computed values
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  })

  const tax = computed(() => {
    return subtotal.value * taxRate.value
  })

  const total = computed(() => {
    return subtotal.value + tax.value
  })

  // Loyalty-related computed values
  const totalDiscounts = computed(() => {
    return appliedDiscounts.value.reduce((sum, discount) => sum + discount.amount, 0)
  })

  const finalTotal = computed(() => {
    return Math.max(0, total.value - totalDiscounts.value)
  })

  const loyaltyPointsToEarn = computed(() => {
    if (!selectedCustomer.value || !customerLoyaltyProfile.value) return 0

    // Assuming 1 point per dollar spent (this could be configurable)
    // Note: This would come from the loyalty program settings once backend integration is complete
    const pointsPerDollar = 1
    return Math.floor(finalTotal.value * pointsPerDollar)
  })

  const isEmpty = computed(() => {
    return items.value.length === 0
  })

  const formattedSubtotal = computed(() => {
    return subtotal.value.toFixed(2)
  })

  const formattedTax = computed(() => {
    return tax.value.toFixed(2)
  })

  const formattedTotal = computed(() => {
    return total.value.toFixed(2)
  })

  const formattedFinalTotal = computed(() => {
    return finalTotal.value.toFixed(2)
  })

  const formattedTotalDiscounts = computed(() => {
    return totalDiscounts.value.toFixed(2)
  })

  // Helper functions
  const markAsChanged = () => {
    hasUnsavedChanges.value = true
  }

  const updateCustomerInfo = (info: {name?: string, phone?: string}) => {
    customerInfo.value = { ...customerInfo.value, ...info }
    markAsChanged()
  }

  // Actions
  const addItem = (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    const existingItemIndex = items.value.findIndex(item =>
      item.menuItem.id === menuItem.id &&
      item.specialInstructions === specialInstructions
    )

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      items.value[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        id: generateCartItemId(),
        menuItem,
        quantity,
        specialInstructions,
        addedAt: new Date()
      }
      items.value.push(cartItem)
    }

    // Mark as changed for draft tracking
    markAsChanged()

    // Save to localStorage
    saveToLocalStorage()
  }

  const removeItem = (cartItemId: string) => {
    const index = items.value.findIndex(item => item.id === cartItemId)
    if (index !== -1) {
      items.value.splice(index, 1)
      markAsChanged()
      saveToLocalStorage()
    }
  }

  const updateItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId)
      return
    }

    const item = items.value.find(item => item.id === cartItemId)
    if (item) {
      item.quantity = newQuantity
      markAsChanged()
      saveToLocalStorage()
    }
  }

  const incrementItem = (menuItemId: string) => {
    const item = items.value.find(item => item.menuItem.id === menuItemId)
    if (item) {
      item.quantity += 1
    } else {
      // This should not happen in normal flow, but handle gracefully
      console.warn(`Trying to increment item ${menuItemId} that is not in cart`)
    }
    saveToLocalStorage()
  }

  const decrementItem = (menuItemId: string) => {
    const item = items.value.find(item => item.menuItem.id === menuItemId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeItem(item.id)
      }
      saveToLocalStorage()
    }
  }

  const getItemQuantity = (menuItemId: string): number => {
    const item = items.value.find(item => item.menuItem.id === menuItemId)
    return item ? item.quantity : 0
  }

  const updateSpecialInstructions = (cartItemId: string, instructions: string) => {
    const item = items.value.find(item => item.id === cartItemId)
    if (item) {
      item.specialInstructions = instructions
      saveToLocalStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    currentOrder.value = null
    appliedDiscounts.value = []
    saveToLocalStorage()
  }

  // Loyalty-related actions
  const setCustomer = async (customer: Customer) => {
    selectedCustomer.value = customer
    isLoadingLoyalty.value = true
    loyaltyError.value = null

    try {
      customerLoyaltyProfile.value = await loyaltyService.getCustomerLoyalty(customer.id)
    } catch (error) {
      loyaltyError.value = error instanceof Error ? error.message : 'Failed to load loyalty data'
      customerLoyaltyProfile.value = null
    } finally {
      isLoadingLoyalty.value = false
    }
  }

  const clearCustomer = () => {
    selectedCustomer.value = null
    customerLoyaltyProfile.value = null
    appliedDiscounts.value = []
    loyaltyError.value = null
  }

  const applyLoyaltyDiscount = async (redemptionRequest: RedemptionRequest) => {
    if (!selectedCustomer.value) {
      throw new Error('No customer selected')
    }

    try {
      const { redemption, discountValue } = await loyaltyService.redeemPoints(
        selectedCustomer.value.id,
        redemptionRequest
      )

      const discount: AppliedDiscount = {
        id: redemption.id,
        type: 'LOYALTY_REDEMPTION',
        description: redemptionRequest.description,
        amount: discountValue,
        pointsUsed: redemptionRequest.pointsToRedeem
      }

      appliedDiscounts.value.push(discount)

      // Update customer loyalty profile
      if (customerLoyaltyProfile.value) {
        customerLoyaltyProfile.value.customer.loyaltyPoints -= redemptionRequest.pointsToRedeem
      }

      return { redemption, discountValue }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to apply loyalty discount')
    }
  }

  const removeDiscount = (discountId: string) => {
    const discountIndex = appliedDiscounts.value.findIndex(d => d.id === discountId)
    if (discountIndex !== -1) {
      const discount = appliedDiscounts.value[discountIndex]

      // If it's a loyalty redemption, restore the points
      if (discount.type === 'LOYALTY_REDEMPTION' && discount.pointsUsed && customerLoyaltyProfile.value) {
        customerLoyaltyProfile.value.customer.loyaltyPoints += discount.pointsUsed
      }

      appliedDiscounts.value.splice(discountIndex, 1)
    }
  }

  const createOrder = (): Order => {
    const order: Order = {
      id: generateOrderId(),
      items: [...items.value],
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
      finalTotal: finalTotal.value,
      paymentMethod: paymentMethod.value,
      status: 'pending',
      createdAt: new Date(),
      customer: selectedCustomer.value || undefined,
      appliedDiscounts: [...appliedDiscounts.value],
      loyaltyPointsEarned: loyaltyPointsToEarn.value
    }

    currentOrder.value = order
    return order
  }

  const processPayment = async (selectedPaymentMethod: 'cash' | 'card' | 'mobile' = 'card'): Promise<PaymentResult> => {
    if (isEmpty.value) {
      return {
        success: false,
        error: 'Cart is empty'
      }
    }

    isProcessingPayment.value = true
    paymentMethod.value = selectedPaymentMethod

    try {
      // Create order
      const order = createOrder()
      order.status = 'processing'

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate payment success/failure (95% success rate for demo)
      const paymentSuccess = Math.random() > 0.05

      if (paymentSuccess) {
        order.status = 'completed'
        order.completedAt = new Date()

        // Award loyalty points if customer is selected
        if (selectedCustomer.value && order.loyaltyPointsEarned && order.loyaltyPointsEarned > 0) {
          try {
            await loyaltyService.awardPointsForOrder(order.id)

            // Update local customer loyalty profile
            if (customerLoyaltyProfile.value) {
              customerLoyaltyProfile.value.customer.loyaltyPoints += order.loyaltyPointsEarned
            }
          } catch (error) {
            console.error('Failed to award loyalty points:', error)
            // Don't fail the payment if loyalty points can't be awarded
          }
        }

        const result: PaymentResult = {
          success: true,
          transactionId: generateTransactionId(),
          order
        }

        // Clear cart after successful payment (but keep customer for next order)
        items.value = []
        appliedDiscounts.value = []
        currentOrder.value = null
        saveToLocalStorage()

        return result
      } else {
        order.status = 'cancelled'

        return {
          success: false,
          error: 'Payment failed. Please try again.',
          order
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    } finally {
      isProcessingPayment.value = false
    }
  }

  // Utility functions
  const generateCartItemId = (): string => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateOrderId = (): string => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateTransactionId = (): string => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Persistence functions
  const saveToLocalStorage = () => {
    try {
      const cartData = {
        items: items.value.map(item => ({
          ...item,
          addedAt: item.addedAt.toISOString()
        })),
        paymentMethod: paymentMethod.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('garbaking_cart', JSON.stringify(cartData))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('garbaking_cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)

        // Restore cart items
        items.value = cartData.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))

        // Restore payment method
        if (cartData.paymentMethod) {
          paymentMethod.value = cartData.paymentMethod
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('garbaking_cart')
    }
  }

  // Draft management functions
  const saveDraft = async (draftName?: string): Promise<string | null> => {
    if (items.value.length === 0) {
      draftError.value = 'Cannot save empty cart as draft'
      return null
    }

    try {
      const draft: Omit<CartDraft, 'id' | 'createdAt' | 'updatedAt'> = {
        name: draftName || `Draft ${new Date().toLocaleString()}`,
        items: items.value.map(item => ({
          id: item.id,
          menuItem: item.menuItem,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        customerName: customerInfo.value.name,
        customerPhone: customerInfo.value.phone,
        paymentMethod: paymentMethod.value,
        subtotal: subtotal.value,
        tax: tax.value,
        total: total.value,
        itemCount: itemCount.value
      }

      if (currentDraftId.value) {
        // Update existing draft
        await draftStorage.updateDraft(currentDraftId.value, draft)
        await loadDrafts()
        hasUnsavedChanges.value = false
        return currentDraftId.value
      } else {
        // Save new draft
        const draftId = await draftStorage.saveDraft(draft)
        currentDraftId.value = draftId
        await loadDrafts()
        hasUnsavedChanges.value = false
        return draftId
      }
    } catch (error) {
      draftError.value = error instanceof Error ? error.message : 'Failed to save draft'
      console.error('Failed to save draft:', error)
      return null
    }
  }

  const loadDraft = async (draftId: string): Promise<boolean> => {
    try {
      const draft = await draftStorage.getDraft(draftId)
      if (!draft) {
        draftError.value = 'Draft not found'
        return false
      }

      // Clear current cart
      items.value = []

      // Load draft items
      items.value = draft.items.map(item => ({
        ...item,
        addedAt: new Date()
      }))

      // Load customer info
      if (draft.customerName || draft.customerPhone) {
        customerInfo.value = {
          name: draft.customerName,
          phone: draft.customerPhone
        }
      }

      // Load payment method
      if (draft.paymentMethod) {
        paymentMethod.value = draft.paymentMethod as 'cash' | 'card' | 'mobile'
      }

      currentDraftId.value = draftId
      hasUnsavedChanges.value = false

      return true
    } catch (error) {
      draftError.value = error instanceof Error ? error.message : 'Failed to load draft'
      console.error('Failed to load draft:', error)
      return false
    }
  }

  const loadDrafts = async (): Promise<void> => {
    isLoadingDrafts.value = true
    draftError.value = null

    try {
      availableDrafts.value = await draftStorage.getAllDrafts()
    } catch (error) {
      draftError.value = error instanceof Error ? error.message : 'Failed to load drafts'
      console.error('Failed to load drafts:', error)
    } finally {
      isLoadingDrafts.value = false
    }
  }

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    try {
      await draftStorage.deleteDraft(draftId)

      if (currentDraftId.value === draftId) {
        currentDraftId.value = null
      }

      await loadDrafts()
      return true
    } catch (error) {
      draftError.value = error instanceof Error ? error.message : 'Failed to delete draft'
      console.error('Failed to delete draft:', error)
      return false
    }
  }

  const deleteAllDrafts = async (): Promise<boolean> => {
    try {
      await draftStorage.deleteAllDrafts()
      currentDraftId.value = null
      availableDrafts.value = []
      return true
    } catch (error) {
      draftError.value = error instanceof Error ? error.message : 'Failed to delete all drafts'
      console.error('Failed to delete all drafts:', error)
      return false
    }
  }

  const getDraftCount = async (): Promise<number> => {
    try {
      return await draftStorage.getDraftCount()
    } catch (error) {
      console.error('Failed to get draft count:', error)
      return 0
    }
  }

  const autoSaveDraft = async (): Promise<void> => {
    if (items.value.length === 0 || !hasUnsavedChanges.value) {
      return
    }

    const draftName = currentDraftId.value
      ? (availableDrafts.value.find(d => d.id === currentDraftId.value)?.name || 'Auto-saved Draft')
      : 'Auto-saved Draft'

    await saveDraft(draftName)
  }

  // Initialize cart from localStorage on store creation
  loadFromLocalStorage()

  // Load drafts on initialization
  loadDrafts()

  return {
    // State
    items,
    isProcessingPayment,
    currentOrder,
    taxRate,
    paymentMethod,

    // Loyalty state
    selectedCustomer,
    customerLoyaltyProfile,
    appliedDiscounts,
    isLoadingLoyalty,
    loyaltyError,

    // Draft state
    availableDrafts,
    currentDraftId,
    isLoadingDrafts,
    draftError,
    customerInfo,
    hasUnsavedChanges,

    // Computed
    itemCount,
    subtotal,
    tax,
    total,
    totalDiscounts,
    finalTotal,
    loyaltyPointsToEarn,
    isEmpty,
    formattedSubtotal,
    formattedTax,
    formattedTotal,
    formattedFinalTotal,
    formattedTotalDiscounts,

    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    incrementItem,
    decrementItem,
    getItemQuantity,
    updateSpecialInstructions,
    clearCart,
    createOrder,
    processPayment,

    // Loyalty actions
    setCustomer,
    clearCustomer,
    applyLoyaltyDiscount,
    removeDiscount,

    // Draft actions
    saveDraft,
    loadDraft,
    loadDrafts,
    deleteDraft,
    deleteAllDrafts,
    getDraftCount,
    autoSaveDraft,
    markAsChanged,
    updateCustomerInfo,

    // Utilities
    saveToLocalStorage,
    loadFromLocalStorage
  }
})