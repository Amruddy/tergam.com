import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#004D00', // Хвойный фон
        card: '#13131a',
        border: '#1e1e2e',
        green: { DEFAULT: '#66CC66', dark: '#004D00', base: '#99FF99', glow: '#66CC6633' },
        gold: { DEFAULT: '#FFD700', dark: '#D4AF37' },
        malachite: { DEFAULT: '#99FF99' },
        anthracite: { DEFAULT: '#1A1A1A' },
        red: { DEFAULT: '#ef4444', dark: '#dc2626', glow: '#ef444433' },
        indigo: { DEFAULT: '#6366f1', dark: '#4f46e5', glow: '#6366f133' },
        amber: { DEFAULT: '#f59e0b' },
      },
      fontFamily: {
        sans: ['var(--font-primary)'],
      },
      boxShadow: {
        sm: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
        md: '0 6px 16px 0 rgba(0, 0, 0, 0.12)',
        lg: '0 8px 24px 0 rgba(0, 0, 0, 0.15)',
        xl: '0 12px 32px 0 rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config
