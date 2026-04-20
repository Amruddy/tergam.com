'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getActiveAccounts } from '@/lib/accounts'
import { cn, formatCurrency, getMonthKey, getChangePercent } from '@/lib/utils'

function StatCard({
  label, amount, change, icon: Icon, color, index, emphasis = 'secondary',
}: {
  label: string
  amount: number
  change: number
  icon: React.ElementType
  color: string
  index: number
  emphasis?: 'primary' | 'secondary'
}) {
  const { settings } = useTransactionStore()
  const isPositiveChange = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        'relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-3.5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#13131a] sm:p-5',
        emphasis === 'primary' && 'col-span-2 lg:col-span-1'
      )}
    >
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border sm:h-10 sm:w-10"
            style={{ background: `${color}20`, borderColor: `${color}30` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
              isPositiveChange ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
          >
            {isPositiveChange ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mb-1 text-[11px] leading-tight text-slate-500 dark:text-gray-500 sm:text-xs">{label}</div>
        <div
          className={cn(
            'truncate font-bold leading-tight text-slate-900 dark:text-white',
            emphasis === 'primary' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          )}
        >
          {formatCurrency(amount, settings.currency)}
        </div>
        <div className="mt-1 text-[11px] text-slate-400 dark:text-gray-600">vs прошлый месяц</div>
      </div>
    </motion.div>
  )
}

export function StatsCards() {
  const { accounts, transactions, transfers } = useTransactionStore()

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const lastMonth = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))

    const thisMonthTx = transactions.filter((t) => t.date.startsWith(thisMonth))
    const lastMonthTx = transactions.filter((t) => t.date.startsWith(lastMonth))

    const thisIncome = thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const thisExpense = thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const lastIncome = lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const lastExpense = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalBalance = getActiveAccounts(accounts).reduce((sum, account) => sum + getAccountBalance(account, transactions, transfers), 0)

    return {
      income: thisIncome,
      expense: thisExpense,
      balance: totalBalance,
      incomeChange: getChangePercent(thisIncome, lastIncome),
      expenseChange: getChangePercent(thisExpense, lastExpense),
      balanceChange: getChangePercent(totalBalance, totalBalance - thisIncome + thisExpense),
    }
  }, [accounts, transactions, transfers])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatCard index={0} label="Доходы" amount={stats.income} change={stats.incomeChange} icon={TrendingUp} color="#22c55e" />
      <StatCard index={1} label="Расходы" amount={stats.expense} change={-stats.expenseChange} icon={TrendingDown} color="#ef4444" />
      <StatCard index={2} label="Баланс" amount={stats.balance} change={stats.balanceChange} icon={Wallet} color="#6366f1" emphasis="primary" />
    </div>
  )
}
