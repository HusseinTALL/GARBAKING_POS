/**
 * Auth Store - Manages user authentication state and actions
 * Integrated with Spring Boot User Service via API Gateway
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, API_ENDPOINTS } from '@/services/apiConfig'

// Type definitions matching backend DTOs
interface User {
  id: string | number
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  bio?: string
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn?: number
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = ref<boolean>(!!token.value)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const userName = computed(() => {
    if (!user.value) return 'Guest'
    return user.value.name || `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email
  })

  const userEmail = computed(() => user.value?.email || '')
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || 'customer')

  // Actions

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.login,
        {
          email: credentials.email,
          password: credentials.password
        }
      )

      // Set user and token
      setUser(response.user)
      setToken(response.token)

      // Store remember me preference
      if (credentials.remember) {
        localStorage.setItem('remember_me', 'true')
      }

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.register,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: 'CUSTOMER' // Default role for customer app
        }
      )

      // Set user and token
      setUser(response.user)
      setToken(response.token)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call backend logout endpoint if needed
      if (token.value) {
        await api.post(API_ENDPOINTS.auth.logout).catch(() => {
          // Ignore logout errors
        })
      }
    } finally {
      // Clear local state regardless of backend response
      user.value = null
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me')
      error.value = null
    }
  }

  /**
   * Set user data
   */
  const setUser = (userData: User) => {
    // Ensure name is set from firstName/lastName if not provided
    if (!userData.name && userData.firstName) {
      userData.name = `${userData.firstName} ${userData.lastName || ''}`.trim()
    }

    user.value = userData
    isAuthenticated.value = true
  }

  /**
   * Set authentication token
   */
  const setToken = (authToken: string) => {
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
    isAuthenticated.value = true
  }

  /**
   * Fetch current user profile
   */
  const fetchUser = async () => {
    if (!token.value) {
      console.warn('[Auth] No token available for fetching user')
      return
    }

    loading.value = true
    try {
      const response = await api.get<User>(API_ENDPOINTS.user.profile)
      setUser(response)
      return response
    } catch (err: any) {
      console.error('[Auth] Failed to fetch user:', err)

      // If token is invalid (401), logout
      if (err.response?.status === 401) {
        await logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validate current token
   */
  const validateToken = async (): Promise<boolean> => {
    if (!token.value) {
      return false
    }

    try {
      const response = await api.get<{ valid: boolean }>(
        API_ENDPOINTS.auth.validateToken
      )
      return response.valid
    } catch (error) {
      console.error('[Auth] Token validation failed:', error)
      return false
    }
  }

  /**
   * Request password reset
   */
  const forgotPassword = async (email: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post(
        API_ENDPOINTS.auth.forgotPassword,
        { email }
      )
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to send reset email'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Verify email with code
   */
  const verifyCode = async (email: string, code: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.verifyEmail,
        { email, code }
      )

      // If verification returns token, set user and token
      if (response.token) {
        setUser(response.user)
        setToken(response.token)
      }

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset password with code
   */
  const resetPassword = async (email: string, code: string, newPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post(
        API_ENDPOINTS.auth.resetPassword,
        {
          email,
          code,
          password: newPassword
        }
      )
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Password reset failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Initialize auth state on app load
   */
  const initialize = async () => {
    if (token.value) {
      try {
        // Validate token and fetch user
        const isValid = await validateToken()
        if (isValid) {
          await fetchUser()
        } else {
          await logout()
        }
      } catch (error) {
        console.error('[Auth] Initialization failed:', error)
        await logout()
      }
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,

    // Getters
    userName,
    userEmail,
    isLoggedIn,
    userRole,

    // Actions
    login,
    register,
    logout,
    setUser,
    setToken,
    fetchUser,
    validateToken,
    forgotPassword,
    verifyCode,
    resetPassword,
    clearError,
    initialize
  }
}, {
  persist: {
    paths: ['user', 'token', 'isAuthenticated']
  }
})
