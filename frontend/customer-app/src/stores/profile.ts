/**
 * Profile Store - State management for user profile
 * Manages user information, addresses, payment methods, and preferences
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoadingState, OrderType } from '@/types'

export interface UserProfile {
  id?: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  createdAt?: string
  updatedAt?: string
}

export interface Address {
  id: string
  label: string // e.g., "Home", "Work", "Other"
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
  deliveryInstructions?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'mobile' | 'other'
  cardNumber: string // Last 4 digits
  cardHolderName: string
  expiryMonth: string
  expiryYear: string
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover'
  isDefault: boolean
}

export interface OrderPreferences {
  defaultOrderType: OrderType
  defaultTableNumber?: string
  savedNotes?: string
  autoApplyVouchers: boolean
  saveOrderHistory: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  orderUpdates: boolean
  promotionalOffers: boolean
  newsletter: boolean
}

export interface AccountSecurity {
  twoFactorEnabled: boolean
  lastPasswordChange?: string
  loginHistory: LoginHistoryItem[]
}

export interface LoginHistoryItem {
  id: string
  device: string
  location: string
  timestamp: string
  ipAddress?: string
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<UserProfile>({
    name: '',
    email: '',
    phone: ''
  })

  const addresses = ref<Address[]>([])
  const paymentMethods = ref<PaymentMethod[]>([])

  const orderPreferences = ref<OrderPreferences>({
    defaultOrderType: 'DINE_IN' as OrderType,
    autoApplyVouchers: true,
    saveOrderHistory: true
  })

  const notificationSettings = ref<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotionalOffers: false,
    newsletter: false
  })

  const accountSecurity = ref<AccountSecurity>({
    twoFactorEnabled: false,
    loginHistory: []
  })

  const loadingState = ref<LoadingState>('idle')
  const error = ref<string | null>(null)

  // Getters / Computed
  const isLoading = computed(() => loadingState.value === 'loading')

  const hasProfile = computed(() => !!profile.value.name)

  const defaultAddress = computed(() =>
    addresses.value.find(addr => addr.isDefault) || addresses.value[0]
  )

  const defaultPaymentMethod = computed(() =>
    paymentMethods.value.find(pm => pm.isDefault) || paymentMethods.value[0]
  )

  const hasAddresses = computed(() => addresses.value.length > 0)

  const hasPaymentMethods = computed(() => paymentMethods.value.length > 0)

  // Actions - Profile
  function updateProfile(updates: Partial<UserProfile>) {
    profile.value = {
      ...profile.value,
      ...updates
    }
    saveToLocalStorage()
  }

  function setProfile(newProfile: UserProfile) {
    profile.value = newProfile
    saveToLocalStorage()
  }

  function clearProfile() {
    profile.value = {
      name: '',
      email: '',
      phone: ''
    }
    saveToLocalStorage()
  }

  // Actions - Addresses
  function addAddress(address: Omit<Address, 'id'>) {
    const newAddress: Address = {
      ...address,
      id: generateId()
    }

    // If this is the first address or marked as default, make it default
    if (addresses.value.length === 0 || address.isDefault) {
      // Remove default from other addresses
      addresses.value.forEach(addr => addr.isDefault = false)
      newAddress.isDefault = true
    }

    addresses.value.push(newAddress)
    saveToLocalStorage()
  }

  function updateAddress(id: string, updates: Partial<Address>) {
    const index = addresses.value.findIndex(addr => addr.id === id)
    if (index !== -1) {
      // If setting as default, remove default from others
      if (updates.isDefault) {
        addresses.value.forEach(addr => addr.isDefault = false)
      }

      addresses.value[index] = {
        ...addresses.value[index],
        ...updates
      }
      saveToLocalStorage()
    }
  }

  function removeAddress(id: string) {
    const index = addresses.value.findIndex(addr => addr.id === id)
    if (index !== -1) {
      const wasDefault = addresses.value[index].isDefault
      addresses.value.splice(index, 1)

      // If we removed the default and there are still addresses, make the first one default
      if (wasDefault && addresses.value.length > 0) {
        addresses.value[0].isDefault = true
      }

      saveToLocalStorage()
    }
  }

  function setDefaultAddress(id: string) {
    addresses.value.forEach(addr => {
      addr.isDefault = addr.id === id
    })
    saveToLocalStorage()
  }

  // Actions - Payment Methods
  function addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>) {
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: generateId()
    }

    // If this is the first payment method or marked as default, make it default
    if (paymentMethods.value.length === 0 || paymentMethod.isDefault) {
      // Remove default from other payment methods
      paymentMethods.value.forEach(pm => pm.isDefault = false)
      newPaymentMethod.isDefault = true
    }

    paymentMethods.value.push(newPaymentMethod)
    saveToLocalStorage()
  }

  function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>) {
    const index = paymentMethods.value.findIndex(pm => pm.id === id)
    if (index !== -1) {
      // If setting as default, remove default from others
      if (updates.isDefault) {
        paymentMethods.value.forEach(pm => pm.isDefault = false)
      }

      paymentMethods.value[index] = {
        ...paymentMethods.value[index],
        ...updates
      }
      saveToLocalStorage()
    }
  }

  function removePaymentMethod(id: string) {
    const index = paymentMethods.value.findIndex(pm => pm.id === id)
    if (index !== -1) {
      const wasDefault = paymentMethods.value[index].isDefault
      paymentMethods.value.splice(index, 1)

      // If we removed the default and there are still payment methods, make the first one default
      if (wasDefault && paymentMethods.value.length > 0) {
        paymentMethods.value[0].isDefault = true
      }

      saveToLocalStorage()
    }
  }

  function setDefaultPaymentMethod(id: string) {
    paymentMethods.value.forEach(pm => {
      pm.isDefault = pm.id === id
    })
    saveToLocalStorage()
  }

  // Actions - Preferences
  function updateOrderPreferences(updates: Partial<OrderPreferences>) {
    orderPreferences.value = {
      ...orderPreferences.value,
      ...updates
    }
    saveToLocalStorage()
  }

  function updateNotificationSettings(updates: Partial<NotificationSettings>) {
    notificationSettings.value = {
      ...notificationSettings.value,
      ...updates
    }
    saveToLocalStorage()
  }

  // Actions - Security
  function enableTwoFactor() {
    accountSecurity.value.twoFactorEnabled = true
    saveToLocalStorage()
  }

  function disableTwoFactor() {
    accountSecurity.value.twoFactorEnabled = false
    saveToLocalStorage()
  }

  function updatePassword(oldPassword: string, newPassword: string) {
    // In a real app, this would call an API
    accountSecurity.value.lastPasswordChange = new Date().toISOString()
    saveToLocalStorage()
    return Promise.resolve(true)
  }

  function addLoginHistoryItem(item: Omit<LoginHistoryItem, 'id'>) {
    accountSecurity.value.loginHistory.unshift({
      ...item,
      id: generateId()
    })

    // Keep only last 10 items
    if (accountSecurity.value.loginHistory.length > 10) {
      accountSecurity.value.loginHistory = accountSecurity.value.loginHistory.slice(0, 10)
    }

    saveToLocalStorage()
  }

  // Local Storage
  function saveToLocalStorage() {
    try {
      const data = {
        profile: profile.value,
        addresses: addresses.value,
        paymentMethods: paymentMethods.value,
        orderPreferences: orderPreferences.value,
        notificationSettings: notificationSettings.value,
        accountSecurity: accountSecurity.value,
        timestamp: Date.now()
      }
      localStorage.setItem('garbaking_profile', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving profile to localStorage:', error)
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('garbaking_profile')
      if (stored) {
        const data = JSON.parse(stored)

        if (data.profile) profile.value = data.profile
        if (data.addresses) addresses.value = data.addresses
        if (data.paymentMethods) paymentMethods.value = data.paymentMethods
        if (data.orderPreferences) orderPreferences.value = data.orderPreferences
        if (data.notificationSettings) notificationSettings.value = data.notificationSettings
        if (data.accountSecurity) accountSecurity.value = data.accountSecurity
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error)
    }
  }

  function clearAll() {
    clearProfile()
    addresses.value = []
    paymentMethods.value = []
    orderPreferences.value = {
      defaultOrderType: 'DINE_IN' as OrderType,
      autoApplyVouchers: true,
      saveOrderHistory: true
    }
    notificationSettings.value = {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      orderUpdates: true,
      promotionalOffers: false,
      newsletter: false
    }
    accountSecurity.value = {
      twoFactorEnabled: false,
      loginHistory: []
    }
    saveToLocalStorage()
  }

  // Utilities
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    // State
    profile,
    addresses,
    paymentMethods,
    orderPreferences,
    notificationSettings,
    accountSecurity,
    loadingState,
    error,

    // Getters
    isLoading,
    hasProfile,
    defaultAddress,
    defaultPaymentMethod,
    hasAddresses,
    hasPaymentMethods,

    // Actions - Profile
    updateProfile,
    setProfile,
    clearProfile,

    // Actions - Addresses
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,

    // Actions - Payment Methods
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,

    // Actions - Preferences
    updateOrderPreferences,
    updateNotificationSettings,

    // Actions - Security
    enableTwoFactor,
    disableTwoFactor,
    updatePassword,
    addLoginHistoryItem,

    // Actions - General
    loadFromLocalStorage,
    saveToLocalStorage,
    clearAll
  }
})
