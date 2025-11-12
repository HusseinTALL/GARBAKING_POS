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
        // Figma design - Food delivery dark theme with orange accents
        primary: {
          50: '#FFF5ED',
          100: '#FFE8D5',
          200: '#FFCFAA',
          300: '#FFB074',
          400: '#FF8A3C',
          500: '#FF7622', // Main orange
          600: '#F85D0D',
          700: '#E14209',
          800: '#B8350E',
          900: '#942F0F',
        },
        secondary: {
          50: '#FFF9E5',
          100: '#FFEFB8',
          200: '#FFE380',
          300: '#FFD748',
          400: '#FFCC1F',
          500: '#FFC22C', // Secondary yellow/gold
          600: '#EBB329',
          700: '#D19E1F',
          800: '#B78916',
          900: '#9D750D',
        },
        accent: {
          500: '#F58D1D', // Accent orange
          600: '#E76F00',
        },
        background: {
          DEFAULT: '#FFFFFF', // Pure white
          dark: '#121223', // Dark background from Figma
          gray: '#F8F8F8',
          light: '#F0F5FA', // Light gray background
          lighter: '#F6F6F6', // Very light gray
          subtle: '#ECF0F4', // Subtle gray
        },
        text: {
          DEFAULT: '#181C2E', // Primary text (dark)
          primary: '#32343E', // Primary text alternative
          secondary: '#646982', // Secondary text
          tertiary: '#A0A5BA', // Tertiary/placeholder
          light: '#676767', // Light text
          muted: '#747783', // Muted text
          dark: '#1E1D1D', // Very dark text
          contrast: '#FFFFFF', // White text on dark backgrounds
        },
        border: {
          DEFAULT: '#EDEDED', // Default border
          light: '#EBEBEB', // Light border
          lighter: '#E9E9E9', // Lighter border
        },
        success: {
          500: '#059C6A',
          600: '#048057',
        },
        danger: {
          500: '#E04444',
          600: '#C73636',
        },
        warning: {
          500: '#FFA027',
          600: '#E68600',
        },
        // Neutral grays from Figma
        gray: {
          50: '#F8F8F8',
          100: '#F0F5FA',
          200: '#EDEDED',
          300: '#D1D1D6',
          400: '#A0A5BA',
          500: '#8E8E93',
          600: '#646982',
          700: '#464E57',
          800: '#333333',
          900: '#181C2E',
        },
        // Ingredient badge colors
        ingredient: {
          bg: '#FFEBE4',
          text: '#FB6D3A',
        }
      },
      fontFamily: {
        sans: ['Sen', 'Inter', 'system-ui', 'sans-serif'], // Sen is the primary font from Figma
        body: ['Sen', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['13px', '16px'], // 13px from Figma
        'base': ['14px', '17px'], // 14px base
        'md': ['15px', '18px'], // 15px from Figma
        'lg': ['16px', '19px'], // 16px from Figma
        'xl': ['18px', '22px'], // 18px from Figma
        '2xl': ['20px', '24px'], // 20px from Figma
        '3xl': ['24px', '29px'], // 24px from Figma
        '4xl': ['28px', '34px'], // 28px from Figma
        '5xl': ['30px', '36px'], // 30px from Figma
        '6xl': ['41px', '56px'], // 41px from Figma (for big titles)
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '122': '30.5rem', // 488px
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        'card': '12px 12px 30px rgba(150, 150, 154, 0.15)', // From Figma product cards
        'card-sm': '1px 12px 20px rgba(216, 218, 224, 0.68)', // From Figma smaller cards
        'floating': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 14px rgba(255, 118, 34, 0.4)', // Orange button shadow
        'promo': '0px 10px 30px #EFE6E1', // Promo card shadow
        'offer': '0px 12px 20px rgba(0, 0, 0, 0.04)', // Offer shadow
      },
      borderRadius: {
        'sm': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '15px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '25px',
        '5xl': '30px',
        '6xl': '32px',
        '7xl': '35px',
        '8xl': '39px',
        '9xl': '50px',
        'full-card': '110px', // For special rounded elements
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(20px) translateX(-10px)' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}