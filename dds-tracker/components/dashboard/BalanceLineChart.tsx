'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { formatCurrency, getMonthKey, getDayKey } from '@/lib/utils'

function CustomTooltip({ active, payload, label }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-2.5 shadow-xl" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <p className="text-xs mb-1" style={{ color: ct.tooltipMuted }}>{label}</p>
      <p className="font-semibold text-xs" style={{ color: '#6366f1' }}>{formatCurrency(payload[0].value, settings.currency)}</p>
    </div>
  )
}

export function BalanceLineChart() {
  const { transactions } = useTransactionStore()
  const ct = useChartTheme()

  const data = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const year = now.getFullYear()
    const month = now.getMonth()

    let baseBalance = transactions
      .filter((t) => !t.date.startsWith(thisMonth))
      .reduce((s, t) => (t.type === 'income' ? s + t.amount : s - t.amount), 0)

    const dailyChanges: Record<string, number> = {}
    transactions.filter((t) => t.date.startsWith(thisMonth)).forEach((t) => {
      if (!dailyChanges[t.date]) dailyChanges[t.date] = 0
      dailyChanges[t.date] += t.type === 'income' ? t.amount : -t.amount
    })

    const result = []
    let running = baseBalance
    for (let d = 1; d <= now.getDate(); d++) {
      const key = getDayKey(new Date(year, month, d))
      running += dailyChanges[key] || 0
      result.push({ day: `${d}`, balance: running })
    }
    return result
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-6 transition-colors duration-300"
    >
      <div className="mb-3 md:mb-4">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Динамика баланса</h3>
        <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">По дням текущего месяца</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis dataKey="day" tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={ct.grid} />
          <Line type="monotone" dataKey="balance" stroke="url(#balanceGrad)" strokeWidth={2.5}
            dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
