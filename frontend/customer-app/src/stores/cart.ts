/**
 * Shopping cart store for managing order items
 * Handles cart operations, calculations, and persistence
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAppStore } from './app'
import { useVoucherStore } from './vouchers'

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
  category?: string
  sku?: string
}

export interface CustomerInfo {
  name: string
  phone?: string
  tableNumber?: string
  orderType: 'DINE_IN' | 'TAKEAWAY'
  notes?: string
}

export const useCartStore = defineStore('cart', () => {
  const toast = useToast()
  const appStore = useAppStore()
  const voucherStore = useVoucherStore()

  // State
  const items = ref<CartItem[]>([])
  const customerInfo = ref<CustomerInfo>({
    name: '',
    phone: '',
    tableNumber: '',
    orderType: 'DINE_IN',
    notes: ''
  })

  // Load cart from localStorage on initialization
  const normalizeCartItems = (rawItems: CartItem[]): CartItem[] => {
    return rawItems.map(item => ({
      ...item,
      menuItemId: String(item.menuItemId),
      id: item.id || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
  }

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('garbaking-cart')
      const savedCustomerInfo = localStorage.getItem('garbaking-customer')

      if (savedCart) {
        items.value = normalizeCartItems(JSON.parse(savedCart))
      }

      if (savedCustomerInfo) {
        customerInfo.value = { ...customerInfo.value, ...JSON.parse(savedCustomerInfo) }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }

  // Save cart to localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('garbaking-cart', JSON.stringify(items.value))
      localStorage.setItem('garbaking-customer', JSON.stringify(customerInfo.value))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const tax = computed(() => {
    return appStore.taxAmount(subtotal.value)
  })

  const discount = computed(() => {
    if (!voucherStore.appliedVoucher) return 0
    return voucherStore.appliedVoucher.discountAmount
  })

  const total = computed(() => {
    return Math.max(0, subtotal.value + tax.value - discount.value)
  })

  const appliedVoucherCode = computed(() => {
    return voucherStore.appliedVoucher?.voucher.code || null
  })

  const isEmpty = computed(() => {
    return items.value.length === 0
  })

  const getItemById = computed(() => (id: string) => {
    return items.value.find(item => item.id === id)
  })

  const getItemByMenuItemId = computed(() => (menuItemId: string) => {
    return items.value.find(item => item.menuItemId === menuItemId)
  })

  // Actions
  const addItem = (menuItem: {
    id: string | number
    name: string
    price: number
    sku?: string
    imageUrl?: string
    category?: string
  }, quantity = 1, notes?: string) => {
    const menuItemId = String(menuItem.id)
    const existingItem = getItemByMenuItemId.value(menuItemId)

    if (existingItem) {
      // Update existing item
      existingItem.quantity += quantity
      if (notes) {
        existingItem.notes = notes
      }
    } else {
      // Add new item
      const cartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        notes,
        imageUrl: menuItem.imageUrl,
        category: menuItem.category,
        sku: menuItem.sku
      }

      items.value.push(cartItem)
    }

    saveCart()
    toast.success(`${menuItem.name} ajouté au panier`)
  }

  const removeItem = (cartItemId: string) => {
    const index = items.value.findIndex(item => item.id === cartItemId)
    if (index > -1) {
      const item = items.value[index]
      items.value.splice(index, 1)
      saveCart()
      toast.info(`${item.name} retiré du panier`)
    }
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    const item = getItemById.value(cartItemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(cartItemId)
      } else {
        item.quantity = quantity
        saveCart()
      }
    }
  }

  const increaseQuantity = (cartItemId: string) => {
    const item = getItemById.value(cartItemId)
    if (item) {
      item.quantity += 1
      saveCart()
    }
  }

  const decreaseQuantity = (cartItemId: string) => {
    const item = getItemById.value(cartItemId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
        saveCart()
      } else {
        removeItem(cartItemId)
      }
    }
  }

  const updateItemNotes = (cartItemId: string, notes: string) => {
    const item = getItemById.value(cartItemId)
    if (item) {
      item.notes = notes
      saveCart()
    }
  }

  const clearCart = () => {
    items.value = []
    voucherStore.removeAppliedVoucher()
    saveCart()
    toast.info('Panier vidé')
  }

  // Apply voucher to cart
  const applyVoucher = async (voucherCode: string) => {
    const result = await voucherStore.applyVoucher(voucherCode, subtotal.value)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    return result
  }

  // Remove applied voucher
  const removeVoucher = () => {
    voucherStore.removeAppliedVoucher()
    toast.info('Voucher removed from cart')
  }

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    customerInfo.value = { ...customerInfo.value, ...info }
    saveCart()
  }

  // Get cart summary for order creation
  const getOrderData = () => {
    return {
      customerInfo: customerInfo.value,
      items: items.value.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes
      })),
      subtotal: subtotal.value,
      tax: tax.value,
      discount: discount.value,
      voucherCode: appliedVoucherCode.value,
      total: total.value
    }
  }

  // Validate cart before checkout
  const validateCart = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (isEmpty.value) {
      errors.push('Votre panier est vide')
    }

    if (!customerInfo.value.name.trim()) {
      errors.push('Le nom du client est requis')
    }

    if (customerInfo.value.orderType === 'DINE_IN' && !customerInfo.value.tableNumber?.trim()) {
      errors.push('Le numéro de table est requis pour les commandes sur place')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Initialize cart from localStorage
  loadCart()

  return {
    // State
    items,
    customerInfo,

    // Getters
    itemCount,
    subtotal,
    tax,
    discount,
    total,
    isEmpty,
    appliedVoucherCode,
    getItemById,
    getItemByMenuItemId,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    updateItemNotes,
    clearCart,
    applyVoucher,
    removeVoucher,
    updateCustomerInfo,
    getOrderData,
    validateCart,
    loadCart,
    saveCart
  }
})
