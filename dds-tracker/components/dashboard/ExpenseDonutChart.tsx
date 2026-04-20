'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey } from '@/lib/utils'
import { SurfaceCard, SurfaceHeader } from './SurfaceCard'

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
      <div className="text-xs font-semibold" style={{ color: ct.tooltipText }}>{formatCurrency(item.amount, settings.currency)}</div>
      <div className="mt-0.5 text-xs" style={{ color: ct.tooltipMuted }}>{item.percentage}%</div>
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
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
        total += t.amount
      })
    return Object.entries(byCategory)
      .map(([id, amount]) => {
        const cat = getCategoryById(id)
        return { id, name: cat.name, emoji: cat.emoji, color: cat.color, amount, percentage: total > 0 ? Math.round((amount / total) * 100) : 0 }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  return (
    <SurfaceCard delay={0.5}>
      <SurfaceHeader title="Структура расходов" subtitle="По категориям, текущий месяц" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="mx-auto w-full max-w-[220px] sm:mx-0 sm:w-[45%]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={84} paddingAngle={2} dataKey="amount">
                {data.map((entry) => <Cell key={entry.id} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-slate-50/85 px-3 py-2 dark:bg-white/[0.03]">
              <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="flex-1 truncate text-xs text-slate-500 dark:text-gray-400">{item.emoji} {item.name}</span>
              <span className="text-xs font-medium text-slate-900 dark:text-white">{item.percentage}%</span>
            </div>
          ))}
          {data.length === 0 ? <p className="text-xs text-slate-400 dark:text-gray-600">Нет расходов</p> : null}
        </div>
      </div>
    </SurfaceCard>
  )
}
