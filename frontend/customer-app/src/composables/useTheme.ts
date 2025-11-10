/**
 * Theme Composable
 * Manages dark/light mode, system preferences, and theme persistence
 */

import { ref, computed, watch, onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const currentMode = ref<ThemeMode>('system')
const systemPreference = ref<'light' | 'dark'>('light')

export function useTheme() {
  // Computed actual theme (resolves 'system' to actual preference)
  const actualTheme = computed(() => {
    if (currentMode.value === 'system') {
      return systemPreference.value
    }
    return currentMode.value
  })

  const isDark = computed(() => actualTheme.value === 'dark')

  // Update DOM and save preference
  const applyTheme = (theme: 'light' | 'dark') => {
    const html = document.documentElement

    if (theme === 'dark') {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
    }
  }

  // Set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    currentMode.value = mode
    localStorage.setItem('theme-mode', mode)

    if (mode === 'system') {
      applyTheme(systemPreference.value)
    } else {
      applyTheme(mode)
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    if (currentMode.value === 'system') {
      // If on system, switch to opposite of current preference
      setThemeMode(systemPreference.value === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setThemeMode(isDark.value ? 'light' : 'dark')
    }
  }

  // Listen to system preference changes
  const watchSystemPreference = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    systemPreference.value = mediaQuery.matches ? 'dark' : 'light'

    mediaQuery.addEventListener('change', (e) => {
      systemPreference.value = e.matches ? 'dark' : 'light'
      if (currentMode.value === 'system') {
        applyTheme(systemPreference.value)
      }
    })
  }

  // Initialize theme
  const initTheme = () => {
    // Get saved preference or default to system
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null
    const mode = saved || 'system'

    // Detect system preference
    watchSystemPreference()

    // Apply theme
    setThemeMode(mode)
  }

  // Watch for mode changes
  watch(actualTheme, (theme) => {
    applyTheme(theme)
  })

  // Theme-aware colors
  const colors = computed(() => ({
    // Brand colors
    primary: {
      DEFAULT: isDark.value ? '#EFC800' : '#FFB300',
      light: isDark.value ? '#FFD700' : '#FFC33A',
      dark: isDark.value ? '#CEAE00' : '#F5A300'
    },

    // Background colors
    background: {
      DEFAULT: isDark.value ? '#121212' : '#FFFFFF',
      secondary: isDark.value ? '#1A1A1A' : '#F5F5F5',
      tertiary: isDark.value ? '#2C2C2C' : '#EEEEEE'
    },

    // Text colors
    text: {
      DEFAULT: isDark.value ? '#FAFAFA' : '#222222',
      secondary: isDark.value ? '#E0E0E0' : '#616161',
      tertiary: isDark.value ? '#BDBDBD' : '#9E9E9E'
    },

    // Border colors
    border: {
      DEFAULT: isDark.value ? '#3A3A3A' : '#E0E0E0',
      light: isDark.value ? '#2C2C2C' : '#EEEEEE'
    },

    // Status colors
    success: isDark.value ? '#66BB6A' : '#3BB273',
    error: isDark.value ? '#F44336' : '#E94E3A',
    warning: isDark.value ? '#FFB300' : '#FFC107',
    info: isDark.value ? '#42A5F5' : '#1E88E5'
  }))

  // Get CSS variable for a color
  const getCssVar = (path: string) => {
    const keys = path.split('.')
    let value: any = colors.value

    for (const key of keys) {
      value = value?.[key]
    }

    return value || '#000000'
  }

  return {
    // State
    mode: currentMode,
    actualTheme,
    isDark,

    // Methods
    setThemeMode,
    toggleTheme,
    initTheme,

    // Theme-aware colors
    colors,
    getCssVar
  }
}

// Export for global access
export const themeInstance = useTheme()
