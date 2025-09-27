/**
 * Vue directive for permission-based element visibility
 * Provides v-permission directive to show/hide elements based on user permissions
 */

import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'

interface PermissionDirectiveValue {
  permission?: string
  resource?: string
  action?: string
  role?: string | string[]
  minRole?: string
  feature?: string
  any?: string[]
  all?: string[]
}

export const vPermission: Directive<HTMLElement, PermissionDirectiveValue | string> = {
  beforeMount(el: HTMLElement, binding) {
    checkPermission(el, binding.value)
  },
  updated(el: HTMLElement, binding) {
    checkPermission(el, binding.value)
  }
}

function checkPermission(el: HTMLElement, value: PermissionDirectiveValue | string) {
  const authStore = useAuthStore()
  const permissions = usePermissions()

  if (!authStore.isAuthenticated) {
    hideElement(el)
    return
  }

  let hasAccess = false

  // Handle string value (single permission)
  if (typeof value === 'string') {
    hasAccess = permissions.hasPermission(value)
  } else {
    // Handle object value with multiple conditions
    if (value.permission) {
      hasAccess = permissions.hasPermission(value.permission)
    } else if (value.resource && value.action) {
      hasAccess = permissions.hasResourcePermission(value.resource, value.action)
    } else if (value.role) {
      const roles = Array.isArray(value.role) ? value.role : [value.role]
      hasAccess = permissions.hasAnyRole(roles)
    } else if (value.minRole) {
      hasAccess = permissions.hasMinRole(value.minRole)
    } else if (value.feature) {
      hasAccess = permissions.canAccessFeatureByName(value.feature)
    } else if (value.any) {
      hasAccess = permissions.hasAnyPermission(value.any)
    } else if (value.all) {
      hasAccess = permissions.hasAllPermissions(value.all)
    }
  }

  if (hasAccess) {
    showElement(el)
  } else {
    hideElement(el)
  }
}

function hideElement(el: HTMLElement) {
  el.style.display = 'none'
  el.setAttribute('data-permission-hidden', 'true')
}

function showElement(el: HTMLElement) {
  if (el.getAttribute('data-permission-hidden') === 'true') {
    el.style.display = ''
    el.removeAttribute('data-permission-hidden')
  }
}

// Register directive globally
export default {
  install(app: any) {
    app.directive('permission', vPermission)
  }
}