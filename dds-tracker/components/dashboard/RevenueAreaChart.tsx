'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { formatCurrency, getMonthKey, formatMonth } from '@/lib/utils'

function CustomTooltip({ active, payload, label }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-2.5 shadow-xl" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <p className="text-xs mb-1.5" style={{ color: ct.tooltipMuted }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span style={{ color: ct.tooltipMuted }}>{p.name === 'income' ? 'Доходы' : 'Расходы'}:</span>
          <span className="font-semibold" style={{ color: ct.tooltipText }}>{formatCurrency(p.value, settings.currency)}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueAreaChart() {
  const { transactions } = useTransactionStore()
  const ct = useChartTheme()

  const data = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months[getMonthKey(d)] = { income: 0, expense: 0 }
    }
    transactions.forEach((t) => {
      const key = t.date.substring(0, 7)
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount
        else months[key].expense += t.amount
      }
    })
    return Object.entries(months).map(([key, vals]) => ({
      month: formatMonth(key + '-01'),
      income: vals.income,
      expense: vals.expense,
    }))
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-6 transition-colors duration-300"
    >
      <div className="mb-3 md:mb-4">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Доходы vs Расходы</h3>
        <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">Последние 6 месяцев</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
          <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
