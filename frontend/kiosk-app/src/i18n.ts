/**
 * Vue i18n configuration for multi-language support in kiosk app
 * Supports English, French, and Arabic with automatic locale detection
 */
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' }
]

const i18n = createI18n<false>({
  legacy: false,
  locale: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    fr,
    ar
  }
})

export default i18n
