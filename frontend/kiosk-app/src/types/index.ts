/**
 * TypeScript type definitions for the Garbaking Kiosk App
 * Defines interfaces for menu items, orders, cart, and kiosk settings
 */

export type OrderMode = 'dine-in' | 'takeaway'
export type PaymentMethod = 'card' | 'mobile-money' | 'qr-code' | 'cash'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'

export interface MenuItem {
  id: number | string // Backend returns number
  name: string
  description: string
  price: number
  categoryId?: string // Optional - backend may not include this
  categoryName?: string // Backend includes this instead
  imageUrl?: string | null
  sku?: string // Backend includes SKU
  featured?: boolean // Backend includes featured flag
  available?: boolean // May not be in backend response
  preparationTime?: number // in minutes
  allergens?: string[]
  customizations?: MenuItemCustomization[]
}

export interface MenuCategory {
  id: number | string // Backend returns number
  name: string
  description?: string
  displayOrder?: number
  icon?: string
  imageUrl?: string | null
  color?: string // Backend may include color
  itemCount?: number // Backend includes item count
  menuItems?: MenuItem[] // Backend may include nested items
}

export interface MenuItemCustomization {
  id: string
  name: string
  type: 'single' | 'multiple'
  required: boolean
  options: CustomizationOption[]
}

export interface CustomizationOption {
  id: string
  name: string
  priceModifier: number
  default?: boolean
}

export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: SelectedCustomization[]
  subtotal: number
  notes?: string
}

export interface SelectedCustomization {
  customizationId: string
  customizationName: string
  optionId: string
  optionName: string
  priceModifier: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  mode: OrderMode
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt: Date
  estimatedReadyTime?: Date
}

export interface KioskSettings {
  language: string
  idleTimeout: number // in seconds
  currency: string
  taxRate: number
  showNutritionalInfo: boolean
  enableCashPayment: boolean
  enableCardPayment: boolean
  enableMobileMoneyPayment: boolean
  enableQRPayment: boolean
}

export interface Language {
  code: string
  name: string
  flag: string
}
