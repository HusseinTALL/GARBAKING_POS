/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "../shared/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Design System Primary Colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4A90FF', // Primary blue from design system
          600: '#3A7FEE', // Hover state
          700: '#2A6FDD', // Pressed state
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Design System Semantic Colors
        success: {
          500: '#4CAF50', // Success green from design system
        },
        warning: {
          500: '#FF9800', // Warning orange from design system
        },
        error: {
          500: '#F44336', // Error red from design system
        },
        danger: {
          500: '#F44336', // Alias for error
        },
        info: {
          500: '#2196F3', // Info blue from design system
        },
        // Enhanced Slate Colors for Dark Theme
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          750: '#2a3441', // Custom darker slate
          800: '#1e293b',
          850: '#0f172a', // Custom darkest slate
          900: '#0f172a',
        },
        // Blue color variations for design system
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4A90FF', // Match primary
          600: '#3A7FEE',
          700: '#2A6FDD',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'header': '0 2px 4px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        // Optimized animations for 60fps performance
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fadeIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-out': 'fadeOut 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-subtle': 'bounceSubtle 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-fast': 'pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale3d(0.95, 0.95, 1)', opacity: '0' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translate3d(0, 20px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translate3d(0, -20px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '40%, 43%': { transform: 'translate3d(0, -5px, 0)' },
          '70%': { transform: 'translate3d(0, -2px, 0)' },
          '90%': { transform: 'translate3d(0, -1px, 0)' },
        },
        pulseFast: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}