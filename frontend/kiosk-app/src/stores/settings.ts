/**
 * Pinia store for kiosk settings management
 * Handles language, order mode, idle timeout, and payment configurations
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderMode, KioskSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<string>('en')
  const orderMode = ref<OrderMode>('dine-in')
  const idleTimeout = ref<number>(parseInt(import.meta.env.VITE_IDLE_TIMEOUT) || 60)

  const settings = ref<KioskSettings>({
    language: 'en',
    idleTimeout: 60,
    currency: '$',
    taxRate: 0.10, // 10%
    showNutritionalInfo: false,
    enableCashPayment: true,
    enableCardPayment: true,
    enableMobileMoneyPayment: true,
    enableQRPayment: true
  })

  function setLanguage(lang: string) {
    language.value = lang
    settings.value.language = lang
  }

  function setOrderMode(mode: OrderMode) {
    orderMode.value = mode
  }

  function updateSettings(newSettings: Partial<KioskSettings>) {
    settings.value = { ...settings.value, ...newSettings }
  }

  function resetSession() {
    orderMode.value = 'dine-in'
    // Language persists across sessions
  }

  return {
    language,
    orderMode,
    idleTimeout,
    settings,
    setLanguage,
    setOrderMode,
    updateSettings,
    resetSession
  }
}, {
  persist: {
    storage: localStorage,
    paths: ['language', 'settings']
  }
})
