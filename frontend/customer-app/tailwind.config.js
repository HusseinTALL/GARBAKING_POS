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
        // Modern green food delivery theme
        primary: {
          50: '#e8f9ed',
          100: '#c7f2d4',
          200: '#9de9b5',
          300: '#6fdf95',
          400: '#4cd964', // Main green - iOS style
          500: '#4cd964',
          600: '#3ec757',
          700: '#2eb848',
          800: '#25a23d',
          900: '#1d8933',
        },
        background: {
          DEFAULT: '#FFFFFF', // Pure white
          gray: '#F8F8F8', // Very light gray for subtle backgrounds
        },
        text: {
          DEFAULT: '#1C1C1E', // Near black - primary text
          secondary: '#8E8E93', // Gray - secondary text
          tertiary: '#C7C7CC', // Light gray - disabled/placeholder
        },
        border: {
          DEFAULT: '#E5E5EA', // Light gray borders
          dark: '#D1D1D6', // Slightly darker borders
        },
        success: {
          500: '#4cd964',
          600: '#3ec757',
        },
        danger: {
          500: '#FF3B30',
          600: '#e6352a',
        },
        warning: {
          500: '#FF9500',
          600: '#e68600',
        },
        // Neutral grays matching iOS design system
        gray: {
          50: '#F8F8F8',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#C7C7CC',
          500: '#AEAEB2',
          600: '#8E8E93',
          700: '#636366',
          800: '#48484A',
          900: '#1C1C1E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'floating': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 14px rgba(59, 130, 246, 0.4)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}