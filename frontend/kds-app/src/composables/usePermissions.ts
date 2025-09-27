/**
 * Permission management composable
 * Provides reactive permission checking for Vue components
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PERMISSIONS, ROLES, hasMinimumRole, canAccessFeature, type Role } from '@/constants/permissions'

export function usePermissions() {
  const authStore = useAuthStore()

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  const hasResourcePermission = (resource: string, action: string): boolean => {
    return authStore.hasResourcePermission(resource, action)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // Role checking methods
  const hasRole = (role: Role): boolean => {
    return authStore.userRole?.name === role
  }

  const hasMinRole = (role: Role): boolean => {
    if (!authStore.userRole?.name) return false
    return hasMinimumRole(authStore.userRole.name, role)
  }

  const hasAnyRole = (roles: Role[]): boolean => {
    if (!authStore.userRole?.name) return false
    return roles.includes(authStore.userRole.name)
  }

  // Feature access checking
  const canAccessFeatureByName = (feature: string): boolean => {
    if (!authStore.userRole?.name) return false
    return canAccessFeature(authStore.userRole.name, feature)
  }

  // UI restrictions
  const canModifyOrders = computed(() =>
    authStore.userRestrictions?.canModifyOrders ?? false
  )

  const canViewFinancials = computed(() =>
    authStore.userRestrictions?.canViewFinancials ?? false
  )

  const canManageUsers = computed(() =>
    authStore.userRestrictions?.canManageUsers ?? false
  )

  const canAccessSettings = computed(() =>
    authStore.userRestrictions?.canAccessSettings ?? false
  )

  const canViewReports = computed(() =>
    authStore.userRestrictions?.canViewReports ?? false
  )

  const canManageMenu = computed(() =>
    authStore.userRestrictions?.canManageMenu ?? false
  )

  const canVoidOrders = computed(() =>
    authStore.userRestrictions?.canVoidOrders ?? false
  )

  const canRefundOrders = computed(() =>
    authStore.userRestrictions?.canRefundOrders ?? false
  )

  const maxDiscountPercent = computed(() =>
    authStore.userRestrictions?.maxDiscountPercent ?? 0
  )

  const canManageDiscount = (amount: number): boolean => {
    return authStore.canManageDiscounts(amount)
  }

  // Common permission groups
  const canManageOrdersFullly = computed(() =>
    hasAllPermissions([
      PERMISSIONS.ORDERS.CREATE,
      PERMISSIONS.ORDERS.UPDATE,
      PERMISSIONS.ORDERS.DELETE
    ])
  )

  const canAccessFinancialData = computed(() =>
    hasAnyPermission([
      PERMISSIONS.ANALYTICS.VIEW_FINANCIAL,
      PERMISSIONS.CASH.VIEW_REPORTS,
      PERMISSIONS.ORDERS.REFUND
    ])
  )

  const canAdministerSystem = computed(() =>
    hasAnyPermission([
      PERMISSIONS.USERS.CREATE,
      PERMISSIONS.USERS.MANAGE_ROLES,
      PERMISSIONS.SYSTEM.SETTINGS
    ])
  )

  const canManageMenuCompletely = computed(() =>
    hasAllPermissions([
      PERMISSIONS.MENU.CREATE,
      PERMISSIONS.MENU.UPDATE,
      PERMISSIONS.MENU.MANAGE_CATEGORIES
    ])
  )

  // Kitchen-specific permissions
  const canAccessKitchen = computed(() =>
    hasAnyPermission([
      PERMISSIONS.KITCHEN.VIEW_ORDERS,
      PERMISSIONS.KITCHEN.UPDATE_STATUS,
      PERMISSIONS.KITCHEN.MANAGE_QUEUE
    ])
  )

  // Cash management permissions
  const canManageCash = computed(() =>
    hasAnyPermission([
      PERMISSIONS.CASH.OPEN_DRAWER,
      PERMISSIONS.CASH.COUNT,
      PERMISSIONS.CASH.DEPOSIT,
      PERMISSIONS.CASH.WITHDRAW
    ])
  )

  // Analytics permissions
  const canViewAnalytics = computed(() =>
    hasAnyPermission([
      PERMISSIONS.ANALYTICS.VIEW_BASIC,
      PERMISSIONS.ANALYTICS.VIEW_DETAILED
    ])
  )

  const canExportData = computed(() =>
    hasPermission(PERMISSIONS.ANALYTICS.EXPORT)
  )

  // Role-based computed properties
  const isKitchenStaff = computed(() => hasRole(ROLES.KITCHEN))
  const isCashier = computed(() => hasMinRole(ROLES.CASHIER))
  const isManager = computed(() => hasMinRole(ROLES.MANAGER))
  const isAdmin = computed(() => hasMinRole(ROLES.ADMIN))
  const isSuperAdmin = computed(() => hasRole(ROLES.SUPER_ADMIN))

  // Navigation permissions
  const canAccessDashboard = computed(() =>
    canAccessFeatureByName('dashboard')
  )

  const canAccessOrders = computed(() =>
    canAccessFeatureByName('orders')
  )

  const canAccessMenuManagement = computed(() =>
    canAccessFeatureByName('menu-management')
  )

  const canAccessUserManagement = computed(() =>
    canAccessFeatureByName('user-management')
  )

  const canAccessAnalyticsPage = computed(() =>
    canAccessFeatureByName('analytics')
  )

  const canAccessReports = computed(() =>
    canAccessFeatureByName('reports')
  )

  const canAccessSystemSettings = computed(() =>
    canAccessFeatureByName('system-settings')
  )

  const canAccessCashManagement = computed(() =>
    canAccessFeatureByName('cash-management')
  )

  const canAccessKitchenDisplay = computed(() =>
    canAccessFeatureByName('kitchen-display')
  )

  // Error handling
  const requirePermissionOrError = (permission: string, errorMessage?: string): boolean => {
    if (!hasPermission(permission)) {
      const message = errorMessage || `Permission required: ${permission}`
      authStore.error = message
      return false
    }
    return true
  }

  const requireRoleOrError = (role: Role, errorMessage?: string): boolean => {
    if (!hasMinRole(role)) {
      const message = errorMessage || `Minimum role required: ${role}`
      authStore.error = message
      return false
    }
    return true
  }

  return {
    // Basic permission checking
    hasPermission,
    hasResourcePermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checking
    hasRole,
    hasMinRole,
    hasAnyRole,

    // Feature access
    canAccessFeatureByName,

    // UI restrictions
    canModifyOrders,
    canViewFinancials,
    canManageUsers,
    canAccessSettings,
    canViewReports,
    canManageMenu,
    canVoidOrders,
    canRefundOrders,
    maxDiscountPercent,
    canManageDiscount,

    // Permission groups
    canManageOrdersFullly,
    canAccessFinancialData,
    canAdministerSystem,
    canManageMenuCompletely,
    canAccessKitchen,
    canManageCash,
    canViewAnalytics,
    canExportData,

    // Role-based computed
    isKitchenStaff,
    isCashier,
    isManager,
    isAdmin,
    isSuperAdmin,

    // Navigation permissions
    canAccessDashboard,
    canAccessOrders,
    canAccessMenuManagement,
    canAccessUserManagement,
    canAccessAnalyticsPage,
    canAccessReports,
    canAccessSystemSettings,
    canAccessCashManagement,
    canAccessKitchenDisplay,

    // Error handling
    requirePermissionOrError,
    requireRoleOrError
  }
}