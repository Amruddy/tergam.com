'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getActiveAccounts } from '@/lib/accounts'
import { formatCurrency, getMonthKey, getChangePercent } from '@/lib/utils'
import { useMemo } from 'react'

function StatCard({
  label, amount, change, icon: Icon, color, glowClass, index,
}: {
  label: string; amount: number; change: number; icon: React.ElementType
  color: string; glowClass: string; index: number
}) {
  const { settings } = useTransactionStore()
  const isPositiveChange = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`relative min-w-0 bg-white dark:bg-[#0F1523] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl px-3 py-3 md:p-5 overflow-hidden transition-colors duration-200 ${glowClass}`}
      style={{
        boxShadow: '0 2px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
      }}
    >
      {/* Subtle color tint background */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 md:mb-3.5">
          {/* Icon */}
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}28`,
            }}
          >
            <Icon size={15} className="md:hidden" style={{ color }} />
            <Icon size={18} className="hidden md:block" style={{ color }} />
          </div>

          {/* Change badge — visible on all screen sizes */}
          <div
            className={`flex items-center gap-0.5 text-[10px] md:text-xs font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg`}
            style={{
              background: isPositiveChange ? 'rgba(5,150,105,0.10)' : 'rgba(225,29,72,0.10)',
              color: isPositiveChange ? '#059669' : '#E11D48',
            }}
          >
            {isPositiveChange
              ? <ArrowUpRight size={10} />
              : <ArrowDownRight size={10} />
            }
            <span>{Math.abs(change)}%</span>
          </div>
        </div>

        <div className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-0.5 leading-tight font-medium">
          {label}
        </div>
        <div className="text-[13px] md:text-xl xl:text-2xl font-bold text-slate-900 dark:text-white leading-tight break-words font-heading">
          {formatCurrency(amount, settings.currency)}
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 hidden md:block">
          vs прошлый месяц
        </div>
      </div>
    </motion.div>
  )
}

export function StatsCards() {
  const { accounts, transactions, transfers } = useTransactionStore()

  const stats = useMemo(() => {
    const now      = new Date()
    const thisMonth = getMonthKey(now)
    const lastMonth = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))

    const thisMonthTx = transactions.filter((t) => t.date.startsWith(thisMonth))
    const lastMonthTx = transactions.filter((t) => t.date.startsWith(lastMonth))

    const thisIncome  = thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const thisExpense = thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const lastIncome  = lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const lastExpense = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalBalance = getActiveAccounts(accounts).reduce(
      (sum, account) => sum + getAccountBalance(account, transactions, transfers), 0
    )

    return {
      income: thisIncome, expense: thisExpense, balance: totalBalance,
      incomeChange:  getChangePercent(thisIncome, lastIncome),
      expenseChange: getChangePercent(thisExpense, lastExpense),
      balanceChange: getChangePercent(totalBalance, totalBalance - thisIncome + thisExpense),
    }
  }, [accounts, transactions, transfers])

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3.5">
      <StatCard index={0} label="Доходы"  amount={stats.income}  change={stats.incomeChange}
        icon={TrendingUp}   color="#059669" glowClass="glow-income" />
      <StatCard index={1} label="Расходы" amount={stats.expense} change={-stats.expenseChange}
        icon={TrendingDown} color="#E11D48" glowClass="glow-expense" />
      <StatCard index={2} label="Баланс"  amount={stats.balance} change={stats.balanceChange}
        icon={Wallet}       color="#7C3AED" glowClass="glow-primary" />
    </div>
  )
}
