/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles, permissions, and access control rules for the POS system
 */

// Role definitions with hierarchy levels
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',    // Level 100 - Full system access
  ADMIN: 'ADMIN',                // Level 80 - Store administration
  MANAGER: 'MANAGER',            // Level 60 - Store management
  CASHIER: 'CASHIER',            // Level 40 - Basic POS operations
  KITCHEN: 'KITCHEN'             // Level 20 - Kitchen operations only
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permission categories and actions
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
} as const;

// Role hierarchy with permission levels
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.CASHIER]: 40,
  [ROLES.KITCHEN]: 20
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: [
    // Full access to everything
    ...Object.values(PERMISSIONS.ORDERS),
    ...Object.values(PERMISSIONS.MENU),
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.ANALYTICS),
    ...Object.values(PERMISSIONS.SYSTEM),
    ...Object.values(PERMISSIONS.CASH),
    ...Object.values(PERMISSIONS.KITCHEN)
  ],

  [ROLES.ADMIN]: [
    // Store administration
    ...Object.values(PERMISSIONS.ORDERS),
    ...Object.values(PERMISSIONS.MENU),
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.VIEW_ALL,
    PERMISSIONS.USERS.RESET_PASSWORD,
    ...Object.values(PERMISSIONS.ANALYTICS),
    PERMISSIONS.SYSTEM.SETTINGS,
    PERMISSIONS.SYSTEM.STORE_CONFIG,
    PERMISSIONS.SYSTEM.BACKUP,
    ...Object.values(PERMISSIONS.CASH),
    ...Object.values(PERMISSIONS.KITCHEN)
  ],

  [ROLES.MANAGER]: [
    // Management operations
    ...Object.values(PERMISSIONS.ORDERS),
    PERMISSIONS.MENU.READ,
    PERMISSIONS.MENU.UPDATE,
    PERMISSIONS.MENU.MANAGE_PRICING,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.VIEW_ALL,
    PERMISSIONS.ANALYTICS.VIEW_BASIC,
    PERMISSIONS.ANALYTICS.VIEW_DETAILED,
    PERMISSIONS.ANALYTICS.VIEW_FINANCIAL,
    PERMISSIONS.ANALYTICS.EXPORT,
    PERMISSIONS.SYSTEM.STORE_CONFIG,
    ...Object.values(PERMISSIONS.CASH),
    ...Object.values(PERMISSIONS.KITCHEN)
  ],

  [ROLES.CASHIER]: [
    // Basic POS operations
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.UPDATE,
    PERMISSIONS.ORDERS.MODIFY_PAYMENT,
    PERMISSIONS.MENU.READ,
    PERMISSIONS.USERS.READ, // Own profile only
    PERMISSIONS.ANALYTICS.VIEW_BASIC,
    PERMISSIONS.CASH.OPEN_DRAWER,
    PERMISSIONS.CASH.COUNT
  ],

  [ROLES.KITCHEN]: [
    // Kitchen operations only
    PERMISSIONS.KITCHEN.VIEW_ORDERS,
    PERMISSIONS.KITCHEN.UPDATE_STATUS,
    PERMISSIONS.KITCHEN.MANAGE_QUEUE,
    PERMISSIONS.KITCHEN.VIEW_INGREDIENTS,
    PERMISSIONS.ORDERS.READ, // Read-only orders
    PERMISSIONS.MENU.READ,   // Read menu for preparation
    PERMISSIONS.USERS.READ   // Own profile only
  ]
};

// Feature access mapping
export const FEATURE_ACCESS: Record<Role, string[]> = {
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
};

// UI restrictions based on roles
export const UI_RESTRICTIONS: Record<Role, {
  canModifyOrders: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
  canViewReports: boolean;
  canManageMenu: boolean;
  maxDiscountPercent: number;
  canVoidOrders: boolean;
  canRefundOrders: boolean;
}> = {
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
};

// Helper functions
export const hasPermission = (userRole: Role, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasMinimumRole = (userRole: Role, requiredRole: Role): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const getRolePermissions = (role: Role): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const getFeatureAccess = (role: Role): string[] => {
  return FEATURE_ACCESS[role] || [];
};

export const getUIRestrictions = (role: Role) => {
  return UI_RESTRICTIONS[role] || UI_RESTRICTIONS[ROLES.CASHIER];
};

export const canAccessResource = (userRole: Role, resource: string, action: string): boolean => {
  const permission = `${resource}:${action}`;
  return hasPermission(userRole, permission);
};