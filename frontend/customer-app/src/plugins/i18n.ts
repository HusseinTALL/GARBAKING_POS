/**
 * Vue i18n internationalization setup
 * Configures French and English translations with localStorage persistence
 */

import { createI18n } from 'vue-i18n'
import en from '@/assets/i18n/en.json'
import fr from '@/assets/i18n/fr.json'

// Get saved locale from localStorage or default to French
const savedLocale = localStorage.getItem('locale') || 'fr'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'fr',
  messages: {
    en,
    fr
  }
})

export default i18n

// Helper function to change locale and persist to localStorage
export function setLocale(locale: 'en' | 'fr') {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

// Helper function to get current locale
export function getCurrentLocale(): string {
  return i18n.global.locale.value
}