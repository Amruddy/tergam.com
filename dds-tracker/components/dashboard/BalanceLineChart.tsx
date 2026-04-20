'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { formatCurrency, getMonthKey, getDayKey } from '@/lib/utils'
import { SurfaceCard, SurfaceHeader } from './SurfaceCard'

function CustomTooltip({ active, payload, label }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-2.5 shadow-xl" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <p className="mb-1 text-xs" style={{ color: ct.tooltipMuted }}>{label}</p>
      <p className="text-xs font-semibold" style={{ color: '#6366f1' }}>{formatCurrency(payload[0].value, settings.currency)}</p>
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

    const baseBalance = transactions
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
    <SurfaceCard delay={0.6}>
      <SurfaceHeader title="Динамика баланса" subtitle="По дням текущего месяца" />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
          <XAxis dataKey="day" tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={28} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={ct.grid} />
          <Line type="monotone" dataKey="balance" stroke="url(#balanceGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </SurfaceCard>
  )
}
