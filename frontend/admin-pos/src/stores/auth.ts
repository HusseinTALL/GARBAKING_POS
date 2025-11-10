/**
 * Authentication store for POS staff management
 * Handles login, role-based permissions, and session management with backend RBAC integration
 * Updated to use Spring Boot microservices backend via api-spring.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, shiftsApi, preferencesApi } from '@/services/api-spring'

// Backend role types matching our permissions system
export type BackendRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN'

// Types
export interface Staff {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: StaffRole
  permissions: string[] // Array of permission strings from backend
  restrictions: UIRestrictions
  shift: Shift | null
  isActive: boolean
  profileImage?: string
  hireDate: string
  storeId: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  preferences: {
    language: 'fr' | 'en'
    theme: 'light' | 'dark' | 'auto'
    soundEnabled: boolean
    notificationsEnabled: boolean
  }
  lastLoginAt?: string
  createdAt: string
}

export interface StaffRole {
  id: string
  name: BackendRole
  displayName: string
  description: string
  level: number // 1=Kitchen, 2=Cashier, 3=Manager, 4=Admin, 5=Super Admin
  color: string
}

export interface UIRestrictions {
  canModifyOrders: boolean
  canViewFinancials: boolean
  canManageUsers: boolean
  canAccessSettings: boolean
  canViewReports: boolean
  canManageMenu: boolean
  maxDiscountPercent: number
  canVoidOrders: boolean
  canRefundOrders: boolean
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
}

export interface Shift {
  id: string
  staffId: string
  startTime: string
  endTime?: string
  breakStartTime?: string
  breakEndTime?: string
  totalHours?: number
  status: 'active' | 'break' | 'ended'
  notes?: string
  cashDrawerStart?: number
  cashDrawerEnd?: number
}

export interface LoginCredentials {
  employeeId: string
  password: string
  pinCode?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    staff: Staff
    token: string
    refreshToken: string
    expiresAt: string
  }
  error?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<Staff | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sessionTimeout = ref<number | null>(null)
  const currentShift = ref<Shift | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)

  const userRole = computed(() => currentUser.value?.role)

  const userPermissions = computed(() => currentUser.value?.permissions || [])

  const userRestrictions = computed(() => currentUser.value?.restrictions)

  const canAccess = computed(() => (permission: string) => {
    if (!currentUser.value) return false
    return userPermissions.value.includes(permission)
  })

  const canAccessResource = computed(() => (resource: string, action: string) => {
    if (!currentUser.value) return false
    const permission = `${resource}:${action}`
    return userPermissions.value.includes(permission)
  })

  const isKitchen = computed(() => userRole.value?.name === 'KITCHEN')
  const isCashier = computed(() => userRole.value?.level >= 2)
  const isManager = computed(() => userRole.value?.level >= 3)
  const isAdmin = computed(() => userRole.value?.level >= 4)
  const isSuperAdmin = computed(() => userRole.value?.level >= 5)

  const displayName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  const roleColor = computed(() => userRole.value?.color || '#6B7280')

  const roleDisplayName = computed(() => {
    if (!userRole.value) return ''
    return userRole.value.displayName
  })

  // Helper functions
  const getRoleLevel = (role: BackendRole): number => {
    switch (role) {
      case 'SUPER_ADMIN': return 5
      case 'ADMIN': return 4
      case 'MANAGER': return 3
      case 'CASHIER': return 2
      case 'KITCHEN': return 1
      default: return 1
    }
  }

  const getRoleColor = (role: BackendRole): string => {
    switch (role) {
      case 'SUPER_ADMIN': return '#7C3AED'
      case 'ADMIN': return '#DC2626'
      case 'MANAGER': return '#EA580C'
      case 'CASHIER': return '#059669'
      case 'KITCHEN': return '#2563EB'
      default: return '#6B7280'
    }
  }

  const getRoleDisplayName = (role: BackendRole): string => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Admin'
      case 'MANAGER': return 'Manager'
      case 'CASHIER': return 'Cashier'
      case 'KITCHEN': return 'Kitchen Staff'
      default: return 'Staff'
    }
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login({
        email: credentials.employeeId,
        password: credentials.password
      })

      if (response && response.user && response.token) {
        const { user, token: authToken, refreshToken: authRefreshToken } = response

        // Set authentication data with backend permissions
        currentUser.value = {
          id: user.id,
          employeeId: user.email,
          firstName: user.name.split(' ')[0] || user.name,
          lastName: user.name.split(' ').slice(1).join(' ') || '',
          email: user.email,
          storeId: user.storeId || 'store_001',
          role: {
            id: user.id,
            name: user.role as BackendRole,
            displayName: getRoleDisplayName(user.role as BackendRole),
            description: `${getRoleDisplayName(user.role as BackendRole)} role`,
            level: getRoleLevel(user.role as BackendRole),
            color: getRoleColor(user.role as BackendRole)
          },
          permissions: user.permissions || [],
          restrictions: user.restrictions || {
            canModifyOrders: false,
            canViewFinancials: false,
            canManageUsers: false,
            canAccessSettings: false,
            canViewReports: false,
            canManageMenu: false,
            maxDiscountPercent: 0,
            canVoidOrders: false,
            canRefundOrders: false
          },
          shift: null,
          isActive: user.active !== undefined ? user.active : true,
          hireDate: user.createdAt || new Date().toISOString(),
          preferences: {
            language: 'fr',
            theme: 'light',
            soundEnabled: true,
            notificationsEnabled: true
          },
          createdAt: user.createdAt || new Date().toISOString()
        }
        token.value = authToken
        refreshToken.value = authRefreshToken || authToken

        // Store in localStorage for persistence (both formats for compatibility)
        localStorage.setItem('pos_auth_token', authToken)
        localStorage.setItem('pos_refresh_token', authRefreshToken || authToken)
        localStorage.setItem('pos_user', JSON.stringify(currentUser.value))
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('refresh_token', authRefreshToken || authToken)
        localStorage.setItem('user', JSON.stringify(user))

        // Set session timeout (24 hours for access token - 5 minutes before expiry)
        setSessionTimeout(24 * 60 * 60 * 1000)

        return true
      } else {
        error.value = response.message || 'Login failed'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Network error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (reason?: string) => {
    isLoading.value = true

    try {
      // Notify server of logout
      if (token.value) {
        await authApi.logout(reason)
      }
    } catch (err) {
      console.warn('Logout API call failed:', err)
    } finally {
      // Clear local state regardless of API response
      clearSession()
      isLoading.value = false
    }
  }

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken.value) return false

    try {
      const response = await authApi.refresh(refreshToken.value)

      if (response && response.token) {
        token.value = response.token
        refreshToken.value = response.refreshToken || response.token

        localStorage.setItem('pos_auth_token', response.token)
        localStorage.setItem('pos_refresh_token', response.refreshToken || response.token)
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('refresh_token', response.refreshToken || response.token)

        // Set session timeout for new access token (24 hours)
        setSessionTimeout(24 * 60 * 60 * 1000)

        return true
      }

      return false
    } catch (err) {
      console.error('Token refresh failed:', err)
      return false
    }
  }

  const clearSession = () => {
    currentUser.value = null
    token.value = null
    refreshToken.value = null
    currentShift.value = null
    error.value = null

    // Clear localStorage (all auth-related keys)
    localStorage.removeItem('pos_auth_token')
    localStorage.removeItem('pos_refresh_token')
    localStorage.removeItem('pos_user')
    localStorage.removeItem('pos_last_verified')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')

    // Clear session timeout
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
      sessionTimeout.value = null
    }
  }

  const setSessionTimeout = (expiresIn: number) => {
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
    }

    // Refresh token 5 minutes before expiration
    const refreshIn = Math.max(0, expiresIn - 5 * 60 * 1000)

    sessionTimeout.value = setTimeout(async () => {
      const refreshed = await refreshAuthToken()
      if (!refreshed) {
        logout('Session expired')
      }
    }, refreshIn)
  }

  const loadFromStorage = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('pos_auth_token') || localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('pos_user') || localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('pos_refresh_token') || localStorage.getItem('refresh_token')
    const lastVerified = localStorage.getItem('pos_last_verified')

    if (!storedToken || !storedUser) {
      return false
    }

    try {
      currentUser.value = JSON.parse(storedUser)
      token.value = storedToken
      refreshToken.value = storedRefreshToken || storedToken

      // Check if token was verified recently (within last 5 minutes)
      const now = Date.now()
      const lastVerifiedTime = lastVerified ? parseInt(lastVerified) : 0
      const fiveMinutesAgo = now - (5 * 60 * 1000)

      // Only verify if it's been more than 5 minutes since last verification
      if (lastVerifiedTime < fiveMinutesAgo) {
        try {
          await authApi.verify()
          // Token is valid, update last verified time and set timeout for refresh
          localStorage.setItem('pos_last_verified', now.toString())
          setSessionTimeout(15 * 60 * 1000)
          return true
        } catch (verifyError) {
          // Token might be expired, try to refresh
          const refreshed = await refreshAuthToken()
          if (refreshed) {
            localStorage.setItem('pos_last_verified', now.toString())
            return true
          } else {
            clearSession()
            return false
          }
        }
      } else {
        // Token was verified recently, assume it's still valid
        setSessionTimeout(15 * 60 * 1000)
        return true
      }
    } catch (err) {
      console.error('Failed to parse stored user data:', err)
      clearSession()
      return false
    }
  }

  const startShift = async (cashDrawerAmount?: number): Promise<boolean> => {
    if (!currentUser.value) return false

    try {
      const response = await shiftsApi.startShift(currentUser.value.id, cashDrawerAmount)

      if (response && response.shift) {
        currentShift.value = response.shift
        return true
      }

      error.value = 'Failed to start shift'
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start shift'
      return false
    }
  }

  const endShift = async (cashDrawerAmount?: number, notes?: string): Promise<boolean> => {
    if (!currentShift.value) return false

    try {
      const response = await shiftsApi.endShift(currentShift.value.id, cashDrawerAmount, notes)

      if (response) {
        currentShift.value = null
        return true
      }

      error.value = 'Failed to end shift'
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to end shift'
      return false
    }
  }

  const startBreak = async (): Promise<boolean> => {
    if (!currentShift.value) return false

    try {
      const response = await shiftsApi.startBreak(currentShift.value.id)

      if (response) {
        if (currentShift.value) {
          currentShift.value.breakStartTime = new Date().toISOString()
          currentShift.value.status = 'break'
        }
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }

  const endBreak = async (): Promise<boolean> => {
    if (!currentShift.value) return false

    try {
      const response = await shiftsApi.endBreak(currentShift.value.id)

      if (response) {
        if (currentShift.value) {
          currentShift.value.breakEndTime = new Date().toISOString()
          currentShift.value.status = 'active'
        }
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }

  const loadActiveShift = async () => {
    if (!currentUser.value) return

    try {
      const response = await shiftsApi.getActiveShift(currentUser.value.id)

      if (response && response.shift) {
        currentShift.value = response.shift
      }
    } catch (err) {
      console.warn('Failed to load active shift:', err)
    }
  }

  const updatePreferences = async (preferences: Partial<Staff['preferences']>): Promise<boolean> => {
    if (!currentUser.value) return false

    try {
      const response = await preferencesApi.updatePreferences(currentUser.value.id, preferences)

      if (response) {
        currentUser.value.preferences = { ...currentUser.value.preferences, ...preferences }
        localStorage.setItem('pos_user', JSON.stringify(currentUser.value))
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }

  const hasPermission = (permission: string): boolean => {
    return canAccess.value(permission)
  }

  const hasResourcePermission = (resource: string, action: string): boolean => {
    return canAccessResource.value(resource, action)
  }

  const requirePermission = (permission: string): boolean => {
    if (!hasPermission(permission)) {
      error.value = `Access denied: ${permission} permission required`
      return false
    }
    return true
  }

  const requireResourcePermission = (resource: string, action: string): boolean => {
    if (!hasResourcePermission(resource, action)) {
      error.value = `Access denied: ${action} ${resource} not allowed`
      return false
    }
    return true
  }

  const canManageDiscounts = (discountPercent: number): boolean => {
    if (!userRestrictions.value) return false
    return discountPercent <= userRestrictions.value.maxDiscountPercent
  }

  const getMaxDiscount = (): number => {
    return userRestrictions.value?.maxDiscountPercent || 0
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentUser,
    token,
    isLoading,
    error,
    currentShift,

    // Computed
    isAuthenticated,
    userRole,
    userPermissions,
    userRestrictions,
    canAccess,
    canAccessResource,
    isKitchen,
    isCashier,
    isManager,
    isAdmin,
    isSuperAdmin,
    displayName,
    roleColor,
    roleDisplayName,

    // Actions
    login,
    logout,
    refreshAuthToken,
    clearSession,
    loadFromStorage,
    startShift,
    endShift,
    startBreak,
    endBreak,
    loadActiveShift,
    updatePreferences,
    hasPermission,
    hasResourcePermission,
    requirePermission,
    requireResourcePermission,
    canManageDiscounts,
    getMaxDiscount,
    clearError
  }
})