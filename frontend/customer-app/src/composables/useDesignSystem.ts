/**
 * Design System Composable
 * Provides access to design tokens and theme utilities from design_system.json
 * Enables consistent styling across all components
 */

import { ref, computed } from 'vue'

// Theme types
export type Theme = 'light' | 'dark' | 'highContrast'
export type ColorVariant = 'primary' | 'success' | 'error' | 'warning' | 'info'
export type ButtonVariant = 'primary' | 'outline' | 'cta'
export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'section'
export type RadiusSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type ShadowLevel = 0 | 1 | 2 | 3 | 4 | 'focus'

// Global theme state
const currentTheme = ref<Theme>('light')

export function useDesignSystem() {
  // Theme management
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  const toggleTheme = () => {
    const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const isDark = computed(() => currentTheme.value === 'dark')

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }

  // Color utilities
  const getColor = (variant: ColorVariant, shade: number = 500) => {
    const colors = {
      primary: {
        50: '#FFF9E8',
        100: '#FFEFC1',
        200: '#FFD97B',
        300: '#FFC33A',
        400: '#FFB300',
        500: '#F5A300',
        600: '#E59400',
        700: '#CC8000',
        800: '#A86800',
        900: '#704600'
      },
      success: {
        500: '#3BB273'
      },
      error: {
        500: '#E94E3A'
      },
      warning: {
        500: '#FFC107'
      },
      info: {
        500: '#1E88E5'
      }
    }
    return colors[variant]?.[shade as keyof typeof colors.primary] || colors[variant]?.[500]
  }

  // Spacing utilities
  const spacing = {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    section: '64px'
  }

  const getSpacing = (size: SpacingSize) => spacing[size]

  // Border radius utilities
  const radius = {
    none: '0px',
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px'
  }

  const getRadius = (size: RadiusSize) => radius[size]

  // Shadow utilities
  const shadows = {
    0: 'none',
    1: '0px 1px 3px rgba(0,0,0,0.1)',
    2: '0px 4px 8px rgba(0,0,0,0.08)',
    3: '0px 8px 16px rgba(0,0,0,0.12)',
    4: '0px 16px 24px rgba(0,0,0,0.14)',
    focus: '0 0 0 3px #FFD97B'
  }

  const getShadow = (level: ShadowLevel) => shadows[level]

  // Typography utilities
  const typography = {
    families: {
      brand: "'Poppins', 'SF Pro Display', -apple-system, sans-serif",
      body: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
      system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'Roboto Mono', monospace"
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      md: '18px',
      lg: '20px',
      xl: '24px',
      '2xl': '28px',
      '3xl': '32px',
      '4xl': '40px',
      '5xl': '48px',
      '6xl': '56px',
      '7xl': '64px'
    },
    weights: {
      thin: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  }

  const getTypography = () => typography

  // Motion utilities
  const motion = {
    duration: {
      instant: '0.05s',
      fast: '0.15s',
      normal: '0.25s',
      slow: '0.4s'
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  }

  const getMotion = () => motion

  // Button styles
  const getButtonStyles = (variant: ButtonVariant = 'primary') => {
    const base = {
      height: '56px',
      paddingX: '24px',
      borderRadius: '12px',
      fontSize: '20px',
      fontWeight: 600,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    const variants = {
      primary: {
        ...base,
        background: '#FFB300',
        color: '#FFFFFF',
        shadow: '0px 4px 8px rgba(0,0,0,0.08)',
        hover: {
          background: '#FFC33A',
          transform: 'translateY(-2px)',
          shadow: '0px 8px 16px rgba(0,0,0,0.12)'
        }
      },
      outline: {
        ...base,
        background: 'transparent',
        color: '#F5A300',
        border: '2px solid #F5A300',
        hover: {
          background: '#FFF9E8'
        }
      },
      cta: {
        ...base,
        height: '64px',
        background: 'linear-gradient(90deg, #FFC33A, #F5A300)',
        color: '#FFFFFF',
        shadow: '0px 8px 16px rgba(0,0,0,0.12)',
        borderRadius: '16px',
        fontWeight: 700
      }
    }

    return variants[variant]
  }

  // Card styles
  const getCardStyles = (type: 'menu' | 'info' = 'menu') => {
    const styles = {
      menu: {
        background: '#FFFFFF',
        borderRadius: '16px',
        shadow: '0px 4px 8px rgba(0,0,0,0.08)',
        padding: '16px',
        hover: {
          transform: 'translateY(-4px)',
          shadow: '0px 8px 16px rgba(0,0,0,0.12)'
        }
      },
      info: {
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #EEEEEE',
        padding: '8px'
      }
    }
    return styles[type]
  }

  // Accessibility utilities
  const a11y = {
    focusRing: '0 0 0 3px #FFD97B',
    touchTarget: {
      min: 48,
      recommended: 56
    },
    contrast: {
      minText: '4.5:1',
      ui: '3:1'
    }
  }

  const getA11y = () => a11y

  return {
    // Theme
    theme: currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    isDark,

    // Design tokens
    getColor,
    getSpacing,
    getRadius,
    getShadow,
    getTypography,
    getMotion,

    // Component styles
    getButtonStyles,
    getCardStyles,

    // Accessibility
    getA11y,

    // Direct access to design token objects
    spacing,
    radius,
    shadows,
    typography,
    motion
  }
}
