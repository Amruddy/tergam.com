'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wallet, Trophy, RefreshCw, Landmark, ChevronRight, AlertTriangle } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getActiveAccounts } from '@/lib/accounts'
import { formatCurrency, getMonthKey } from '@/lib/utils'
import { SurfaceCard, SurfaceHeader } from './SurfaceCard'

export function QuickTools() {
  const { accounts, budgets, goals, recurring, transactions, transfers, settings } = useTransactionStore()

  const now = new Date()
  const thisMonth = getMonthKey(now)

  const overages = budgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === b.category && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0)
    return spent > b.amount
  }).length

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const goalsPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
  const activeRecurring = recurring.filter((r) => r.active).length
  const activeAccounts = getActiveAccounts(accounts)
  const totalBalance = activeAccounts.reduce((sum, account) => sum + getAccountBalance(account, transactions, transfers), 0)

  const tools = [
    {
      href: '/accounts',
      icon: Landmark,
      label: 'Счета',
      color: '#0ea5e9',
      value: `${activeAccounts.length} шт.`,
      warn: false,
      sub: formatCurrency(totalBalance, settings.currency),
    },
    {
      href: '/budgets',
      icon: Wallet,
      label: 'Бюджеты',
      color: '#6366f1',
      value: budgets.length > 0 ? overages > 0 ? `${overages} превыш.` : `${budgets.length} активных` : 'Не настроено',
      warn: overages > 0,
      sub: budgets.length > 0 ? 'Лимиты расходов' : 'Добавьте первый',
    },
    {
      href: '/goals',
      icon: Trophy,
      label: 'Цели',
      color: '#f59e0b',
      value: goals.length > 0 ? `${goalsPct}% выполнено` : 'Нет целей',
      warn: false,
      sub: goals.length > 0 ? `${formatCurrency(totalSaved, settings.currency)} / ${formatCurrency(totalTarget, settings.currency)}` : 'Поставьте финансовую цель',
    },
    {
      href: '/recurring',
      icon: RefreshCw,
      label: 'Автоплатежи',
      color: '#22c55e',
      value: recurring.length > 0 ? `${activeRecurring} из ${recurring.length}` : 'Не настроено',
      warn: false,
      sub: recurring.length > 0 ? 'активных платежей' : 'Добавьте первый',
    },
  ]

  return (
    <SurfaceCard delay={0.22} className="space-y-4">
      <SurfaceHeader
        title="Быстрый доступ"
        subtitle="Ключевые разделы и состояние настроек без лишней перегрузки."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map(({ href, icon: Icon, label, color, value, warn, sub }, i) => (
          <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link href={href} className="group block rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4 transition-all hover:border-slate-300 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.025] dark:hover:border-white/10 dark:hover:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] md:text-xs uppercase tracking-[0.08em] text-slate-400 dark:text-gray-500">{label}</p>
                    <p className={`mt-1 flex items-center gap-1 truncate text-sm font-semibold leading-tight ${warn ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      {warn && <AlertTriangle size={12} className="flex-shrink-0" />}
                      <span className="truncate">{value}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-gray-500 line-clamp-2">{sub}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="mt-1 flex-shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </SurfaceCard>
  )
}
