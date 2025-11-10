/**
 * PizzaEats Kiosk UI - Tailwind Configuration
 * Based on design_system.json v1.4.0 - W3C Design Tokens compliant
 * Enterprise-grade design system with golden brand palette
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // COLORS - PizzaEats Brand System
      // ============================================
      colors: {
        // Golden brand colors (primary)
        brand: {
          50: '#FFF9E8',
          100: '#FFEFC1',
          200: '#FFD97B',
          300: '#FFC33A',
          400: '#FFB300',
          500: '#F5A300', // Main brand color
          600: '#E59400',
          700: '#CC8000',
          800: '#A86800',
          900: '#704600',
        },
        // Accent colors
        success: {
          50: '#E8F5E9',
          500: '#3BB273',
          600: '#2E9359',
          700: '#217640',
        },
        error: {
          50: '#FFEBEE',
          500: '#E94E3A',
          600: '#D32F2F',
          700: '#B71C1C',
        },
        warning: {
          50: '#FFF8E1',
          500: '#FFC107',
          600: '#FFB300',
          700: '#FFA000',
        },
        info: {
          50: '#E3F2FD',
          500: '#1E88E5',
          600: '#1976D2',
          700: '#1565C0',
        },
        // Neutral scale
        neutral: {
          white: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          black: '#000000',
        },
      },

      // ============================================
      // TYPOGRAPHY - Font System
      // ============================================
      fontFamily: {
        brand: ['Poppins', 'SF Pro Display', '-apple-system', 'sans-serif'],
        body: ['Inter', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
        system: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'md': ['18px', { lineHeight: '1.5' }],
        'lg': ['20px', { lineHeight: '1.5' }],
        'xl': ['24px', { lineHeight: '1.5' }],
        '2xl': ['28px', { lineHeight: '1.25' }],
        '3xl': ['32px', { lineHeight: '1.25' }],
        '4xl': ['40px', { lineHeight: '1.1' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
        '6xl': ['56px', { lineHeight: '1.1' }],
        '7xl': ['64px', { lineHeight: '1.1' }],
      },

      fontWeight: {
        thin: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },

      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.03em',
      },

      // ============================================
      // SPACING - 8px base scale
      // ============================================
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },

      // ============================================
      // BORDER RADIUS - Consistent Rounding
      // ============================================
      borderRadius: {
        'none': '0px',
        'sm': '6px',
        'DEFAULT': '12px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
      },

      // ============================================
      // SHADOWS - Elevation System
      // ============================================
      boxShadow: {
        'none': 'none',
        'sm': '0px 1px 3px rgba(0,0,0,0.1)',
        'DEFAULT': '0px 4px 8px rgba(0,0,0,0.08)',
        'md': '0px 4px 8px rgba(0,0,0,0.08)',
        'lg': '0px 8px 16px rgba(0,0,0,0.12)',
        'xl': '0px 16px 24px rgba(0,0,0,0.14)',
        'focus': '0 0 0 3px rgba(255, 217, 123, 0.5)', // brand-200 with opacity
      },

      // ============================================
      // ANIMATIONS - Professional Motion
      // ============================================
      transitionDuration: {
        'instant': '50ms',
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },

      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },

      animation: {
        'fadeIn': 'fadeIn 0.25s ease-out',
        'slideUp': 'slideUp 0.25s ease-out',
        'slideDown': 'slideDown 0.25s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite linear',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-slow': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      // ============================================
      // COMPONENT-SPECIFIC TOKENS
      // ============================================
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
        'button': '56px',
        'button-lg': '64px',
      },

      minWidth: {
        'touch': '48px',
        'button': '64px',
      },

      // ============================================
      // RESPONSIVE BREAKPOINTS
      // ============================================
      screens: {
        'xs': '360px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1600px',
      },

      // ============================================
      // Z-INDEX SCALE
      // ============================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
    },
  },
  plugins: [],
}
