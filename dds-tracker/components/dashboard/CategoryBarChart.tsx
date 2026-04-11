'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey } from '@/lib/utils'

function CustomTooltip({ active, payload }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl p-2.5 shadow-xl" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <div className="flex items-center gap-1.5 text-xs">
        <span>{item.payload.emoji}</span>
        <span style={{ color: ct.tooltipMuted }}>{item.payload.name}</span>
      </div>
      <div className="font-semibold text-xs mt-1" style={{ color: ct.tooltipText }}>
        {formatCurrency(item.value, settings.currency)}
      </div>
    </div>
  )
}

export function CategoryBarChart() {
  const { transactions } = useTransactionStore()
  const ct = useChartTheme()

  const data = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const byCategory: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(thisMonth))
      .forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount })
    return Object.entries(byCategory)
      .map(([id, amount]) => { const cat = getCategoryById(id); return { id, name: cat.name, emoji: cat.emoji, color: cat.color, amount } })
      .sort((a, b) => b.amount - a.amount).slice(0, 6)
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-6 transition-colors duration-300"
    >
      <div className="mb-3 md:mb-4">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">По категориям</h3>
        <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">Расходы за текущий месяц</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
          <XAxis dataKey="emoji" tick={{ fill: ct.tick, fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
