<!--
  Permission Guard Component - Conditionally renders content based on permissions
  Provides flexible permission checking with customizable fallback content
-->

<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="$slots.fallback || fallbackMessage">
    <slot name="fallback">
      <div class="flex items-center justify-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <div class="text-center">
          <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-slate-900 mb-2">Access Restricted</h3>
          <p class="text-slate-600">{{ fallbackMessage || defaultMessage }}</p>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermissions } from '@/composables/usePermissions'

interface Props {
  permission?: string
  resource?: string
  action?: string
  role?: string | string[]
  minRole?: string
  feature?: string
  any?: string[]
  all?: string[]
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: ''
})

const permissions = usePermissions()

const hasAccess = computed(() => {
  if (props.permission) {
    return permissions.hasPermission(props.permission)
  }

  if (props.resource && props.action) {
    return permissions.hasResourcePermission(props.resource, props.action)
  }

  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role : [props.role]
    return permissions.hasAnyRole(roles)
  }

  if (props.minRole) {
    return permissions.hasMinRole(props.minRole)
  }

  if (props.feature) {
    return permissions.canAccessFeatureByName(props.feature)
  }

  if (props.any) {
    return permissions.hasAnyPermission(props.any)
  }

  if (props.all) {
    return permissions.hasAllPermissions(props.all)
  }

  // Default: allow access if no restrictions specified
  return true
})

const defaultMessage = computed(() => {
  if (props.permission) {
    return `You don't have the required permission: ${props.permission}`
  }

  if (props.resource && props.action) {
    return `You cannot ${props.action} ${props.resource}`
  }

  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role.join(' or ') : props.role
    return `This feature requires ${roles} role`
  }

  if (props.minRole) {
    return `This feature requires ${props.minRole} role or higher`
  }

  if (props.feature) {
    return `You don't have access to ${props.feature} feature`
  }

  return 'You don\'t have permission to access this content'
})
</script>