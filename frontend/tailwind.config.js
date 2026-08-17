/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #f59e0b)',
          secondary: 'var(--brand-secondary, #18181b)',
          accent: 'var(--brand-accent, #d97706)',
          glow: 'var(--brand-glow, rgba(245, 158, 11, 0.25))',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading, "Outfit")', 'sans-serif'],
        body: ['var(--font-body, "Inter")', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px -5px var(--brand-glow, rgba(245, 158, 11, 0.3))',
        'glass-glow-lg': '0 0 45px -5px var(--brand-glow, rgba(245, 158, 11, 0.4))',
      },
    },
  },
  plugins: [],
}
