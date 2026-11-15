/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paper / background
        paper: {
          DEFAULT: '#F7F4EF',
          50: '#FDFCFA',
          100: '#F7F4EF',
          200: '#EDE8E0',
          300: '#DDD6CB',
        },
        // Near-black text
        ink: {
          DEFAULT: '#1A1714',
          secondary: '#4A4642',
          muted: '#7A7570',
          subtle: '#A8A4A0',
        },
        // Forest green — primary environmental accent
        forest: {
          DEFAULT: '#2D5016',
          50: '#EEF4E8',
          100: '#D3E6C3',
          200: '#A8CC87',
          300: '#7DB34C',
          400: '#5A9030',
          500: '#2D5016',
          600: '#243F12',
          700: '#1B2F0D',
          800: '#121F09',
          900: '#090F04',
        },
        // Warm amber — caution
        amber: {
          DEFAULT: '#B5630A',
          50: '#FEF5E7',
          100: '#FCE4BC',
          200: '#F8C87A',
          300: '#F4AB37',
          400: '#E08A14',
          500: '#B5630A',
          600: '#8A4B07',
          700: '#5F3305',
          800: '#341C02',
          900: '#190E01',
        },
        // Restrained red — warnings
        sienna: {
          DEFAULT: '#8B2635',
          50: '#F9EAEC',
          100: '#F0C8CD',
          200: '#E0919B',
          300: '#CF5A69',
          400: '#B33847',
          500: '#8B2635',
          600: '#6B1D28',
          700: '#4B131C',
          800: '#2B0A10',
          900: '#0B0204',
        },
        // Neutral context
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '1': '1px',
        '2': '2px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(26, 23, 20, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(26, 23, 20, 0.08), 0 1px 2px -1px rgba(26, 23, 20, 0.06)',
        'md': '0 4px 6px -1px rgba(26, 23, 20, 0.08), 0 2px 4px -2px rgba(26, 23, 20, 0.06)',
        'lg': '0 10px 15px -3px rgba(26, 23, 20, 0.08), 0 4px 6px -4px rgba(26, 23, 20, 0.05)',
        'none': 'none',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
