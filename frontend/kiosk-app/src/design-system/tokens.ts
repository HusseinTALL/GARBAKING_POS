/**
 * Design System Tokens
 *
 * Centralized design tokens for the Garbaking Kiosk App.
 * Defines spacing, typography, colors, shadows, borders, and animation constants
 * for consistent professional UI across all components.
 */

export const spacing = {
  // Base spacing scale (in rem)
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px

  // Kiosk-specific touch-friendly spacing
  kiosk: {
    xs: '1rem', // 16px - tight spacing
    sm: '1.5rem', // 24px - compact spacing
    md: '2rem', // 32px - standard spacing
    lg: '3rem', // 48px - comfortable spacing
    xl: '4rem', // 64px - generous spacing
    '2xl': '6rem', // 96px - extra generous
  },

  // Component-specific spacing
  component: {
    cardPadding: '2rem', // 32px
    sidebarPadding: '2rem', // 32px
    headerPadding: '2rem', // 32px
    buttonPaddingX: '2rem', // 32px
    buttonPaddingY: '1rem', // 16px
    inputPadding: '1rem', // 16px
  },
} as const

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
  },

  // Font sizes (kiosk-optimized for touch devices)
  fontSize: {
    xs: '1.125rem', // 18px
    sm: '1.25rem', // 20px
    base: '1.5rem', // 24px
    lg: '1.75rem', // 28px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem', // 48px
    '4xl': '4.5rem', // 72px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },
} as const

export const colors = {
  // Primary brand color (Orange)
  primary: {
    50: '#FFF5F0',
    100: '#FFE8DB',
    200: '#FFD1B8',
    300: '#FFB994',
    400: '#FFA170',
    500: '#FF6B35', // Main brand color
    600: '#E65A28',
    700: '#CC4A1C',
    800: '#B33A11',
    900: '#992A05',
  },

  // Secondary color (Sky Blue)
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Neutral colors (refined grays)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    text: '#FFFFFF', // White text for colored backgrounds
    textLight: '#404040', // Dark text for light backgrounds
    divider: '#E5E5E5', // Divider color
  },

  // Semantic colors
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
} as const

export const shadows = {
  // Elevation system (Material Design inspired)
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Soft shadows (professional look)
  soft: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.16)',
  },

  // Glow effects
  glow: {
    primary: '0 0 20px rgba(255, 107, 53, 0.3)',
    secondary: '0 0 20px rgba(14, 165, 233, 0.3)',
    success: '0 0 20px rgba(34, 197, 94, 0.3)',
  },
} as const

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  full: '9999px',

  // Component-specific
  button: '1rem', // 16px
  card: '1.5rem', // 24px
  input: '0.75rem', // 12px
  modal: '2rem', // 32px
} as const

export const animations = {
  // Duration (in milliseconds)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
  },

  // Easing functions
  easing: {
    // Standard easings
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Professional easings (more natural)
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default smooth
    snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Quick and responsive
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful bounce
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring physics
  },

  // Transition presets
  transition: {
    fast: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

export const touchTargets = {
  // Minimum touch target sizes (accessibility)
  min: '60px',
  comfortable: '80px',
  generous: '100px',
} as const

export const breakpoints = {
  // Responsive breakpoints (if needed for different kiosk sizes)
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  kiosk: '1920px', // Standard kiosk resolution
} as const

export const zIndex = {
  // Z-index scale
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

// Type exports for TypeScript
export type Spacing = typeof spacing
export type Typography = typeof typography
export type Colors = typeof colors
export type Shadows = typeof shadows
export type BorderRadius = typeof borderRadius
export type Animations = typeof animations
export type TouchTargets = typeof touchTargets
export type Breakpoints = typeof breakpoints
export type ZIndex = typeof zIndex
