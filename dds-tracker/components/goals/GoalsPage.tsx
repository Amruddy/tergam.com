'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check, X, Trophy } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { HOME_GOAL_STORAGE_KEY } from '@/lib/app-constants'
import { formatCurrency, cn } from '@/lib/utils'
import { Goal } from '@/types'
import { StatStrip, EmptyState, FormCard, Btn, IconBtn, FieldLabel, inputCls, PageHeader } from '@/components/ui'

const GOAL_EMOJIS = ['🏖️', '🚗', '🏠', '💻', '✈️', '🎓', '💍', '🏋️', '📱', '🎸', '⛵', '🌍']
const GOAL_COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316']
function GoalCard({
  goal,
  onEdit,
  isHomeGoal,
  onSetHomeGoal,
}: {
  goal: Goal
  onEdit: () => void
  isHomeGoal: boolean
  onSetHomeGoal: () => void
}) {
  const { settings, deleteGoal, updateGoal } = useTransactionStore()
  const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const done = pct >= 100
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
  const [depositing, setDepositing] = useState(false)
  const [depositInput, setDepositInput] = useState('')

  const handleDeposit = () => {
    const n = Number(depositInput.replace(/\D/g, ''))
    if (n > 0) updateGoal(goal.id, { savedAmount: goal.savedAmount + n })
    setDepositInput('')
    setDepositing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4 md:p-5 transition-colors duration-300"
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[22px] text-2xl" style={{ background: `${goal.color}18` }}>
            {goal.emoji}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{goal.name}</div>
            <div className="text-xs mt-0.5" style={{ color: done ? '#22c55e' : daysLeft < 30 ? '#f59e0b' : '#94a3b8' }}>
              {done ? 'Цель достигнута' : `${daysLeft} дн. осталось`}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 flex-shrink-0">
          <Btn variant={isHomeGoal ? 'primary' : 'secondary'} size="sm" onClick={onSetHomeGoal}>
            {isHomeGoal ? 'На главной' : 'Показать'}
          </Btn>
          <IconBtn variant="primary" onClick={onEdit}><Edit2 size={14} /></IconBtn>
          <IconBtn variant="danger" onClick={() => deleteGoal(goal.id)}><Trash2 size={14} /></IconBtn>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-0.5">Накоплено</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {formatCurrency(goal.savedAmount, settings.currency)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-0.5">Цель</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {formatCurrency(goal.targetAmount, settings.currency)}
          </div>
        </div>
      </div>

      <div className="h-2.5 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden mb-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: done ? '#22c55e' : goal.color }}
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold" style={{ color: done ? '#22c55e' : goal.color }}>{Math.round(pct)}%</span>
        {!done && (
          <span className="text-xs text-slate-400 dark:text-gray-500">
            Ещё {formatCurrency(goal.targetAmount - goal.savedAmount, settings.currency)}
          </span>
        )}
      </div>

      {!done && (
        <AnimatePresence mode="wait">
          {depositing ? (
            <motion.div key="inp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={depositInput}
                onChange={(e) => setDepositInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleDeposit()}
                placeholder="Сумма пополнения"
                className={cn(inputCls, 'min-w-0 flex-1')}
              />
              <IconBtn variant="primary" onClick={handleDeposit}><Check size={14} /></IconBtn>
              <IconBtn variant="secondary" onClick={() => setDepositing(false)}><X size={14} /></IconBtn>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setDepositing(true)}
              className="w-full min-h-11 rounded-2xl border border-dashed px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style={{ borderColor: `${goal.color}60`, color: goal.color, background: `${goal.color}08` }}
            >
              + Пополнить
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

function GoalForm({ editing, onClose }: { editing?: Goal; onClose: () => void }) {
  const { addGoal, updateGoal } = useTransactionStore()
  const [name, setName] = useState(editing?.name ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '🏖️')
  const [target, setTarget] = useState(editing ? String(editing.targetAmount) : '')
  const [saved, setSaved] = useState(editing ? String(editing.savedAmount) : '0')
  const [deadline, setDeadline] = useState(editing?.deadline ?? '')
  const [color, setColor] = useState(editing?.color ?? '#6366f1')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name, emoji, color, targetAmount: Number(target), savedAmount: Number(saved), deadline }
    if (editing) updateGoal(editing.id, payload)
    else addGoal(payload)
    onClose()
  }

  return (
    <FormCard title={editing ? 'Редактировать цель' : 'Новая цель'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Иконка</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all',
                  emoji === e
                    ? 'bg-indigo-500/20 border-2 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-transparent'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Цвет</FieldLabel>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn('w-8 h-8 rounded-full transition-all', color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#13131a] scale-110' : 'hover:scale-105')}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Название</FieldLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Отпуск на Бали" required className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Цель, ₽</FieldLabel>
            <input type="text" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))} placeholder="200 000" required className={inputCls} />
          </div>
          <div>
            <FieldLabel>Накоплено, ₽</FieldLabel>
            <input type="text" inputMode="numeric" value={saved} onChange={(e) => setSaved(e.target.value.replace(/\D/g, ''))} placeholder="0" className={inputCls} />
          </div>
        </div>

        <div>
          <FieldLabel>Дедлайн</FieldLabel>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className={inputCls} />
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Btn>
          <Btn type="submit" variant="primary" className="flex-1">{editing ? 'Сохранить' : 'Создать'}</Btn>
        </div>
      </form>
    </FormCard>
  )
}

export function GoalsPage() {
  const { goals, settings } = useTransactionStore()
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [homeGoalId, setHomeGoalId] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(HOME_GOAL_STORAGE_KEY) || ''
    if (goals.some((g) => g.id === saved)) {
      setHomeGoalId(saved)
      return
    }
    if (goals.length > 0) {
      const fallback = goals[0].id
      setHomeGoalId(fallback)
      window.localStorage.setItem(HOME_GOAL_STORAGE_KEY, fallback)
      return
    }
    setHomeGoalId('')
    window.localStorage.removeItem(HOME_GOAL_STORAGE_KEY)
  }, [goals])

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
  const doneCount = goals.filter((g) => g.savedAmount >= g.targetAmount).length

  return (
    <div className="space-y-4 py-2 sm:space-y-5">
      <PageHeader
        icon={Trophy}
        iconColor="#f59e0b"
        title="Цели"
        subtitle="Финансовые цели и накопления — следи за прогрессом"
        action={<Btn onClick={() => { setEditGoal(null); setShowForm(true) }}><Plus size={15} /> Добавить</Btn>}
      />

      {goals.length > 0 && (
        <StatStrip items={[
          { label: 'Всего целей', value: String(goals.length), icon: Trophy, color: '#6366f1' },
          { label: 'Накоплено', value: formatCurrency(totalSaved, settings.currency), icon: Check, color: '#22c55e' },
          { label: 'Достигнуто', value: `${doneCount} / ${goals.length}`, icon: Trophy, color: doneCount > 0 ? '#22c55e' : '#94a3b8' },
        ]} />
      )}

      <AnimatePresence>
        {(showForm || editGoal) && (
          <GoalForm editing={editGoal ?? undefined} onClose={() => { setShowForm(false); setEditGoal(null) }} />
        )}
      </AnimatePresence>

      {goals.length === 0 && !showForm ? (
        <EmptyState
          emoji="🎯"
          title="Целей пока нет"
          subtitle="Поставьте финансовую цель и отслеживайте прогресс накоплений"
          action={
            <Btn variant="ghost" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Создать первую цель
            </Btn>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isHomeGoal={homeGoalId === goal.id}
              onSetHomeGoal={() => {
                setHomeGoalId(goal.id)
                window.localStorage.setItem(HOME_GOAL_STORAGE_KEY, goal.id)
              }}
              onEdit={() => { setEditGoal(goal); setShowForm(false) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
