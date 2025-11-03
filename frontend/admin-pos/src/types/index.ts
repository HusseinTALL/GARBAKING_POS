/**
 * TypeScript type definitions for the Admin POS application
 * Shared interfaces and types used across components
 */

// User types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  storeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  KITCHEN_STAFF = 'KITCHEN_STAFF'
}

// Menu types
export interface Category {
  id: number
  name: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  menuItems?: MenuItem[]
}

export interface MenuItem {
  id: number
  sku: string
  name: string
  description?: string
  price: number
  cost?: number
  imageUrl?: string
  categoryId: number
  category?: Category
  isAvailable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Order types
export interface Order {
  id: string
  clientOrderId?: string
  orderNumber: string
  storeId: string
  customerId?: string
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
  paymentReference?: string
  notes?: string
  userId: string
  user?: User
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

// Cart types (for customer ordering)
export interface CartItem {
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

// Analytics types
export interface DailySales {
  id: string
  date: string
  storeId: string
  totalOrders: number
  totalRevenue: number
  totalTax: number
  totalDiscount: number
  averageOrder: number
  cashSales: number
  cardSales: number
}

export interface SalesAnalytics {
  today: DailySales
  week: DailySales[]
  month: DailySales[]
  topItems: {
    menuItem: MenuItem
    quantity: number
    revenue: number
  }[]
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

// Settings types
export interface Settings {
  id: string
  key: string
  value: string
  description?: string
}

// Sync types
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED'
}

export interface SyncInfo {
  lastSync: string
  pendingOrders: number
  status: SyncStatus
  isOnline: boolean
}