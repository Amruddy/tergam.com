'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTransactionStore, useChartTheme } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey, formatMonth, getChangePercent } from '@/lib/utils'
import {
  TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight,
  Wallet, Activity, Tag, Target, Hash, BarChart2,
} from 'lucide-react'
import { Transaction } from '@/types'
import { PageHeader } from '@/components/ui'
import { SurfaceCard } from '@/components/dashboard/SurfaceCard'

// ── Types & constants ─────────────────────────────────────────────────────────

type Period = '1m' | '3m' | '6m' | '1y' | 'all'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1m', label: '1 мес' },
  { value: '3m', label: '3 мес' },
  { value: '6m', label: '6 мес' },
  { value: '1y', label: 'Год' },
  { value: 'all', label: 'Всё' },
]

const TAG_COLORS = [
  '#6366f1', '#f59e0b', '#22c55e', '#ec4899',
  '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ef4444', '#84cc16',
]

const DOW_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

// ── Helpers ───────────────────────────────────────────────────────────────────

function inRange(dateStr: string, from: Date, to: Date) {
  const d = new Date(dateStr + 'T12:00:00')
  return d >= from && d <= to
}

interface PeriodRange {
  from: Date
  to: Date
  prevFrom: Date
  prevTo: Date
}

function getPeriodRange(period: Period, now: Date, transactions: Transaction[]): PeriodRange {
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  if (period === '1m') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: endOfMonth,
      prevFrom: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      prevTo: new Date(now.getFullYear(), now.getMonth(), 0),
    }
  }
  if (period === '3m') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      to: endOfMonth,
      prevFrom: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      prevTo: new Date(now.getFullYear(), now.getMonth() - 2, 0),
    }
  }
  if (period === '6m') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      to: endOfMonth,
      prevFrom: new Date(now.getFullYear(), now.getMonth() - 11, 1),
      prevTo: new Date(now.getFullYear(), now.getMonth() - 5, 0),
    }
  }
  if (period === '1y') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 11, 1),
      to: endOfMonth,
      prevFrom: new Date(now.getFullYear() - 1, now.getMonth() - 11, 1),
      prevTo: new Date(now.getFullYear(), now.getMonth() - 11, 0),
    }
  }
  // 'all'
  const sorted = transactions.map((t) => t.date).sort()
  const earliest = sorted.length > 0
    ? new Date(sorted[0].substring(0, 7) + '-01T12:00:00')
    : new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: earliest, to: endOfMonth, prevFrom: new Date(0), prevTo: new Date(0) }
}

// ── Custom tooltips ───────────────────────────────────────────────────────────

