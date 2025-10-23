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
        // Food-friendly warm color palette
        primary: {
          50: '#e6fffe',
          100: '#ccfffe',
          200: '#99fffd',
          300: '#66fffc',
          400: '#33fffb',
          500: '#26A69A', // Teal - Primary color for buttons and active elements
          600: '#21958a',
          700: '#1d847a',
          800: '#18736a',
          900: '#14625a',
        },
        secondary: {
          50: '#ffe9e6',
          100: '#ffd4cc',
          200: '#ffa899',
          300: '#ff7c66',
          400: '#ff5033',
          500: '#FF7F50', // Light Coral - For highlights and call-to-action
          600: '#e6724a',
          700: '#cc6644',
          800: '#b3593e',
          900: '#994c38',
        },
        background: {
          DEFAULT: '#F9F1E7', // Soft Cream - Main background
          card: '#FAF9F6', // Off-White - Card backgrounds
        },
        text: {
          DEFAULT: '#2F4F4F', // Dark Slate Gray - Main text
          light: '#4A6969',
          lighter: '#6B8484',
        },
        // Semantic colors adapted to warm palette
        success: {
          500: '#4CAF50',
        },
        warning: {
          500: '#FF9800',
        },
        error: {
          500: '#F44336',
        },
        danger: {
          500: '#F44336',
        },
        info: {
          500: '#26A69A', // Use our primary teal
        },
        // Keep some neutral grays for borders and subtle elements
        gray: {
          50: '#FAF9F6',
          100: '#F5F4F1',
          200: '#E8E6E1',
          300: '#DBD9D2',
          400: '#CECCC3',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#2F4F4F', // Match our text color
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