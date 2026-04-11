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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`relative min-w-0 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl px-3 py-3 md:p-6 overflow-hidden transition-colors duration-300 ${glowClass}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 md:mb-4">
          <div className="w-7 h-7 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div className={`hidden md:flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg ${
            isPositiveChange ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {isPositiveChange ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="text-[11px] md:text-xs text-slate-500 dark:text-gray-500 mb-0.5 leading-tight">{label}</div>
        <div className="text-[13px] md:text-xl xl:text-2xl font-bold text-slate-900 dark:text-white leading-tight break-words">
          {formatCurrency(amount, settings.currency)}
        </div>
        <div className="text-xs text-slate-400 dark:text-gray-600 mt-1 hidden md:block">vs прошлый месяц</div>
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
      income: thisIncome, expense: thisExpense, balance: totalBalance,
      incomeChange: getChangePercent(thisIncome, lastIncome),
      expenseChange: getChangePercent(thisExpense, lastExpense),
      balanceChange: getChangePercent(totalBalance, totalBalance - thisIncome + thisExpense),
    }
  }, [accounts, transactions, transfers])

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <StatCard index={0} label="Доходы" amount={stats.income} change={stats.incomeChange}
        icon={TrendingUp} color="#22c55e" glowClass="glow-green" />
      <StatCard index={1} label="Расходы" amount={stats.expense} change={-stats.expenseChange}
        icon={TrendingDown} color="#ef4444" glowClass="glow-red" />
      <StatCard index={2} label="Баланс" amount={stats.balance} change={stats.balanceChange}
        icon={Wallet} color="#6366f1" glowClass="glow-indigo" />
    </div>
  )
}
