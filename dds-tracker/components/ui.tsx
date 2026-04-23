'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoriesByType } from '@/lib/categories'
import { getAccountTypeLabel } from '@/lib/accounts'
import type { Account, TransactionType } from '@/types'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#13131a] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl transition-colors duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  icon: Icon, iconColor = '#6366f1', title, subtitle, action,
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
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${iconColor}18` }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0 max-w-full">{action}</div>}
    </div>
  )
}

export function StatStrip({
  items,
}: {
  items: { label: string; value: string; icon: LucideIcon; color: string }[]
}) {
  const cols = items.length === 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
  return (
    <div className={`grid ${cols} gap-3`}>
      {items.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="min-w-0 bg-white dark:bg-[#13131a] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3.5 md:p-4 space-y-2 transition-colors duration-300"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500 leading-tight break-words">{label}</div>
            <div className="text-sm md:text-[15px] font-bold text-slate-900 dark:text-white mt-0.5 leading-tight break-words">{value}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

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
      className="bg-white dark:bg-[#13131a] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-10 md:p-14 flex flex-col items-center text-center gap-3 transition-colors duration-300"
    >
      <span className="text-5xl">{emoji}</span>
      <div className="space-y-1">
        <p className="font-semibold text-slate-700 dark:text-gray-300 text-sm">{title}</p>
        <p className="text-xs text-slate-400 dark:text-gray-600 max-w-[220px]">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  )
}

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
      className="bg-white dark:bg-[#13131a] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden transition-colors duration-300 max-h-[min(88vh,760px)] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-slate-100 dark:border-white/[0.05]">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-4 md:p-5 space-y-4 overflow-y-auto">{children}</div>
    </motion.div>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize = 'sm' | 'md'

export function Btn({
  children, variant = 'primary', size = 'md', className, ...props
}: {
  children: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-40 whitespace-nowrap flex-shrink-0'
  const sizes: Record<BtnSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  }
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20',
    secondary: 'border border-slate-200 dark:border-white/8 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5',
    ghost: 'text-indigo-500 hover:bg-indigo-500/10',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  }

  return <button className={cn(base, sizes[size], variants[variant], className)} {...props}>{children}</button>
}

export function IconBtn({
  children, variant = 'secondary', className, ...props
}: {
  children: React.ReactNode
  variant?: 'secondary' | 'danger' | 'primary'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    secondary: 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5',
    danger: 'text-red-400 hover:text-red-500 bg-red-500/8 hover:bg-red-500/15',
    primary: 'text-indigo-400 hover:text-indigo-500 bg-indigo-500/8 hover:bg-indigo-500/15',
  }
  return (
    <button
      className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all focus:outline-none', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">{children}</label>
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-gray-600 uppercase tracking-wider px-0.5">{children}</p>
}

export function TypeToggle({
  value, onChange,
}: {
  value: 'income' | 'expense'
  onChange: (v: 'income' | 'expense') => void
}) {
  return (
    <div className="flex bg-slate-100 dark:bg-[#0d0d14] rounded-xl p-1 gap-1">
      {(['expense', 'income'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
            value === t
              ? t === 'expense'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shadow-sm'
                : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25 shadow-sm'
              : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
          )}
        >
          {t === 'expense' ? '❤️  Расход' : '💚  Доход'}
        </button>
      ))}
    </div>
  )
}

export const inputCls =
  'w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400/70 dark:focus:border-indigo-500/50 transition-colors'

export function CategoryGrid({
  value, onChange, type, exclude = [],
}: {
  value: string
  onChange: (id: string) => void
  type?: TransactionType | 'all'
  exclude?: string[]
}) {
  const cats = getCategoriesByType(type).filter((c) => !exclude.includes(c.id))

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {cats.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all',
            value === cat.id
              ? 'border-2 shadow-sm'
              : 'border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15'
          )}
          style={value === cat.id ? { borderColor: cat.color, background: `${cat.color}15` } : {}}
        >
          <span className="text-[16px] sm:text-lg leading-none">{cat.emoji}</span>
          <span className={cn('text-[9px] text-center leading-tight font-medium', value === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-600')}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  )
}

export function AccountSelect({
  accounts,
  value,
  onChange,
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
            'flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all',
            value === account.id
              ? 'border-2 shadow-sm'
              : 'border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15'
          )}
          style={value === account.id ? { borderColor: account.color, background: `${account.color}12` } : {}}
        >
          <span className="text-[15px] sm:text-base leading-none">{account.emoji}</span>
          <span className="min-w-0">
            <span className={cn('block text-xs font-semibold truncate', value === account.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300')}>
              {account.name}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-gray-600 truncate">
              {getAccountTypeLabel(account.type)}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
