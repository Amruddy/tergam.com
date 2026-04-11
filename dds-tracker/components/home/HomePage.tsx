'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Wallet, Plus, Check,
  Tag, X, ArrowRight, ChevronDown, ChevronUp, Zap, Mic, Square,
} from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getActiveAccounts } from '@/lib/accounts'
import { CATEGORIES, getCategoryById } from '@/lib/categories'
import { getDefaultAccountId } from '@/lib/accounts'
import { formatCurrency, getMonthKey, cn } from '@/lib/utils'
import { parseQuickInput } from '@/lib/parseQuick'
import { TransactionType } from '@/types'
import { AccountSelect } from '@/components/ui'

const SUGGESTED_TAGS = ['работа', 'продукты', 'такси', 'жильё', 'досуг', 'здоровье']
const HOME_GOAL_KEY = 'tergam-home-goal-id'

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:gap-3">
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
          className="min-w-0 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl px-3 py-3 xl:px-4 xl:py-4 text-center"
        >
          <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <div className="text-xs text-slate-400 dark:text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm xl:text-base font-bold text-slate-900 dark:text-white leading-tight break-words">
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
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

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
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (!transcript) return
      const next = text ? `${text.trim()} ${transcript}` : transcript
      setText(next)
      if (next.trim().length > 2) setPreview(parseQuickInput(next))
      else setPreview(null)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    setVoiceSupported(true)

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [text])

  const handleChange = (v: string) => {
    setText(v)
    if (v.trim().length > 2) setPreview(parseQuickInput(v))
    else setPreview(null)
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }
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
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const cat = preview ? getCategoryById(preview.category) : null

  return (
    <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Быстрый ввод</span>
        <span className="text-xs text-slate-400 dark:text-gray-600">напишите текстом</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="кофе 250, зарплата +50000, такси 400..."
          className="flex-1 min-w-0 bg-slate-50 dark:bg-[#0d0d14] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-3 sm:py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400/60"
        />
        <div className={`grid gap-2 ${voiceSupported ? 'grid-cols-2' : 'grid-cols-1'} sm:flex`}>
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
              className={cn(
                'h-11 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-colors',
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
                className="h-11 sm:w-10 sm:h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-500"
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                onClick={handleSubmit}
                disabled={!preview?.amount}
                className="h-11 sm:w-10 sm:h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-30"
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
            className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-400"
          >
            <span>{cat.emoji}</span>
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
        <p className="mt-2 text-[11px] text-slate-400 dark:text-gray-500">
          {isListening ? 'Слушаю. Говорите короткой фразой.' : 'Можно продиктовать фразу голосом.'}
        </p>
      )}
    </div>
  )
}

function HomeGoalCard() {
  const { goals, settings } = useTransactionStore()
  const [selectedGoalId, setSelectedGoalId] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(HOME_GOAL_KEY) || ''
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
    if (selectedGoalId) window.localStorage.setItem(HOME_GOAL_KEY, selectedGoalId)
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
      <div className="p-4 md:p-5" style={{ background: `${goal.color}08` }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{goal.emoji}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{goal.name}</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              {pct >= 100 ? 'Цель достигнута' : `${daysLeft} дн. до дедлайна`}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-400 dark:text-gray-500">Прогресс</div>
            <div className="text-sm font-bold" style={{ color: goal.color }}>{Math.round(pct)}%</div>
          </div>
        </div>

        <div className="h-2.5 bg-slate-100 dark:bg-[#1e1e2e] rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: goal.color }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[11px] text-slate-400 dark:text-gray-500">Накоплено</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(goal.savedAmount, settings.currency)}</div>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[11px] text-slate-400 dark:text-gray-500">Осталось</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(remaining, settings.currency)}</div>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/[0.03] px-2 py-2">
            <div className="text-[11px] text-slate-400 dark:text-gray-500">Цель</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{formatCurrency(goal.targetAmount, settings.currency)}</div>
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

  const availableCategories = CATEGORIES.filter((c) => c.type === type || c.type === 'both')
  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
    }
  }, [activeAccounts, accountId])
  const handleAmountChange = (v: string) => setAmount(v.replace(/[^\d]/g, ''))
  const formatDisplay = (v: string) => (v ? Number(v).toLocaleString('ru-RU') : '')
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex bg-slate-100 dark:bg-[#0d0d14] rounded-2xl p-1 gap-1">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategory('') }}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              type === t
                ? t === 'expense'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shadow-sm'
                  : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25 shadow-sm'
                : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
            )}
          >
            {t === 'expense' ? '❤️ Расход' : '💚 Доход'}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0"
          required
          className="w-full bg-slate-50 dark:bg-[#0d0d14] border-2 border-slate-200 dark:border-white/8 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors text-xl sm:text-2xl font-bold pr-12"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-lg font-semibold">₽</span>
      </div>

      <div>
        <p className="text-xs text-slate-400 dark:text-gray-500 mb-2 font-medium">Категория</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                category === cat.id
                  ? 'border-2 shadow-sm'
                  : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/15'
              )}
              style={category === cat.id ? { borderColor: cat.color, background: `${cat.color}15` } : {}}
            >
              <span className="text-xl leading-none">{cat.emoji}</span>
              <span className={cn('text-[9px] text-center leading-tight font-medium', category === cat.id ? 'text-slate-900 dark:text-white' : '')}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputBase} />

      <div>
        <p className="text-xs text-slate-400 dark:text-gray-500 mb-2 font-medium">Счёт</p>
        <AccountSelect accounts={activeAccounts} value={accountId} onChange={setAccountId} />
      </div>

      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors w-full"
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
                  <span key={tag} className="flex items-center gap-1 bg-indigo-500/12 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-lg">
                    <Tag size={9} />{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={9} /></button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 4).map((tag) => (
                  <button key={tag} type="button" onClick={() => addTag(tag)} className="text-xs text-slate-400 dark:text-gray-600 border border-slate-200 dark:border-white/8 px-2 py-0.5 rounded-lg hover:border-indigo-400/40 hover:text-indigo-500 transition-colors">
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
                  className="flex-1 bg-slate-50 dark:bg-[#0d0d14] border border-slate-200 dark:border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400/60"
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
            className="w-full py-3.5 rounded-2xl bg-green-500/15 border border-green-500/25 text-green-600 dark:text-green-400 font-semibold text-sm flex items-center justify-center gap-2"
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
              'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
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
    <div className="py-2 w-full space-y-4">
      <div className="space-y-3 lg:space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:gap-5 lg:space-y-0 lg:items-start">
        <div className="space-y-4 min-w-0">
          <SummaryStrip />
          <HomeGoalCard />
          <QuickTextBar />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3.5 md:p-5 lg:sticky lg:top-[96px]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Plus size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">Новая запись</span>
          </div>
          <QuickAddForm />
        </motion.div>
      </div>
    </div>
  )
}
