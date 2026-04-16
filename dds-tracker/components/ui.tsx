'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/categories'
import { getAccountTypeLabel } from '@/lib/accounts'
import type { Account, TransactionType } from '@/types'

/* ============================================================
   CARD
   ============================================================ */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#0F1523] rounded-2xl transition-colors duration-200',
        'border border-slate-200/70 dark:border-white/[0.06]',
        'shadow-[0_2px_12px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]',
        'dark:shadow-[0_2px_12px_rgba(0,0,0,0.30)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ============================================================
   PAGE HEADER
   ============================================================ */
export function PageHeader({
  icon: Icon, iconColor = '#7C3AED', title, subtitle, action,
}: {
  icon: LucideIcon
  iconColor?: string
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{
            background: `${iconColor}15`,
            border: `1px solid ${iconColor}25`,
            boxShadow: `0 2px 12px ${iconColor}20`,
          }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0 max-w-full">{action}</div>}
    </div>
  )
}

/* ============================================================
   STAT STRIP
   ============================================================ */
export function StatStrip({
  items,
}: {
  items: { label: string; value: string; icon: LucideIcon; color: string }[]
}) {
  const cols =
    items.length === 2 ? 'grid-cols-2' :
    items.length === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className={`grid ${cols} gap-3`}>
      {items.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.22 }}
          className="min-w-0 bg-white dark:bg-[#0F1523] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl p-3.5 md:p-4 space-y-2 transition-colors duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}
          >
            <Icon size={14} style={{ color }} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 leading-tight break-words">
              {label}
            </div>
            <div className="text-sm md:text-[15px] font-bold text-slate-900 dark:text-white mt-0.5 leading-tight break-words">
              {value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
export function EmptyState({
  emoji, title, subtitle, action,
}: {
  emoji: string
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="bg-white dark:bg-[#0F1523] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl p-10 md:p-14 flex flex-col items-center text-center gap-4 shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
    >
      <span className="text-5xl">{emoji}</span>
      <div className="space-y-1.5">
        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  )
}

/* ============================================================
   FORM CARD
   ============================================================ */
export function FormCard({
  title, onClose, children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="bg-white dark:bg-[#0F1523] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.09)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.40)]"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02]">
        <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-sm tracking-tight">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  )
}

/* ============================================================
   BUTTON
   ============================================================ */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize    = 'sm' | 'md'

export function Btn({
  children, variant = 'primary', size = 'md', className, ...props
}: {
  children: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-40 whitespace-nowrap flex-shrink-0 active:scale-[0.97]'

  const sizes: Record<BtnSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  }

  const variants: Record<BtnVariant, string> = {
    primary:   'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_4px_16px_rgba(124,58,237,0.30)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.38)]',
    secondary: 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white',
    ghost:     'text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#7C3AED]/10',
    danger:    'bg-[#E11D48]/10 text-[#E11D48] hover:bg-[#E11D48]/18 border border-[#E11D48]/20',
  }

  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

/* ============================================================
   ICON BUTTON
   ============================================================ */
export function IconBtn({
  children, variant = 'secondary', className, ...props
}: {
  children: React.ReactNode
  variant?: 'secondary' | 'danger' | 'primary'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    secondary: 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]',
    danger:    'text-[#E11D48] hover:text-[#E11D48] bg-[#E11D48]/08 hover:bg-[#E11D48]/15',
    primary:   'text-[#7C3AED] dark:text-[#A78BFA] hover:text-[#6D28D9] bg-[#7C3AED]/08 hover:bg-[#7C3AED]/15',
  }
  return (
    <button
      className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none active:scale-90',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ============================================================
   FIELD LABEL
   ============================================================ */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  )
}

/* ============================================================
   SECTION LABEL
   ============================================================ */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-0.5">
      {children}
    </p>
  )
}

/* ============================================================
   TYPE TOGGLE (income / expense)
   ============================================================ */
export function TypeToggle({
  value, onChange,
}: {
  value: 'income' | 'expense'
  onChange: (v: 'income' | 'expense') => void
}) {
  return (
    <div className="flex bg-slate-100 dark:bg-[#161D30] rounded-2xl p-1 gap-1">
      {(['expense', 'income'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
            value === t
              ? t === 'expense'
                ? 'bg-[#E11D48]/12 text-[#E11D48] border border-[#E11D48]/22 shadow-sm'
                : 'bg-[#059669]/12 text-[#059669] dark:text-[#10B981] border border-[#059669]/22 shadow-sm'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          {t === 'expense' ? '❤️  Расход' : '💚  Доход'}
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   INPUT CLASS (shared utility)
   ============================================================ */
export const inputCls =
  'w-full bg-slate-50 dark:bg-[#161D30] border border-slate-200/80 dark:border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-[#7C3AED]/50 dark:focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10 transition-all duration-150'

/* ============================================================
   CATEGORY GRID
   ============================================================ */
export function CategoryGrid({
  value, onChange, type, exclude = [],
}: {
  value: string
  onChange: (id: string) => void
  type?: TransactionType | 'all'
  exclude?: string[]
}) {
  const cats =
    type && type !== 'all'
      ? CATEGORIES.filter((c) => (c.type === type || c.type === 'both') && !exclude.includes(c.id))
      : CATEGORIES.filter((c) => !exclude.includes(c.id))

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {cats.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all duration-150 active:scale-95',
            value === cat.id
              ? 'border-2 shadow-sm'
              : 'border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] bg-slate-50/50 dark:bg-white/[0.02]'
          )}
          style={value === cat.id ? { borderColor: cat.color, background: `${cat.color}14` } : {}}
        >
          <span className="text-xl leading-none">{cat.emoji}</span>
          <span className={cn(
            'text-[9px] text-center leading-tight font-medium',
            value === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
          )}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   ACCOUNT SELECT
   ============================================================ */
export function AccountSelect({
  accounts, value, onChange,
}: {
  accounts: Account[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {accounts.map((account) => (
        <button
          key={account.id}
          type="button"
          onClick={() => onChange(account.id)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-150 active:scale-[0.97]',
            value === account.id
              ? 'border-2 shadow-sm'
              : 'border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] bg-slate-50/50 dark:bg-white/[0.02]'
          )}
          style={value === account.id ? { borderColor: account.color, background: `${account.color}12` } : {}}
        >
          <span className="text-lg leading-none">{account.emoji}</span>
          <span className="min-w-0">
            <span className={cn(
              'block text-xs font-semibold truncate',
              value === account.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
            )}>
              {account.name}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-600 truncate">
              {getAccountTypeLabel(account.type)}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
