/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Base backgrounds
        bg: {
          primary: 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary-rgb) / <alpha-value>)',
          tertiary: 'rgb(var(--bg-tertiary-rgb) / <alpha-value>)',
        },
        // Surface / cards
        surface: {
          DEFAULT: 'rgb(var(--surface-default-rgb) / <alpha-value>)',
          hover: 'var(--surface-hover)',
          border: 'rgb(var(--surface-border-rgb) / <alpha-value>)',
          border2: 'var(--surface-border2)',
        },
        // Brand colors (purple accent kept identical in both modes)
        brand: {
          indigo: '#6366F1',
          violet: '#8B5CF6',
          indigo2: '#4F46E5',
          violet2: '#7C3AED',
        },
        // Text
        text: {
          primary: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          muted: 'var(--text-muted)',
          accent: '#6366F1',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb-spin': 'orb-spin 20s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'orb-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 60px rgba(99, 102, 241, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