function CashflowTooltip({ active, payload, label }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  const income = payload.find((p: any) => p.dataKey === 'income')?.value ?? 0
  const expense = payload.find((p: any) => p.dataKey === 'expense')?.value ?? 0
  const bal = income - expense
  return (
    <div className="rounded-xl p-3 shadow-2xl text-xs" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <p className="font-medium mb-2" style={{ color: ct.tooltipMuted }}>{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span style={{ color: ct.tooltipMuted }}>Доходы:</span>
          <span className="font-bold ml-auto" style={{ color: ct.tooltipText }}>{formatCurrency(income, settings.currency)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span style={{ color: ct.tooltipMuted }}>Расходы:</span>
          <span className="font-bold ml-auto" style={{ color: ct.tooltipText }}>{formatCurrency(expense, settings.currency)}</span>
        </div>
        <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: ct.tooltipBorder }}>
          <div className="flex items-center justify-between gap-4">
            <span style={{ color: ct.tooltipMuted }}>Баланс:</span>
            <span className="font-bold" style={{ color: bal >= 0 ? '#22c55e' : '#ef4444' }}>
              {formatCurrency(bal, settings.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DowTooltip({ active, payload, label }: any) {
  const { settings } = useTransactionStore()
  const ct = useChartTheme()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-2.5 shadow-xl text-xs" style={{ background: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}` }}>
      <p className="font-medium mb-1" style={{ color: ct.tooltipMuted }}>{label}</p>
      <p className="font-bold" style={{ color: ct.tooltipText }}>{formatCurrency(payload[0].value, settings.currency)}</p>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, color, change, changeInverted, delay, emphasis = 'secondary',
}: {
  label: string; value: string; sub: string
  icon: React.ElementType; color: string
  change: number | null; changeInverted?: boolean
  delay?: number
  emphasis?: 'primary' | 'secondary'
}) {
  const isPositiveChange = changeInverted ? (change ?? 0) < 0 : (change ?? 0) > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
      className={`rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#13131a] ${emphasis === 'primary' ? 'col-span-2 xl:col-span-1' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
        {change !== null && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            isPositiveChange ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
          }`}>
            {(change ?? 0) > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(change ?? 0)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-[10px] text-slate-400 dark:text-gray-500 leading-tight">{label}</div>
        <div className={`mt-1 truncate font-bold leading-tight text-slate-900 dark:text-white ${emphasis === 'primary' ? 'text-lg' : 'text-base'}`}>{value}</div>
        <div className="mt-1 text-[10px] leading-relaxed text-slate-400 dark:text-gray-600">{sub}</div>
      </div>
    </motion.div>
  )
}

function SectionCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <SurfaceCard delay={delay} className={className}>
      {children}
    </SurfaceCard>
  )
}

function CategoryRow({ emoji, name, amount, pct, color, currency, delay }: {
  emoji: string; name: string; amount: number; pct: number
  color: string; currency: any; delay: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{emoji}</span>
          <span className="text-sm text-slate-700 dark:text-gray-300 truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-gray-500">{pct.toFixed(1)}%</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-[70px] text-right">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsContent() {
  const { transactions, settings } = useTransactionStore()
  const ct = useChartTheme()
  const [period, setPeriod] = useState<Period>('1m')

  const data = useMemo(() => {
    const now = new Date()
    const { from, to, prevFrom, prevTo } = getPeriodRange(period, now, transactions)

    const currentTx = transactions.filter((t) => inRange(t.date, from, to))
    const prevTx = period !== 'all' ? transactions.filter((t) => inRange(t.date, prevFrom, prevTo)) : []

    // ── KPI totals ──────────────────────────────────────────────────────────
    const income = currentTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = currentTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense
    const savingsRate = income > 0 ? Math.round((Math.max(0, balance) / income) * 100) : 0
    const daysInPeriod = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000))
    const avgDaily = expense / daysInPeriod
    const txCount = currentTx.length
    const maxExpenseTx = [...currentTx].filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0]

    // ── Monthly chart ───────────────────────────────────────────────────────
    const monthMap: Record<string, { income: number; expense: number }> = {}
    let cur = new Date(from.getFullYear(), from.getMonth(), 1)
    const end = new Date(to.getFullYear(), to.getMonth() + 1, 1)
    while (cur < end) {
      monthMap[getMonthKey(cur)] = { income: 0, expense: 0 }
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    }
    currentTx.forEach((t) => {
      const key = t.date.substring(0, 7)
      if (monthMap[key]) {
        if (t.type === 'income') monthMap[key].income += t.amount
        else monthMap[key].expense += t.amount
      }
    })
    const monthlyChart = Object.entries(monthMap).map(([k, v]) => ({
      month: formatMonth(k + '-01'),
      income: v.income,
      expense: v.expense,
    }))

    // ── Expense categories (% of total) ────────────────────────────────────
    const expCatMap: Record<string, number> = {}
    currentTx.filter((t) => t.type === 'expense').forEach((t) => {
      expCatMap[t.category] = (expCatMap[t.category] || 0) + t.amount
    })
    const totalExpenseForCats = Object.values(expCatMap).reduce((s, v) => s + v, 0)
    const topExpenseCategories = Object.entries(expCatMap)
      .map(([id, amount]) => ({
        ...getCategoryById(id),
        amount,
        pct: totalExpenseForCats > 0 ? (amount / totalExpenseForCats) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7)

    // ── Income categories (% of total) ─────────────────────────────────────
    const incCatMap: Record<string, number> = {}
    currentTx.filter((t) => t.type === 'income').forEach((t) => {
      incCatMap[t.category] = (incCatMap[t.category] || 0) + t.amount
    })
    const totalIncomeForCats = Object.values(incCatMap).reduce((s, v) => s + v, 0)
    const topIncomeCategories = Object.entries(incCatMap)
      .map(([id, amount]) => ({
        ...getCategoryById(id),
        amount,
        pct: totalIncomeForCats > 0 ? (amount / totalIncomeForCats) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // ── Day-of-week spending ────────────────────────────────────────────────
    const dowData: { total: number; count: number }[] = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }))
    currentTx.filter((t) => t.type === 'expense').forEach((t) => {
      const dow = new Date(t.date + 'T12:00:00').getDay()
      dowData[dow].total += t.amount
      dowData[dow].count++
    })
    const maxDowTotal = Math.max(...dowData.map((d) => d.total), 1)
    const dowChart = DOW_LABELS.map((name, i) => ({
      name,
      amount: dowData[i].total,
      pct: (dowData[i].total / maxDowTotal) * 100,
    }))

    // ── Tags ────────────────────────────────────────────────────────────────
    const tagMap: Record<string, { amount: number; count: number }> = {}
    currentTx.filter((t) => t.type === 'expense' && t.tags?.length > 0).forEach((t) => {
      t.tags.forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { amount: 0, count: 0 }
        tagMap[tag].amount += t.amount
        tagMap[tag].count++
      })
    })
    const totalTagAmount = Object.values(tagMap).reduce((s, v) => s + v.amount, 0)
    const topTags = Object.entries(tagMap)
      .map(([tag, v]) => ({ tag, ...v, pct: totalTagAmount > 0 ? (v.amount / totalTagAmount) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)

    return {
      income, expense, balance, savingsRate, avgDaily, txCount, maxExpenseTx,
      incomeChange: period !== 'all' ? getChangePercent(income, prevIncome) : null,
      expenseChange: period !== 'all' ? getChangePercent(expense, prevExpense) : null,
      monthlyChart, topExpenseCategories, topIncomeCategories, dowChart, topTags,
    }
  }, [transactions, period])

  const savingsColor = data.savingsRate >= 20 ? '#22c55e' : data.savingsRate >= 10 ? '#f59e0b' : '#ef4444'
  const savingsSub = data.savingsRate >= 20 ? 'Отличная норма' : data.savingsRate >= 10 ? 'Средняя норма' : 'Низкая норма'

  return (
    <div className="space-y-4 py-2 sm:space-y-5">

      {/* ── Header + period selector ── */}
      <PageHeader
        icon={BarChart2}
        iconColor="#6366f1"
        title="Аналитика"
        subtitle="Доходы, расходы и тренды за выбранный период"
      />

      {/* ── Period selector ── */}
      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.06] dark:bg-[#13131a] sm:w-fit lg:gap-1.5 lg:p-1.5">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              period === opt.value
                ? 'bg-white dark:bg-[#1e1e2e] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard delay={0} label="Доходы" value={formatCurrency(data.income, settings.currency)}
          sub={data.incomeChange !== null ? `Пред. период: ${data.incomeChange > 0 ? '+' : ''}${data.incomeChange}%` : 'За всё время'}
          icon={TrendingUp} color="#22c55e"
          change={data.incomeChange} changeInverted={false}
        />
        <KpiCard delay={0.05} label="Расходы" value={formatCurrency(data.expense, settings.currency)}
          sub={data.expenseChange !== null ? `Пред. период: ${data.expenseChange > 0 ? '+' : ''}${data.expenseChange}%` : 'За всё время'}
          icon={TrendingDown} color="#ef4444"
          change={data.expenseChange} changeInverted={true}
        />
        <KpiCard delay={0.1} label="Баланс" value={formatCurrency(data.balance, settings.currency)}
          sub={data.balance >= 0 ? 'Положительный' : 'Отрицательный'}
          icon={Wallet} color={data.balance >= 0 ? '#22c55e' : '#ef4444'}
          change={null} emphasis="primary"
        />
        <KpiCard delay={0.15} label="Норма сбережений" value={`${data.savingsRate}%`}
          sub={savingsSub}
          icon={Target} color={savingsColor}
          change={null}
        />
        <KpiCard delay={0.2} label="Ср. расход / день" value={formatCurrency(data.avgDaily, settings.currency)}
          sub="За выбранный период"
          icon={Activity} color="#f59e0b"
          change={null}
        />
        <KpiCard delay={0.25} label="Транзакций" value={String(data.txCount)}
          sub={data.maxExpenseTx ? `Макс: ${formatCurrency(data.maxExpenseTx.amount, settings.currency)}` : 'За период'}
          icon={Hash} color="#06b6d4"
          change={null}
        />
      </div>

      {/* ── Cashflow chart ── */}
      <SectionCard delay={0.3}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Динамика доходов и расходов</h3>
            <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">По месяцам за выбранный период</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500 opacity-60" />
              <span className="text-xs text-slate-400 dark:text-gray-500">Доходы</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500 opacity-60" />
              <span className="text-xs text-slate-400 dark:text-gray-500">Расходы</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.monthlyChart} margin={{ top: 5, right: 6, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: ct.tick, fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={28} />
            <Tooltip content={<CashflowTooltip />} cursor={{ stroke: ct.grid, strokeWidth: 1 }} />
            <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2}
              fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#22c55e' }} />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2}
              fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }} />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Expense categories + Day of week ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">

        {/* Expense categories */}
        <SectionCard delay={0.35} className="xl:col-span-3">
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base mb-0.5">Расходы по категориям</h3>
          <p className="text-slate-400 dark:text-gray-500 text-xs mb-4">% от суммы всех расходов за период</p>
          {data.topExpenseCategories.length === 0 ? (
            <p className="text-slate-400 dark:text-gray-600 text-sm py-4 text-center">Нет расходов за этот период</p>
          ) : (
            <div className="space-y-3.5">
              {data.topExpenseCategories.map((cat, i) => (
                <CategoryRow key={cat.id} emoji={cat.emoji} name={cat.name}
                  amount={cat.amount} pct={cat.pct} color={cat.color}
                  currency={settings.currency} delay={0.45 + i * 0.07}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Day of week */}
        <SectionCard delay={0.4} className="xl:col-span-2">
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base mb-0.5">По дням недели</h3>
          <p className="text-slate-400 dark:text-gray-500 text-xs mb-4">Сумма расходов по дням</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.dowChart} margin={{ top: 0, right: 6, left: -18, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: ct.tick, fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: ct.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<DowTooltip />} cursor={{ fill: ct.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {data.dowChart.map((entry, i) => (
                  <Cell key={i} fill="#6366f1" fillOpacity={0.35 + (entry.pct / 100) * 0.65} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Income sources + Tags ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* Income sources */}
        <SectionCard delay={0.5}>
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base mb-0.5">Источники дохода</h3>
          <p className="text-slate-400 dark:text-gray-500 text-xs mb-4">% от суммы всех доходов за период</p>
          {data.topIncomeCategories.length === 0 ? (
            <p className="text-slate-400 dark:text-gray-600 text-sm py-4 text-center">Нет доходов за этот период</p>
          ) : (
            <div className="space-y-3.5">
              {data.topIncomeCategories.map((cat, i) => (
                <CategoryRow key={cat.id} emoji={cat.emoji} name={cat.name}
                  amount={cat.amount} pct={cat.pct} color={cat.color}
                  currency={settings.currency} delay={0.55 + i * 0.07}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Tags */}
        <SectionCard delay={0.55}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Tag size={14} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Теги</h3>
              <p className="text-slate-400 dark:text-gray-500 text-xs">Расходы по тегам за период</p>
            </div>
          </div>
          {data.topTags.length === 0 ? (
            <p className="text-slate-400 dark:text-gray-600 text-sm py-4 text-center">Нет транзакций с тегами</p>
          ) : (
            <div className="space-y-3">
              {data.topTags.map((item, i) => (
                <div key={item.tag}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{
                          background: `${TAG_COLORS[i % TAG_COLORS.length]}18`,
                          color: TAG_COLORS[i % TAG_COLORS.length],
                        }}
                      >
                        #{item.tag}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">{item.count} тр.</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 dark:text-gray-500">{item.pct.toFixed(1)}%</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-[70px] text-right">
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

    </div>
  )
}
