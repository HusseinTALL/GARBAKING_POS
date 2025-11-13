/**
 * Auth Store - Manages user authentication state and actions
 * Handles login, registration, logout, and token management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = ref<boolean>(!!token.value)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const userName = computed(() => user.value?.name || 'Guest')
  const userEmail = computed(() => user.value?.email || '')
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value)

  // Actions
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)

      setUser(response.data.user)
      setToken(response.data.token)

      if (credentials.remember) {
        localStorage.setItem('remember_me', 'true')
      }

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data)

      setUser(response.data.user)
      setToken(response.data.token)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('remember_me')
    error.value = null
  }

  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const setToken = (authToken: string) => {
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
  }

  const fetchUser = async () => {
    if (!token.value) return

    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      setUser(response.data)
    } catch (err: any) {
      console.error('Failed to fetch user:', err)
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return response.data.valid
    } catch {
      return false
    }
  }

  const forgotPassword = async (email: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to send reset code'
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyCode = async (email: string, code: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, { email, code })

      if (response.data.token) {
        setUser(response.data.user)
        setToken(response.data.token)
      }

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        code,
        password: newPassword
      })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password reset failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
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
    clearError
  }
})
