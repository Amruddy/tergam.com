'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Wallet, Plus, Check,
  Tag, X, ArrowRight, ChevronDown, ChevronUp, Zap, Mic, Square,
} from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getActiveAccounts, getDefaultAccountId } from '@/lib/accounts'
import { CATEGORIES, getCategoryById } from '@/lib/categories'
import { formatCurrency, getMonthKey, cn } from '@/lib/utils'
import {
  DEFAULT_HOME_EXPENSE_CATEGORY_IDS,
  DEFAULT_HOME_INCOME_CATEGORY_IDS,
  HOME_CATEGORY_LIMIT,
  HOME_CATEGORY_PICKS_STORAGE_KEY,
  HOME_GOAL_STORAGE_KEY,
  TRANSACTION_SUGGESTED_TAGS,
} from '@/lib/app-constants'
import { parseQuickInput } from '@/lib/parseQuick'
import { TransactionType } from '@/types'
import { TypeToggle } from '@/components/ui'

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  abort?: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  start: () => void
  stop: () => void
}

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition

function SummaryStrip() {
  const { accounts, transactions, transfers, settings } = useTransactionStore()
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const txMonth = transactions.filter((t) => t.date.startsWith(thisMonth))
    const income = txMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = getActiveAccounts(accounts).reduce((sum, account) => sum + getAccountBalance(account, transactions, transfers), 0)
    return { income, expense, balance }
  }, [accounts, transactions, transfers])

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 xl:gap-3 2xl:gap-4">
      {[
        { label: 'Доходы', value: stats.income, icon: TrendingUp, color: '#22c55e', sign: '+' },
        { label: 'Расходы', value: stats.expense, icon: TrendingDown, color: '#ef4444', sign: '−' },
        { label: 'Баланс', value: stats.balance, icon: Wallet, color: '#6366f1', sign: '' },
      ].map(({ label, value, icon: Icon, color, sign }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="min-w-0 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl px-2.5 py-3 sm:p-3 md:p-5 text-center flex flex-col justify-center"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 rounded-xl mx-auto mb-1.5 sm:mb-2 flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div className="text-[13px] sm:text-xs text-slate-400 dark:text-gray-500 mb-0.5 leading-tight">{label}</div>
          <div className="text-[15px] sm:text-sm xl:text-base font-bold text-slate-900 dark:text-white leading-tight break-words">
            {sign}{formatCurrency(Math.abs(value), settings.currency)}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function QuickTextBar() {
  const { accounts, addTransaction } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseQuickInput> | null>(null)
  const [saved, setSaved] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const committedTextRef = useRef('')
  const listeningRef = useRef(false)

  useEffect(() => {
    if (!isListening) {
      committedTextRef.current = text.trim()
    }
  }, [text])

  useEffect(() => {
    const speechWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionCtor
      webkitSpeechRecognition?: BrowserSpeechRecognitionCtor
    }
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = 'ru-RU'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; i += 1) {
        const chunk = event.results[i]?.[0]?.transcript ?? ''
        if (!chunk) continue
        if ((event.results[i] as { isFinal?: boolean }).isFinal) {
          finalTranscript += chunk
        } else {
          interimTranscript += chunk
        }
      }

      const base = committedTextRef.current
      const finalPart = finalTranscript.trim()
      const interimPart = interimTranscript.trim()

      if (finalPart) {
        committedTextRef.current = [base, finalPart].filter(Boolean).join(' ').trim()
      }

      const next = [committedTextRef.current, interimPart].filter(Boolean).join(' ').trim()
      if (!next) return
      setText(next)
      setPreview(next.trim().length > 2 ? parseQuickInput(next) : null)
    }
    recognition.onend = () => {
      listeningRef.current = false
      setIsListening(false)
    }
    recognition.onerror = (event) => {
      listeningRef.current = false
      setIsListening(false)
      const nextError =
        event?.error === 'not-allowed'
          ? 'Нет доступа к микрофону.'
          : event?.error === 'no-speech'
            ? 'Речь не распознана, попробуйте еще раз.'
            : 'Не удалось завершить голосовой ввод.'
      setVoiceError(nextError)
    }
    recognitionRef.current = recognition
    setVoiceSupported(true)

    return () => {
      recognition.abort?.()
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const handleChange = (v: string) => {
    setText(v)
    setVoiceError(null)
    setPreview(v.trim().length > 2 ? parseQuickInput(v) : null)
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return
    setVoiceError(null)
    if (listeningRef.current) {
      listeningRef.current = false
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }
    inputRef.current?.focus()
    committedTextRef.current = text.trim()
    listeningRef.current = true
    recognitionRef.current.start()
    setIsListening(true)
  }

  const handleSubmit = () => {
    if (!preview || !preview.amount) return
    addTransaction({
      type: preview.type,
      amount: preview.amount,
      category: preview.category,
      accountId: activeAccounts[0]?.id ?? getDefaultAccountId(),
      date: new Date().toISOString().split('T')[0],
      description: preview.description,
      tags: [],
    })
    setText('')
    setPreview(null)
    setVoiceError(null)
    committedTextRef.current = ''
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const cat = preview ? getCategoryById(preview.category) : null

  return (
    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3 md:p-5 xl:p-6">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
        <Zap size={14} className="text-amber-500 flex-shrink-0" />
        <span className="text-[13px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">Быстрый ввод</span>
        <span className="pt-0.5 text-[12px] sm:text-xs text-slate-400 dark:text-gray-600">текстом или голосом</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="кофе 250, аренда 30000, зарплата +50000..."
          className="flex-1 min-w-0 h-10 sm:h-10 bg-slate-50 dark:bg-[#0d0d14] border border-slate-200 dark:border-white/8 rounded-xl px-3 text-[15px] sm:text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400/60"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
              className={cn(
                'min-h-11 min-w-11 rounded-xl border flex items-center justify-center transition-colors',
                isListening
                  ? 'bg-red-500/12 border-red-500/30 text-red-500'
                  : 'bg-slate-50 dark:bg-[#0d0d14] border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-400 hover:border-indigo-400/40 hover:text-indigo-500'
              )}
            >
              {isListening ? <Square size={14} /> : <Mic size={15} />}
            </button>
          )}
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="ok"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="min-h-11 min-w-11 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500"
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                onClick={handleSubmit}
                disabled={!preview?.amount}
                className="min-h-11 min-w-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-30"
              >
                <ArrowRight size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {preview && preview.amount && cat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 flex flex-wrap items-center gap-1 text-[12px] sm:text-xs text-slate-500 dark:text-gray-400"
          >
            <span className="text-[12px] sm:text-[13px] leading-none">{cat.emoji}</span>
            <span>{cat.name}</span>
            <span>•</span>
            <span className={preview.type === 'income' ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
              {preview.type === 'income' ? '+' : '−'}{preview.amount.toLocaleString('ru-RU')} ₽
            </span>
            {preview.description && <><span>•</span><span className="truncate">{preview.description}</span></>}
          </motion.div>
        )}
      </AnimatePresence>
      {voiceSupported && (
        <p className={cn('mt-1 text-[11px] sm:text-[10px]', voiceError ? 'text-red-500' : 'text-slate-400 dark:text-gray-500')}>
          {voiceError ?? (isListening ? 'Слушаю. Говорите короткой фразой.' : 'Можно продиктовать фразу голосом.')}
        </p>
      )}
    </div>
  )
}

function HomeGoalCard() {
  const { goals, settings } = useTransactionStore()
  const [selectedGoalId, setSelectedGoalId] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(HOME_GOAL_STORAGE_KEY) || ''
    const exists = goals.some((g) => g.id === saved)
    if (exists) {
      setSelectedGoalId(saved)
      return
    }
    if (goals.length > 0) {
      setSelectedGoalId(goals[0].id)
    } else {
      setSelectedGoalId('')
    }
  }, [goals])

  useEffect(() => {
    if (selectedGoalId) window.localStorage.setItem(HOME_GOAL_STORAGE_KEY, selectedGoalId)
  }, [selectedGoalId])

  if (goals.length === 0) return null

  const goal = goals.find((g) => g.id === selectedGoalId) ?? goals[0]
  const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-0 overflow-hidden"
    >
      <div className="p-3.5 sm:p-4 md:p-5" style={{ background: `${goal.color}08` }}>
        <div className="flex items-start justify-between gap-3 mb-2.5 sm:mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[18px] sm:text-xl leading-none">{goal.emoji}</span>
              <span className="text-[15px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{goal.name}</span>
            </div>
            <div className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-500 mt-1">
              {pct >= 100 ? 'Цель достигнута' : `${daysLeft} дн. до дедлайна`}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-500">Прогресс</div>
            <div className="text-[15px] sm:text-sm font-bold" style={{ color: goal.color }}>{Math.round(pct)}%</div>
          </div>
        </div>

        <div className="h-2 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden mb-2.5 sm:mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: goal.color }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center xl:gap-3">
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[12px] text-slate-400 dark:text-gray-500">Накоплено</div>
            <div className="text-[15px] sm:text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(goal.savedAmount, settings.currency)}</div>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[12px] text-slate-400 dark:text-gray-500">Осталось</div>
            <div className="text-[15px] sm:text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(remaining, settings.currency)}</div>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[12px] text-slate-400 dark:text-gray-500">Цель</div>
            <div className="text-[15px] sm:text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(goal.targetAmount, settings.currency)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function QuickAddForm() {
  const { accounts, addTransaction } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showExtra, setShowExtra] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const availableCategories = CATEGORIES.filter((c) => c.type === type || c.type === 'both')
  const defaultHomeCategories = type === 'expense' ? [...DEFAULT_HOME_EXPENSE_CATEGORY_IDS] : [...DEFAULT_HOME_INCOME_CATEGORY_IDS]
  const [homeCategoryIds, setHomeCategoryIds] = useState<string[]>(defaultHomeCategories)

  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
    }
  }, [activeAccounts, accountId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(HOME_CATEGORY_PICKS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) as { expense?: string[]; income?: string[] } : null
      const stored = type === 'expense' ? parsed?.expense : parsed?.income
      const validIds = (stored ?? [])
        .filter((id) => availableCategories.some((cat) => cat.id === id))
        .slice(0, HOME_CATEGORY_LIMIT)

      setHomeCategoryIds(
        validIds.length > 0
          ? validIds
          : defaultHomeCategories
              .filter((id) => availableCategories.some((cat) => cat.id === id))
              .slice(0, HOME_CATEGORY_LIMIT)
      )
    } catch {
      setHomeCategoryIds(
        defaultHomeCategories
          .filter((id) => availableCategories.some((cat) => cat.id === id))
          .slice(0, HOME_CATEGORY_LIMIT)
      )
    }
  }, [type, availableCategories])

  const handleAmountChange = (v: string) => setAmount(v.replace(/[^\d]/g, ''))
  const formatDisplay = (v: string) => (v ? Number(v).toLocaleString('ru-RU') : '')

  const visibleCategories = homeCategoryIds
    .map((id) => availableCategories.find((cat) => cat.id === id))
    .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))

  const persistHomeCategories = (nextIds: string[]) => {
    setHomeCategoryIds(nextIds)
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(HOME_CATEGORY_PICKS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) as { expense?: string[]; income?: string[] } : {}
      const nextValue = type === 'expense'
        ? { ...parsed, expense: nextIds }
        : { ...parsed, income: nextIds }
      window.localStorage.setItem(HOME_CATEGORY_PICKS_STORAGE_KEY, JSON.stringify(nextValue))
    } catch {
      const fallback = type === 'expense' ? { expense: nextIds } : { income: nextIds }
      window.localStorage.setItem(HOME_CATEGORY_PICKS_STORAGE_KEY, JSON.stringify(fallback))
    }
  }

  const toggleHomeCategory = (id: string) => {
    if (homeCategoryIds.includes(id)) {
      persistHomeCategories(homeCategoryIds.filter((currentId) => currentId !== id))
      if (category === id) setCategory('')
      return
    }

    if (homeCategoryIds.length >= HOME_CATEGORY_LIMIT) return
    persistHomeCategories([...homeCategoryIds, id])
  }

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const reset = () => {
    setAmount('')
    setCategory('')
    setDescription('')
    setTags([])
    setDate(new Date().toISOString().split('T')[0])
    setShowExtra(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !accountId) return
    addTransaction({ type, amount: Number(amount), category, accountId, date, description, tags })
    setSaved(true)
    setTimeout(() => { setSaved(false); reset() }, 1200)
  }

  const inputBase = 'w-full bg-slate-50 dark:bg-[#0d0d14] border border-slate-200 dark:border-white/8 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <TypeToggle value={type} onChange={(nextType) => { setType(nextType); setCategory('') }} />

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0"
          required
          className="w-full bg-slate-50 dark:bg-[#0d0d14] border-2 border-slate-200 dark:border-white/8 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors text-lg sm:text-2xl font-bold pr-12"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-lg font-semibold">₽</span>
      </div>

      <div>
        <AnimatePresence initial={false}>
          {showCategoryPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableCategories.map((cat) => {
                  const selected = homeCategoryIds.includes(cat.id)
                  const disabled = !selected && homeCategoryIds.length >= HOME_CATEGORY_LIMIT

                  return (
                    <button
                      key={`pick-${cat.id}`}
                      type="button"
                      onClick={() => toggleHomeCategory(cat.id)}
                      disabled={disabled}
                      className={cn(
                        'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center transition-all',
                        selected
                          ? 'border-2 shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/8 dark:text-gray-400 dark:hover:border-white/15',
                        disabled && 'cursor-not-allowed opacity-45'
                      )}
                      style={selected ? { borderColor: cat.color, background: `${cat.color}15` } : {}}
                    >
                      <span className="text-base leading-none">{cat.emoji}</span>
                      <span className={cn('text-[10px] font-medium leading-tight', selected ? 'text-slate-900 dark:text-white' : '')}>
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-[18px] border px-2 py-2 text-center transition-all',
                category === cat.id
                  ? 'border-2 shadow-sm'
                  : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/15'
              )}
              style={category === cat.id ? { borderColor: cat.color, background: `${cat.color}15` } : {}}
            >
              <span className="text-[19px] leading-none">{cat.emoji}</span>
              <span className={cn('text-[10px] text-center leading-tight font-medium', category === cat.id ? 'text-slate-900 dark:text-white' : '')}>
                {cat.name}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCategoryPicker((current) => !current)}
            className={cn(
              'flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-[18px] border border-dashed border-slate-300 bg-slate-50/70 px-2 py-2 text-slate-500 text-center transition-all hover:border-indigo-400/50 hover:text-indigo-500 dark:border-white/12 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300',
              showCategoryPicker && 'border-indigo-400/60 text-indigo-500 dark:border-indigo-500/40 dark:text-indigo-300'
            )}
          >
            <ChevronDown size={15} className={cn('transition-transform', showCategoryPicker && 'rotate-180')} />
            <span className="text-[10px] font-medium leading-tight">
              Выбор
              <br />
              категорий
            </span>
          </button>
        </div>
      </div>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={cn(inputBase, 'py-2.5 sm:py-3')} />

      <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
        {activeAccounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => setAccountId(account.id)}
            title={account.name}
            aria-label={account.name}
            className={cn(
              'flex min-h-[58px] items-center justify-center rounded-[18px] border transition-all',
              accountId === account.id
                ? 'border-2 shadow-sm'
                : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/15'
            )}
            style={accountId === account.id ? { borderColor: account.color, background: `${account.color}15` } : {}}
          >
            <span className="text-[18px] leading-none" aria-hidden="true">{account.emoji}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] sm:text-xs text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors w-full"
      >
        {showExtra ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {showExtra ? 'Скрыть' : 'Описание и теги'}
      </button>

      <AnimatePresence initial={false}>
        {showExtra && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-3"
          >
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание..." rows={2} className={cn(inputBase, 'resize-none')} />
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-500/12 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-[12px] sm:text-xs px-2 py-0.5 rounded-xl">
                    <Tag size={9} />{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={9} /></button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {TRANSACTION_SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 4).map((tag) => (
                  <button key={tag} type="button" onClick={() => addTag(tag)} className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-600 border border-slate-200 dark:border-white/8 px-2 py-0.5 rounded-xl hover:border-indigo-400/40 hover:text-indigo-500 transition-colors">
                    +{tag}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                  placeholder="Новый тег..."
                  className="flex-1 bg-slate-50 dark:bg-[#0d0d14] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2 sm:py-1.5 text-[13px] sm:text-xs text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400/60"
                />
                <button type="button" onClick={() => addTag(tagInput)} className="px-3 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-indigo-500 hover:bg-indigo-500/20 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-3 rounded-2xl bg-green-500/15 border border-green-500/25 text-green-600 dark:text-green-400 font-semibold text-[15px] sm:text-sm flex items-center justify-center gap-2"
          >
            <Check size={16} /> Сохранено
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            type="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full py-3 rounded-2xl font-semibold text-[15px] sm:text-sm transition-all flex items-center justify-center gap-2',
              type === 'expense' ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
            )}
          >
            <Plus size={16} />
            {type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  )
}

export function HomePage() {
  return (
    <div className="py-1 sm:py-2 w-full space-y-3 sm:space-y-4">
      <div className="space-y-3 lg:space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:gap-5 lg:space-y-0 lg:items-start">
        <div className="space-y-3 sm:space-y-4 min-w-0">
          <SummaryStrip />
          <HomeGoalCard />
          <QuickTextBar />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3 md:p-5 xl:p-6 lg:sticky lg:top-[96px] xl:top-[104px]"
        >
          <QuickAddForm />
        </motion.div>
      </div>
    </div>
  )
}
