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
      // ── COLORS ─────────────────────────────────────────────
      colors: {
        // Primary — Rich Violet (replaces flat indigo)
        primary: {
          DEFAULT: '#7C3AED',
          light:   '#8B5CF6',
          dark:    '#6D28D9',
          50:      '#F5F3FF',
          100:     '#EDE9FE',
          200:     '#DDD6FE',
          300:     '#C4B5FD',
          400:     '#A78BFA',
          500:     '#8B5CF6',
          600:     '#7C3AED',
          700:     '#6D28D9',
          800:     '#5B21B6',
          900:     '#4C1D95',
        },
        // Income — Emerald (replaces flat green)
        income: {
          DEFAULT: '#059669',
          light:   '#10B981',
          dark:    '#047857',
          muted:   'rgba(5,150,105,0.12)',
        },
        // Expense — Rose (replaces flat red)
        expense: {
          DEFAULT: '#E11D48',
          light:   '#F43F5E',
          dark:    '#BE123C',
          muted:   'rgba(225,29,72,0.12)',
        },
        // Neutral backgrounds (dark theme layers)
        ink: {
          950: '#080B14',
          900: '#0F1523',
          800: '#161D30',
          700: '#1E263D',
          600: '#273350',
        },
        // Keep legacy aliases for backward-compat
        green:   { DEFAULT: '#10B981', dark: '#047857', base: '#059669', glow: '#05966933' },
        gold:    { DEFAULT: '#F59E0B', dark: '#D97706' },
        red:     { DEFAULT: '#E11D48', dark: '#BE123C', glow: '#E11D4833' },
        indigo:  { DEFAULT: '#7C3AED', dark: '#6D28D9', glow: '#7C3AED33' },
        amber:   { DEFAULT: '#F59E0B' },
      },

      // ── FONTS ──────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-body)', 'var(--font-primary)', '-apple-system', 'sans-serif'],
        heading: ['var(--font-primary)', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // ── SHADOWS ────────────────────────────────────────────
      boxShadow: {
        xs:   '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)',
        sm:   '0 2px 8px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)',
        DEFAULT: '0 4px 16px rgba(15,23,42,0.09), 0 2px 6px rgba(15,23,42,0.04)',
        md:   '0 6px 20px rgba(15,23,42,0.10), 0 3px 8px rgba(15,23,42,0.05)',
        lg:   '0 10px 32px rgba(15,23,42,0.11), 0 4px 10px rgba(15,23,42,0.05)',
        xl:   '0 20px 48px rgba(15,23,42,0.13), 0 8px 16px rgba(15,23,42,0.05)',
        '2xl':'0 32px 64px rgba(15,23,42,0.15), 0 12px 24px rgba(15,23,42,0.06)',
        // Colored elevation shadows
        'violet': '0 8px 24px rgba(124,58,237,0.25), 0 2px 6px rgba(124,58,237,0.15)',
        'emerald':'0 8px 24px rgba(5,150,105,0.22), 0 2px 6px rgba(5,150,105,0.12)',
        'rose':   '0 8px 24px rgba(225,29,72,0.22), 0 2px 6px rgba(225,29,72,0.12)',
        // UI-specific
        'nav':    '0 -8px 32px rgba(15,23,42,0.09), 0 -1px 0 rgba(148,163,184,0.07)',
        'card':   '0 2px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
        'card-hover': '0 8px 24px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.06)',
        // none stays 'none'
        'none':   'none',
      },

      // ── BORDER RADIUS ──────────────────────────────────────
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── BACKGROUNDS ────────────────────────────────────────
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Premium card gradients
        'violet-card': 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(109,40,217,0.03) 100%)',
        'income-card': 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(4,120,87,0.03) 100%)',
        'expense-card':'linear-gradient(135deg, rgba(225,29,72,0.08) 0%, rgba(190,18,60,0.03) 100%)',
      },

      // ── ANIMATIONS ─────────────────────────────────────────
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.18s ease-out both',
        'slide-up':    'slideUp 0.22s ease-out both',
        'slide-down':  'slideDown 0.22s ease-out both',
        'scale-in':    'scaleIn 0.18s ease-out both',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },

      // ── TRANSITIONS ────────────────────────────────────────
      transitionDuration: { '150': '150ms', '250': '250ms', '350': '350ms' },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
}
export default config
