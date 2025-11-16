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
        // Professional POS Brand Colors - McDonald's/BK inspired
        primary: {
          50: '#fff8e5',
          100: '#ffecb8',
          200: '#ffe08a',
          300: '#ffd45c',
          400: '#ffc933',  // Warm golden yellow
          500: '#ffbf00',  // Main brand gold
          600: '#f5b800',
          700: '#e6ae00',
          800: '#d6a400',
          900: '#c79600',
        },
        secondary: {
          50: '#fff0f0',
          100: '#ffd6d6',
          200: '#ffb3b3',
          300: '#ff9090',
          400: '#ff6b6b',  // Vibrant red
          500: '#ff4444',  // Main red accent
          600: '#f03333',
          700: '#e02222',
          800: '#d01111',
          900: '#c00000',
        },
        accent: {
          50: '#e6f9f0',
          100: '#b8efd4',
          200: '#8ae5b8',
          300: '#5cdb9c',
          400: '#33d185',  // Fresh green
          500: '#00c853',  // Success green
          600: '#00b84a',
          700: '#00a741',
          800: '#009638',
          900: '#00852f',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#FAFAFA',
          warm: '#FFF9F0',  // Warm background
          gradient: 'linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)',
        },
        text: {
          DEFAULT: '#2C2C2C',     // Rich dark for primary text
          secondary: '#6B6B6B',   // Medium gray
          tertiary: '#9E9E9E',    // Light gray
          inverse: '#FFFFFF',     // White text
        },
        border: {
          DEFAULT: '#E8E8E8',
          dark: '#CCCCCC',
          light: '#F5F5F5',
        },
        success: {
          50: '#e6f9f0',
          500: '#00c853',
          600: '#00b84a',
          700: '#00a741',
        },
        danger: {
          50: '#fff0f0',
          500: '#ff4444',
          600: '#f03333',
          700: '#e02222',
        },
        warning: {
          50: '#fff8e5',
          500: '#ffbf00',
          600: '#f5b800',
          700: '#e6ae00',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          300: '#CCCCCC',
          400: '#B8B8B8',
          500: '#9E9E9E',
          600: '#6B6B6B',
          700: '#4A4A4A',
          800: '#2C2C2C',
          900: '#1A1A1A',
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
        'card': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'floating': '0 12px 32px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 14px rgba(255, 191, 0, 0.35)',
        'button-hover': '0 6px 20px rgba(255, 191, 0, 0.45)',
        'button-red': '0 4px 14px rgba(255, 68, 68, 0.35)',
        'button-red-hover': '0 6px 20px rgba(255, 68, 68, 0.45)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(255, 191, 0, 0.4)',
        'glow-red': '0 0 20px rgba(255, 68, 68, 0.4)',
        '3xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '32px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ffbf00 0%, #ffd45c 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        'shine': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
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