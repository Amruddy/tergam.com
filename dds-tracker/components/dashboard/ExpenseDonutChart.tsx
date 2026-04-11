'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey } from '@/lib/utils'

function CustomTooltip({ active, payload }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-xl p-2.5 shadow-xl" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <div className="flex items-center gap-1.5 text-xs">
        <span>{item.emoji}</span>
        <span style={{ color: ct.tooltipMuted }}>{item.name}</span>
      </div>
      <div className="font-semibold text-xs" style={{ color: ct.tooltipText }}>{formatCurrency(item.amount, settings.currency)}</div>
      <div className="text-xs mt-0.5" style={{ color: ct.tooltipMuted }}>{item.percentage}%</div>
    </div>
  )
}

export function ExpenseDonutChart() {
  const { transactions } = useTransactionStore()

  const data = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const byCategory: Record<string, number> = {}
    let total = 0
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(thisMonth))
      .forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; total += t.amount })
    return Object.entries(byCategory)
      .map(([id, amount]) => {
        const cat = getCategoryById(id)
        return { id, name: cat.name, emoji: cat.emoji, color: cat.color, amount, percentage: total > 0 ? Math.round((amount / total) * 100) : 0 }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-6 transition-colors duration-300"
    >
      <div className="mb-3 md:mb-4">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Структура расходов</h3>
        <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">По категориям, текущий месяц</p>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <ResponsiveContainer width="45%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="amount">
              {data.map((entry) => <Cell key={entry.id} fill={entry.color} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-slate-500 dark:text-gray-400 truncate flex-1">{item.emoji} {item.name}</span>
              <span className="text-xs font-medium text-slate-900 dark:text-white">{item.percentage}%</span>
            </div>
          ))}
          {data.length === 0 && <p className="text-slate-400 dark:text-gray-600 text-xs">Нет расходов</p>}
        </div>
      </div>
    </motion.div>
  )
}
