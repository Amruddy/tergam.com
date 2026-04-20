'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, AlertTriangle, Wallet, TrendingDown, ShieldAlert } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey, cn } from '@/lib/utils'
import { Budget } from '@/types'
import { StatStrip, EmptyState, FormCard, Btn, IconBtn, FieldLabel, inputCls, CategoryGrid, PageHeader } from '@/components/ui'

function BudgetCard({ budget, spent }: { budget: Budget; spent: number }) {
  const { settings, deleteBudget } = useTransactionStore()
  const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
  const over = spent > budget.amount
  const warn = !over && pct >= 75
  const cat = getCategoryById(budget.category)

  const barColor = over ? '#ef4444' : warn ? '#f59e0b' : '#22c55e'
  const amountColor = over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-green-600 dark:text-green-400'
  const borderClass = over
    ? 'border-red-500/20 bg-red-500/[0.03]'
    : warn
    ? 'border-amber-500/20 bg-amber-500/[0.03]'
    : 'border-slate-200/80 dark:border-white/[0.06]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl p-4 md:p-5 border transition-colors duration-300', borderClass,
        over || warn ? '' : 'bg-white dark:bg-[#13131a]'
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl" style={{ background: `${cat.color}15` }}>
            {cat.emoji}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{cat.name}</div>
            <div className="text-xs text-slate-400 dark:text-gray-500">лимит в месяц</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {over && <AlertTriangle size={14} className="text-red-500" />}
          <IconBtn variant="danger" onClick={() => deleteBudget(budget.id)}><Trash2 size={14} /></IconBtn>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-0.5">Потрачено</div>
          <div className={cn('text-base font-bold', amountColor)}>{formatCurrency(spent, settings.currency)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-0.5">Лимит</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(budget.amount, settings.currency)}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-semibold', amountColor)}>{Math.round(pct)}%</span>
        <span className="text-xs text-slate-400 dark:text-gray-500">
          {over
            ? <span className="text-red-500">Превышен на {formatCurrency(spent - budget.amount, settings.currency)}</span>
            : <>Осталось {formatCurrency(budget.amount - spent, settings.currency)}</>
          }
        </span>
      </div>
    </motion.div>
  )
}

function AddBudgetForm({ onClose }: { onClose: () => void }) {
  const { addBudget, budgets } = useTransactionStore()
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')

  const usedCategories = budgets.map((b) => b.category)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount) return
    addBudget({ category, amount: Number(amount.replace(/\D/g, '')), period: 'month' })
    onClose()
  }

  return (
    <FormCard title="Новый бюджет" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Категория расходов</FieldLabel>
          <CategoryGrid value={category} onChange={setCategory} type="expense" exclude={usedCategories} />
          {usedCategories.length >= 7 && !category && (
            <p className="text-xs text-slate-400 dark:text-gray-600 mt-2">Все категории уже имеют бюджет</p>
          )}
        </div>

        <div>
          <FieldLabel>Лимит в месяц</FieldLabel>
          <div className="relative">
            <input
              type="text" inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
              placeholder="15 000"
              className={cn(inputCls, 'pr-8')}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm font-medium">₽</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Btn>
          <Btn type="submit" variant="primary" className="flex-1" disabled={!category || !amount}>Добавить</Btn>
        </div>
      </form>
    </FormCard>
  )
}

export function BudgetsPage() {
  const { budgets, transactions, settings } = useTransactionStore()
  const [showForm, setShowForm] = useState(false)

  const spentByCategory = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(thisMonth))
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [transactions])

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0)
  const overCount = budgets.filter((b) => (spentByCategory[b.category] || 0) > b.amount).length

  return (
    <div className="space-y-4 py-2 sm:space-y-5">
      <PageHeader
        icon={Wallet}
        iconColor="#6366f1"
        title="Бюджеты"
        subtitle="Лимиты расходов по категориям на текущий месяц"
        action={<Btn onClick={() => setShowForm(true)}><Plus size={15} /> Добавить</Btn>}
      />

      {budgets.length > 0 && (
        <StatStrip items={[
          { label: 'Всего лимит', value: formatCurrency(totalBudget, settings.currency), icon: Wallet, color: '#6366f1' },
          { label: 'Потрачено', value: formatCurrency(totalSpent, settings.currency), icon: TrendingDown, color: '#ef4444' },
          { label: 'Превышений', value: String(overCount), icon: ShieldAlert, color: overCount > 0 ? '#ef4444' : '#22c55e' },
        ]} />
      )}

      <AnimatePresence>
        {showForm && <AddBudgetForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {budgets.length === 0 && !showForm ? (
        <EmptyState
          emoji="💰"
          title="Бюджетов пока нет"
          subtitle="Задайте лимиты расходов по категориям, чтобы не выходить за рамки"
          action={
            <Btn variant="ghost" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Создать первый бюджет
            </Btn>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} spent={spentByCategory[budget.category] || 0} />
          ))}
        </div>
      )}
    </div>
  )
}
