/**
 * Main application store for global state management
 * Handles loading states, notifications, and app-wide settings
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(true)
  const loadingMessage = ref('')
  const appConfig = ref({
    restaurantName: 'Garbaking',
    currency: 'FCFA',
    taxRate: 0.1,
    supportPhone: '+225 07 12 34 56 78',
    supportEmail: 'contact@garbaking.com'
  })

  // Getters
  const formattedCurrency = computed(() => (amount: number) => {
    return formatCurrency(amount)
  })

  const taxAmount = computed(() => (subtotal: number) => {
    return subtotal * appConfig.value.taxRate
  })

  const totalWithTax = computed(() => (subtotal: number) => {
    return subtotal + taxAmount.value(subtotal)
  })

  // Actions
  const setLoading = (loading: boolean, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const updateConfig = (newConfig: Partial<typeof appConfig.value>) => {
    appConfig.value = { ...appConfig.value, ...newConfig }
  }

  return {
    // State
    isLoading,
    loadingMessage,
    appConfig,

    // Getters
    formattedCurrency,
    taxAmount,
    totalWithTax,

    // Actions
    setLoading,
    updateConfig
  }
})
