/**
 * Router navigation guards for permission-based route protection
 * Handles authentication and authorization checks before route access
 */

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'

// Route metadata for permission requirements
export interface RoutePermissionMeta {
  requiresAuth?: boolean
  permission?: string
  resource?: string
  action?: string
  role?: string | string[]
  minRole?: string
  feature?: string
  any?: string[]
  all?: string[]
}

/**
 * Authentication guard - ensures user is logged in
 */
export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false // Default to true unless explicitly false

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
}

/**
 * Permission guard - checks user permissions for route access
 */
export const permissionGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const permissions = usePermissions()

  // Skip permission check if not authenticated (handled by authGuard)
  if (!authStore.isAuthenticated) {
    next()
    return
  }

  const meta = to.meta as RoutePermissionMeta

  let hasAccess = true

  // Check specific permission
  if (meta.permission) {
    hasAccess = permissions.hasPermission(meta.permission)
  }
  // Check resource-based permission
  else if (meta.resource && meta.action) {
    hasAccess = permissions.hasResourcePermission(meta.resource, meta.action)
  }
  // Check role-based access
  else if (meta.role) {
    const roles = Array.isArray(meta.role) ? meta.role : [meta.role]
    hasAccess = permissions.hasAnyRole(roles)
  }
  // Check minimum role level
  else if (meta.minRole) {
    hasAccess = permissions.hasMinRole(meta.minRole)
  }
  // Check feature access
  else if (meta.feature) {
    hasAccess = permissions.canAccessFeatureByName(meta.feature)
  }
  // Check any of multiple permissions
  else if (meta.any) {
    hasAccess = permissions.hasAnyPermission(meta.any)
  }
  // Check all permissions required
  else if (meta.all) {
    hasAccess = permissions.hasAllPermissions(meta.all)
  }

  if (!hasAccess) {
    // Redirect to unauthorized page or dashboard
    next({
      name: 'dashboard',
      query: { error: 'unauthorized' }
    })
    return
  }

  next()
}

/**
 * Role-based redirect guard - redirects users to appropriate default page
 */
export const roleRedirectGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  // Only apply to root path
  if (to.path !== '/') {
    next()
    return
  }

  if (!authStore.isAuthenticated || !authStore.userRole) {
    next()
    return
  }

  // Redirect based on role to most appropriate default page
  const userRole = authStore.userRole.name

  switch (userRole) {
    case 'KITCHEN':
      next('/kitchen')
      break
    case 'CASHIER':
      next('/orders')
      break
    case 'MANAGER':
      next('/analytics')
      break
    case 'ADMIN':
    case 'SUPER_ADMIN':
      next('/dashboard')
      break
    default:
      next('/dashboard')
      break
  }
}

/**
 * Store access guard - ensures user can access specific store data
 */
export const storeAccessGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  // Skip if not authenticated
  if (!authStore.isAuthenticated) {
    next()
    return
  }

  const requestedStoreId = to.params.storeId as string
  const userStoreId = authStore.currentUser?.storeId

  // Allow if no specific store requested
  if (!requestedStoreId) {
    next()
    return
  }

  // Allow admins to access any store
  if (authStore.isAdmin) {
    next()
    return
  }

  // Check if user belongs to requested store
  if (userStoreId !== requestedStoreId) {
    next({
      name: 'dashboard',
      query: { error: 'store_access_denied' }
    })
    return
  }

  next()
}