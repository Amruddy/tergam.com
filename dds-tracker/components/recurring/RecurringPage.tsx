'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountById, getActiveAccounts, getDefaultAccountId } from '@/lib/accounts'
import { getCategoryById } from '@/lib/categories'
import { formatCurrency, cn } from '@/lib/utils'
import { RecurringTransaction, TransactionType, RecurringFrequency } from '@/types'
import { EmptyState, FormCard, Btn, IconBtn, FieldLabel, inputCls, CategoryGrid, TypeToggle, SectionLabel, AccountSelect, PageHeader } from '@/components/ui'

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
}

const FREQ_ICONS: Record<RecurringFrequency, string> = {
  daily: '📆',
  weekly: '🗓️',
  monthly: '🧾',
}

function RecurringCard({ rec }: { rec: RecurringTransaction }) {
  const { accounts, deleteRecurring, updateRecurring, settings } = useTransactionStore()
  const cat = getCategoryById(rec.category)
  const account = getAccountById(accounts, rec.accountId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'bg-white dark:bg-[#13131a] border rounded-2xl p-4 transition-all duration-300',
        rec.active ? 'border-slate-200/80 dark:border-white/[0.06]' : 'border-slate-200/40 dark:border-white/[0.03] opacity-55'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${cat.color}15` }}>
          {cat.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{rec.description || cat.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${cat.color}15`, color: cat.color }}>
              {FREQ_ICONS[rec.frequency]} {FREQ_LABELS[rec.frequency]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-gray-500 flex-wrap">
            <span>{cat.name}</span>
            <span>•</span>
            <span>{account.emoji} {account.name}</span>
            {rec.lastApplied && <><span>•</span><span>Применён {rec.lastApplied}</span></>}
          </div>
        </div>

        <div className={cn('text-sm font-bold flex-shrink-0', rec.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
          {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount, settings.currency)}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
        <button
          onClick={() => updateRecurring(rec.id, { active: !rec.active })}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all',
            rec.active
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/18'
              : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/8'
          )}
        >
          {rec.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {rec.active ? 'Активно' : 'Пауза'}
        </button>
        <Btn variant="danger" size="sm" className="ml-auto" onClick={() => deleteRecurring(rec.id)}>
          <Trash2 size={12} /> Удалить
        </Btn>
      </div>
    </motion.div>
  )
}

function AddRecurringForm({ onClose }: { onClose: () => void }) {
  const { accounts, addRecurring } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
    }
  }, [accountId, activeAccounts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !accountId) return
    addRecurring({ type, amount: Number(amount.replace(/\D/g, '')), category, accountId, description, tags: [], frequency, startDate, active: true })
    onClose()
  }

  return (
    <FormCard title="Новый автоплатёж" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TypeToggle value={type} onChange={(t) => { setType(t); setCategory('') }} />

        <div>
          <FieldLabel>Сумма</FieldLabel>
          <div className="relative">
            <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" required className={cn(inputCls, 'text-xl font-bold pr-8')} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 font-semibold">₽</span>
          </div>
        </div>

        <div>
          <FieldLabel>Категория</FieldLabel>
          <CategoryGrid value={category} onChange={setCategory} type={type} />
        </div>

        <div>
          <FieldLabel>Счёт</FieldLabel>
          <AccountSelect accounts={activeAccounts} value={accountId} onChange={setAccountId} />
        </div>

        <div>
          <FieldLabel>Повторение</FieldLabel>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
                  frequency === f
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-sm'
                    : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/15'
                )}
              >
                {FREQ_ICONS[f]}<br />{FREQ_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Описание</FieldLabel>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Аренда квартиры, Netflix..." className={inputCls} />
        </div>

        <div>
          <FieldLabel>Дата начала</FieldLabel>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputCls} />
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Btn>
          <Btn type="submit" variant="primary" className="flex-1" disabled={!amount || !category || !accountId}>Добавить</Btn>
        </div>
      </form>
    </FormCard>
  )
}

export function RecurringPage() {
  const { recurring, applyRecurring } = useTransactionStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { applyRecurring() }, [applyRecurring])

  const active = recurring.filter((r) => r.active)
  const paused = recurring.filter((r) => !r.active)

  return (
    <div className="space-y-5 py-2">
      <PageHeader
        icon={RefreshCw}
        iconColor="#22c55e"
        title="Автоплатежи"
        subtitle="Повторяющиеся транзакции — зарплата, аренда, подписки"
        action={
          <div className="flex gap-2">
            <IconBtn variant="secondary" onClick={() => applyRecurring()} title="Применить сейчас">
              <RefreshCw size={14} />
            </IconBtn>
            <Btn onClick={() => setShowForm(true)}><Plus size={15} /> Добавить</Btn>
          </div>
        }
      />

      <AnimatePresence>
        {showForm && <AddRecurringForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {recurring.length === 0 && !showForm ? (
        <EmptyState
          emoji="🔄"
          title="Автоплатежей нет"
          subtitle="Настройте повторяющиеся транзакции: зарплата, аренда, подписки"
          action={<Btn variant="ghost" onClick={() => setShowForm(true)}><Plus size={14} /> Создать первый</Btn>}
        />
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div className="space-y-2">
              <SectionLabel>Активные — {active.length}</SectionLabel>
              <AnimatePresence>{active.map((r) => <RecurringCard key={r.id} rec={r} />)}</AnimatePresence>
            </div>
          )}
          {paused.length > 0 && (
            <div className="space-y-2">
              <SectionLabel>На паузе — {paused.length}</SectionLabel>
              <AnimatePresence>{paused.map((r) => <RecurringCard key={r.id} rec={r} />)}</AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
