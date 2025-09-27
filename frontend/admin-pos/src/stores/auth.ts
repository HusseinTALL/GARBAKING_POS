/**
 * Authentication store for POS staff management
 * Handles login, role-based permissions, and session management with backend RBAC integration
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:3001'

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
      const response = await axios.post('/api/auth/login', {
        email: credentials.employeeId,
        password: credentials.password
      })

      if (response.data.success && response.data.user && response.data.tokens) {
        const { user, tokens } = response.data

        // Set authentication data with backend permissions
        currentUser.value = {
          id: user.id,
          employeeId: user.email,
          firstName: user.name.split(' ')[0] || user.name,
          lastName: user.name.split(' ').slice(1).join(' ') || '',
          email: user.email,
          storeId: user.storeId,
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
          isActive: user.isActive,
          hireDate: new Date().toISOString(),
          preferences: {
            language: 'fr',
            theme: 'light',
            soundEnabled: true,
            notificationsEnabled: true
          },
          createdAt: new Date().toISOString()
        }
        token.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken

        // Store in localStorage for persistence
        localStorage.setItem('pos_auth_token', tokens.accessToken)
        localStorage.setItem('pos_refresh_token', tokens.refreshToken)
        localStorage.setItem('pos_user', JSON.stringify(currentUser.value))

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`

        // Set session timeout (15 minutes for access token)
        setSessionTimeout(15 * 60 * 1000)

        return true
      } else {
        error.value = response.data.message || 'Login failed'
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
        await axios.post('/api/auth/logout', { reason })
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
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: refreshToken.value
      })

      if (response.data.success && response.data.tokens) {
        const { tokens } = response.data

        token.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken

        localStorage.setItem('pos_auth_token', tokens.accessToken)
        localStorage.setItem('pos_refresh_token', tokens.refreshToken)

        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`

        // Set session timeout for new access token (15 minutes)
        setSessionTimeout(15 * 60 * 1000)

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

    // Clear localStorage
    localStorage.removeItem('pos_auth_token')
    localStorage.removeItem('pos_refresh_token')
    localStorage.removeItem('pos_user')

    // Clear axios header
    delete axios.defaults.headers.common['Authorization']

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
    const storedToken = localStorage.getItem('pos_auth_token')
    const storedUser = localStorage.getItem('pos_user')
    const storedRefreshToken = localStorage.getItem('pos_refresh_token')

    if (!storedToken || !storedUser || !storedRefreshToken) {
      return false
    }

    try {
      currentUser.value = JSON.parse(storedUser)
      token.value = storedToken
      refreshToken.value = storedRefreshToken

      // Verify the token is still valid by making a test API call
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

      try {
        await axios.get('/api/auth/verify')
        // Token is valid, set timeout for refresh
        setSessionTimeout(15 * 60 * 1000)
        return true
      } catch (verifyError) {
        // Token might be expired, try to refresh
        const refreshed = await refreshAuthToken()
        if (refreshed) {
          return true
        } else {
          clearSession()
          return false
        }
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
      const response = await axios.post('/api/staff/shifts/start', {
        staffId: currentUser.value.id,
        cashDrawerStart: cashDrawerAmount
      })

      if (response.data.success) {
        currentShift.value = response.data.data.shift
        return true
      }

      error.value = response.data.error || 'Failed to start shift'
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to start shift'
      return false
    }
  }

  const endShift = async (cashDrawerAmount?: number, notes?: string): Promise<boolean> => {
    if (!currentShift.value) return false

    try {
      const response = await axios.post(`/api/staff/shifts/${currentShift.value.id}/end`, {
        cashDrawerEnd: cashDrawerAmount,
        notes
      })

      if (response.data.success) {
        currentShift.value = null
        return true
      }

      error.value = response.data.error || 'Failed to end shift'
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to end shift'
      return false
    }
  }

  const startBreak = async (): Promise<boolean> => {
    if (!currentShift.value) return false

    try {
      const response = await axios.post(`/api/staff/shifts/${currentShift.value.id}/break/start`)

      if (response.data.success) {
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
      const response = await axios.post(`/api/staff/shifts/${currentShift.value.id}/break/end`)

      if (response.data.success) {
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
      const response = await axios.get(`/api/staff/${currentUser.value.id}/shifts/active`)

      if (response.data.success && response.data.data?.shift) {
        currentShift.value = response.data.data.shift
      }
    } catch (err) {
      console.warn('Failed to load active shift:', err)
    }
  }

  const updatePreferences = async (preferences: Partial<Staff['preferences']>): Promise<boolean> => {
    if (!currentUser.value) return false

    try {
      const response = await axios.patch(`/api/staff/${currentUser.value.id}/preferences`, preferences)

      if (response.data.success) {
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