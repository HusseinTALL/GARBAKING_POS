/**
 * TypeScript type definitions for the Customer App
 * Shared interfaces and types for type safety
 */

// Menu types
export interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  menuItems?: MenuItem[]
}

export interface MenuItem {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  cost?: number
  imageUrl?: string
  categoryId: string
  category?: Category
  isAvailable: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// Cart types
export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
  category?: string
}

export interface CustomerInfo {
  name: string
  phone?: string
  tableNumber?: string
  orderType: OrderType
  notes?: string
}

// Order types
export interface Order {
  id: string
  clientOrderId?: string
  orderNumber: string
  storeId: string
  customerName?: string
  customerPhone?: string
  tableNumber?: string
  orderType: OrderType
  status: OrderStatus
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod?: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  kitchenNotes?: string
  estimatedTime?: number
  actualTime?: number
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// App state types
export interface AppConfig {
  restaurantName: string
  currency: string
  taxRate: number
  supportPhone: string
  supportEmail: string
}

export interface NetworkStatus {
  isOnline: boolean
  lastSyncTime: Date | null
  pendingSyncItems: string[]
}

// Component prop types
export interface MenuItemCardProps {
  item: MenuItem
  showAddButton?: boolean
  showFavoriteButton?: boolean
  compact?: boolean
}

export interface CartItemProps {
  item: CartItem
  showQuantityControls?: boolean
  showRemoveButton?: boolean
  showNotes?: boolean
}

export interface CategorySliderProps {
  categories: Category[]
  selectedCategoryId?: string | null
  showAllButton?: boolean
}

// Form types
export interface ContactForm {
  name: string
  phone?: string
  email?: string
  message: string
}

export interface FeedbackForm {
  rating: number
  comment: string
  orderNumber?: string
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

// Local storage types
export interface StoredCart {
  items: CartItem[]
  customerInfo: CustomerInfo
  timestamp: number
}

export interface StoredMenu {
  categories: Category[]
  menuItems: MenuItem[]
  timestamp: number
  version: string
}

export interface StoredFavorites {
  itemIds: string[]
  timestamp: number
}

// WebSocket event types
export interface SocketOrderUpdate {
  orderId: string
  orderNumber: string
  status: OrderStatus
  estimatedTime?: number
  kitchenNotes?: string
}

export interface SocketNotification {
  type: 'order_update' | 'system_message'
  data: any
  timestamp: string
}

// Utility types
export type ConnectionStatus = 'connected' | 'offline' | 'connecting'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type ViewMode = 'grid' | 'list'

export type SortOrder = 'name' | 'price' | 'popularity' | 'newest'

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Route meta types
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    showHeader?: boolean
    showBackButton?: boolean
    transition?: string
    requiresConnection?: boolean
  }
}