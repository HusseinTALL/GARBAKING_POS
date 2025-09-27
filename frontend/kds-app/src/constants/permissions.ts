/**
 * Permission constants matching backend RBAC system
 * These should match exactly with backend/src/config/permissions.ts
 */

// Role definitions
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Permission constants - must match backend exactly
export const PERMISSIONS = {
  // Order Management
  ORDERS: {
    CREATE: 'orders:create',
    READ: 'orders:read',
    UPDATE: 'orders:update',
    DELETE: 'orders:delete',
    REFUND: 'orders:refund',
    VIEW_ALL: 'orders:view_all',
    MODIFY_PAYMENT: 'orders:modify_payment'
  },

  // Menu Management
  MENU: {
    CREATE: 'menu:create',
    READ: 'menu:read',
    UPDATE: 'menu:update',
    DELETE: 'menu:delete',
    MANAGE_CATEGORIES: 'menu:manage_categories',
    MANAGE_PRICING: 'menu:manage_pricing',
    BULK_OPERATIONS: 'menu:bulk_operations'
  },

  // User Management
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_ROLES: 'users:manage_roles',
    VIEW_ALL: 'users:view_all',
    RESET_PASSWORD: 'users:reset_password'
  },

  // Analytics & Reports
  ANALYTICS: {
    VIEW_BASIC: 'analytics:view_basic',
    VIEW_DETAILED: 'analytics:view_detailed',
    EXPORT: 'analytics:export',
    VIEW_FINANCIAL: 'analytics:view_financial',
    VIEW_INVENTORY: 'analytics:view_inventory'
  },

  // System Configuration
  SYSTEM: {
    SETTINGS: 'system:settings',
    BACKUP: 'system:backup',
    LOGS: 'system:logs',
    INTEGRATIONS: 'system:integrations',
    STORE_CONFIG: 'system:store_config'
  },

  // Cash Management
  CASH: {
    OPEN_DRAWER: 'cash:open_drawer',
    COUNT: 'cash:count',
    DEPOSIT: 'cash:deposit',
    WITHDRAW: 'cash:withdraw',
    VIEW_REPORTS: 'cash:view_reports'
  },

  // Kitchen Operations
  KITCHEN: {
    VIEW_ORDERS: 'kitchen:view_orders',
    UPDATE_STATUS: 'kitchen:update_status',
    MANAGE_QUEUE: 'kitchen:manage_queue',
    VIEW_INGREDIENTS: 'kitchen:view_ingredients'
  }
} as const

// Role hierarchy levels (higher = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.CASHIER]: 40,
  [ROLES.KITCHEN]: 20
} as const

// Feature access by role
export const FEATURE_ACCESS = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard',
    'orders',
    'menu-management',
    'user-management',
    'analytics',
    'reports',
    'system-settings',
    'cash-management',
    'kitchen-display'
  ],
  [ROLES.ADMIN]: [
    'dashboard',
    'orders',
    'menu-management',
    'user-management',
    'analytics',
    'reports',
    'system-settings',
    'cash-management',
    'kitchen-display'
  ],
  [ROLES.MANAGER]: [
    'dashboard',
    'orders',
    'menu-management',
    'analytics',
    'reports',
    'cash-management',
    'kitchen-display'
  ],
  [ROLES.CASHIER]: [
    'dashboard',
    'orders',
    'cash-management'
  ],
  [ROLES.KITCHEN]: [
    'kitchen-display',
    'orders' // Read-only
  ]
} as const

// UI restrictions by role (matching backend)
export const UI_RESTRICTIONS = {
  [ROLES.SUPER_ADMIN]: {
    canModifyOrders: true,
    canViewFinancials: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewReports: true,
    canManageMenu: true,
    maxDiscountPercent: 100,
    canVoidOrders: true,
    canRefundOrders: true
  },
  [ROLES.ADMIN]: {
    canModifyOrders: true,
    canViewFinancials: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewReports: true,
    canManageMenu: true,
    maxDiscountPercent: 50,
    canVoidOrders: true,
    canRefundOrders: true
  },
  [ROLES.MANAGER]: {
    canModifyOrders: true,
    canViewFinancials: true,
    canManageUsers: false,
    canAccessSettings: false,
    canViewReports: true,
    canManageMenu: true,
    maxDiscountPercent: 25,
    canVoidOrders: true,
    canRefundOrders: true
  },
  [ROLES.CASHIER]: {
    canModifyOrders: true,
    canViewFinancials: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewReports: false,
    canManageMenu: false,
    maxDiscountPercent: 10,
    canVoidOrders: false,
    canRefundOrders: false
  },
  [ROLES.KITCHEN]: {
    canModifyOrders: false,
    canViewFinancials: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewReports: false,
    canManageMenu: false,
    maxDiscountPercent: 0,
    canVoidOrders: false,
    canRefundOrders: false
  }
} as const

// Helper functions
export const hasMinimumRole = (userRole: Role, requiredRole: Role): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const canAccessFeature = (userRole: Role, feature: string): boolean => {
  return FEATURE_ACCESS[userRole]?.includes(feature) || false
}

export const getRoleColor = (role: Role): string => {
  switch (role) {
    case ROLES.SUPER_ADMIN: return '#7C3AED'
    case ROLES.ADMIN: return '#DC2626'
    case ROLES.MANAGER: return '#EA580C'
    case ROLES.CASHIER: return '#059669'
    case ROLES.KITCHEN: return '#2563EB'
    default: return '#6B7280'
  }
}

export const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case ROLES.SUPER_ADMIN: return 'Super Admin'
    case ROLES.ADMIN: return 'Administrator'
    case ROLES.MANAGER: return 'Manager'
    case ROLES.CASHIER: return 'Cashier'
    case ROLES.KITCHEN: return 'Kitchen Staff'
    default: return 'Staff'
  }
}

// Common permission groups for UI components
export const PERMISSION_GROUPS = {
  ORDER_MANAGEMENT: [
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.UPDATE
  ],
  FINANCIAL_ACCESS: [
    PERMISSIONS.ANALYTICS.VIEW_FINANCIAL,
    PERMISSIONS.CASH.VIEW_REPORTS,
    PERMISSIONS.ORDERS.REFUND
  ],
  ADMIN_ACCESS: [
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.MANAGE_ROLES,
    PERMISSIONS.SYSTEM.SETTINGS
  ],
  MENU_MANAGEMENT: [
    PERMISSIONS.MENU.CREATE,
    PERMISSIONS.MENU.UPDATE,
    PERMISSIONS.MENU.MANAGE_CATEGORIES
  ]
} as const