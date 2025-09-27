/**
 * Cart/Order management store for GARBAKING POS
 * Handles cart state, order processing, and payment workflow with real-time synchronization
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from './menu'

// Cart item interface
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  specialInstructions?: string
  addedAt: Date
}

// Order interface
export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod?: 'cash' | 'card' | 'mobile'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: Date
  completedAt?: Date
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

    // Save to localStorage
    saveToLocalStorage()
  }

  const removeItem = (cartItemId: string) => {
    const index = items.value.findIndex(item => item.id === cartItemId)
    if (index !== -1) {
      items.value.splice(index, 1)
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
    saveToLocalStorage()
  }

  const createOrder = (): Order => {
    const order: Order = {
      id: generateOrderId(),
      items: [...items.value],
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
      paymentMethod: paymentMethod.value,
      status: 'pending',
      createdAt: new Date()
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

        const result: PaymentResult = {
          success: true,
          transactionId: generateTransactionId(),
          order
        }

        // Clear cart after successful payment
        clearCart()

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

  // Initialize cart from localStorage on store creation
  loadFromLocalStorage()

  return {
    // State
    items,
    isProcessingPayment,
    currentOrder,
    taxRate,
    paymentMethod,

    // Computed
    itemCount,
    subtotal,
    tax,
    total,
    isEmpty,
    formattedSubtotal,
    formattedTax,
    formattedTotal,

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

    // Utilities
    saveToLocalStorage,
    loadFromLocalStorage
  }
})