'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey } from '@/lib/utils'
import { SurfaceCard, SurfaceHeader } from './SurfaceCard'

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
      <div className="mt-1 text-xs font-semibold" style={{ color: ct.tooltipText }}>
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
      .map(([id, amount]) => {
        const cat = getCategoryById(id)
        return { id, name: cat.name, emoji: cat.emoji, color: cat.color, amount }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [transactions])

  return (
    <SurfaceCard delay={0.4}>
      <SurfaceHeader title="По категориям" subtitle="Расходы за текущий месяц" />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
          <XAxis dataKey="emoji" tick={{ fill: ct.tick, fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={28} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SurfaceCard>
  )
}
