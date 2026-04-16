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

/* ── Design tokens (inline, matching CSS vars) ─────────────── */
const V = {
  income:  '#059669',
  expense: '#E11D48',
  primary: '#7C3AED',
}

/* ============================================================
   SUMMARY STRIP — 3 stat cards at top
   ============================================================ */
function SummaryStrip() {
  const { accounts, transactions, transfers, settings } = useTransactionStore()
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = getMonthKey(now)
    const txMonth = transactions.filter((t) => t.date.startsWith(thisMonth))
    const income  = txMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = getActiveAccounts(accounts).reduce(
      (sum, account) => sum + getAccountBalance(account, transactions, transfers), 0
    )
    return { income, expense, balance }
  }, [accounts, transactions, transfers])

  const items = [
    { label: 'Доходы',  value: stats.income,  icon: TrendingUp,   color: V.income,  sign: '+', bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.15)'   },
    { label: 'Расходы', value: stats.expense, icon: TrendingDown,  color: V.expense, sign: '−', bg: 'rgba(225,29,72,0.08)',   border: 'rgba(225,29,72,0.15)'   },
    { label: 'Баланс',  value: stats.balance, icon: Wallet,        color: V.primary, sign: '',  bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 xl:gap-3">
      {items.map(({ label, value, icon: Icon, color, sign, bg, border }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 bg-white dark:bg-[#0F1523] rounded-2xl p-3 xl:p-4 flex flex-col gap-2 relative overflow-hidden"
          style={{
            border: `1px solid ${border}`,
            boxShadow: `0 2px 12px rgba(15,23,42,0.06), 0 0 0 1px ${border}`,
          }}
        >
          {/* Color tint */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: `radial-gradient(ellipse at top left, ${bg}, transparent 70%)` }}
          />

          <div className="relative flex items-center justify-between">
            <div
              className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}25` }}
            >
              <Icon size={13} style={{ color }} />
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 mb-0.5 truncate">{label}</div>
            <div
              className="text-[12px] sm:text-[13px] xl:text-base font-bold leading-tight break-words font-heading"
              style={{ color }}
            >
              {sign}{formatCurrency(Math.abs(value), settings.currency)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ============================================================
   QUICK TEXT BAR — natural language input
   ============================================================ */
function QuickTextBar() {
  const { accounts, addTransaction } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)
  const [text, setText]             = useState('')
  const [preview, setPreview]       = useState<ReturnType<typeof parseQuickInput> | null>(null)
  const [saved, setSaved]           = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const inputRef        = useRef<HTMLInputElement>(null)
  const recognitionRef  = useRef<BrowserSpeechRecognition | null>(null)

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
    recognition.onend  = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    setVoiceSupported(true)

    return () => { recognition.stop(); recognitionRef.current = null }
  }, [text])

  const handleChange = (v: string) => {
    setText(v)
    if (v.trim().length > 2) setPreview(parseQuickInput(v))
    else setPreview(null)
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); return }
    recognitionRef.current.start(); setIsListening(true)
  }

  const handleSubmit = () => {
    if (!preview?.amount) return
    addTransaction({
      type: preview.type,
      amount: preview.amount,
      category: preview.category,
      accountId: activeAccounts[0]?.id ?? getDefaultAccountId(),
      date: new Date().toISOString().split('T')[0],
      description: preview.description,
      tags: [],
    })
    setText(''); setPreview(null); setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const cat = preview ? getCategoryById(preview.category) : null

  return (
    <div
      className="bg-white dark:bg-[#0F1523] rounded-2xl p-3.5 md:p-5"
      style={{
        border: '1px solid rgba(148,163,184,0.16)',
        boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <Zap size={12} style={{ color: V.primary }} />
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Быстрый ввод</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">напишите текстом</span>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="кофе 250, зарплата +50000, такси 400..."
          className="flex-1 min-w-0 h-10 bg-slate-50 dark:bg-[#161D30] border border-slate-200/80 dark:border-white/[0.07] rounded-xl px-3 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none transition-all duration-150"
          style={{
            boxShadow: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.boxShadow = ''
          }}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? 'Остановить' : 'Голосовой ввод'}
              className={cn(
                'w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-150',
                isListening
                  ? 'bg-[#E11D48]/12 border-[#E11D48]/30 text-[#E11D48] animate-pulse-slow'
                  : 'bg-slate-50 dark:bg-[#161D30] border-slate-200/80 dark:border-white/[0.07] text-slate-400 dark:text-slate-500 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]'
              )}
            >
              {isListening ? <Square size={14} /> : <Mic size={15} />}
            </button>
          )}

          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="ok"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(5,150,105,0.12)',
                  border: '1px solid rgba(5,150,105,0.25)',
                  color: V.income,
                }}
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                onClick={handleSubmit}
                disabled={!preview?.amount}
                whileTap={{ scale: 0.93 }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{
                  background: preview?.amount ? V.primary : '#94A3B8',
                  boxShadow: preview?.amount ? `0 4px 14px rgba(124,58,237,0.30)` : 'none',
                }}
              >
                <ArrowRight size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {preview?.amount && cat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-2.5 overflow-hidden"
          >
            <div
              className="flex flex-wrap items-center gap-1.5 text-xs rounded-xl px-3 py-2"
              style={{
                background: preview.type === 'income' ? 'rgba(5,150,105,0.08)' : 'rgba(225,29,72,0.08)',
                border: `1px solid ${preview.type === 'income' ? 'rgba(5,150,105,0.18)' : 'rgba(225,29,72,0.18)'}`,
              }}
            >
              <span>{cat.emoji}</span>
              <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span
                className="font-semibold"
                style={{ color: preview.type === 'income' ? V.income : V.expense }}
              >
                {preview.type === 'income' ? '+' : '−'}{preview.amount.toLocaleString('ru-RU')} ₽
              </span>
              {preview.description && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{preview.description}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {voiceSupported && (
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-600">
          {isListening ? '🎙 Слушаю...' : 'Можно продиктовать фразу голосом.'}
        </p>
      )}
    </div>
  )
}

/* ============================================================
   HOME GOAL CARD — progress toward selected goal
   ============================================================ */
function HomeGoalCard() {
  const { goals, settings } = useTransactionStore()
  const [selectedGoalId, setSelectedGoalId] = useState('')

  useEffect(() => {
    const saved  = window.localStorage.getItem(HOME_GOAL_KEY) || ''
    const exists = goals.some((g) => g.id === saved)
    setSelectedGoalId(exists ? saved : (goals[0]?.id ?? ''))
  }, [goals])

  useEffect(() => {
    if (selectedGoalId) window.localStorage.setItem(HOME_GOAL_KEY, selectedGoalId)
  }, [selectedGoalId])

  if (goals.length === 0) return null

  const goal      = goals.find((g) => g.id === selectedGoalId) ?? goals[0]
  const pct       = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)
  const daysLeft  = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-[#0F1523] rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${goal.color}22`,
        boxShadow: `0 4px 20px ${goal.color}12`,
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${goal.color}, ${goal.color}66)` }} />

      <div className="p-4 md:p-5" style={{ background: `${goal.color}06` }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl leading-none">{goal.emoji}</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{goal.name}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {pct >= 100 ? '🎉 Цель достигнута!' : `${daysLeft} дн. до дедлайна`}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-400 dark:text-slate-500">Прогресс</div>
            <div className="text-lg font-bold font-heading leading-none mt-0.5" style={{ color: goal.color }}>
              {Math.round(pct)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 dark:bg-[#161D30] rounded-full overflow-hidden mb-3.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${goal.color}cc, ${goal.color})` }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Накоплено', value: formatCurrency(goal.savedAmount, settings.currency) },
            { label: 'Осталось',  value: formatCurrency(remaining,       settings.currency) },
            { label: 'Цель',      value: formatCurrency(goal.targetAmount, settings.currency) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-2.5 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.80)' }}
            >
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{label}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white break-words leading-tight">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   QUICK ADD FORM — full transaction form
   ============================================================ */
function QuickAddForm() {
  const { accounts, addTransaction } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)

  const [type,        setType]        = useState<TransactionType>('expense')
  const [amount,      setAmount]      = useState('')
  const [category,    setCategory]    = useState('')
  const [accountId,   setAccountId]   = useState('')
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [tags,        setTags]        = useState<string[]>([])
  const [tagInput,    setTagInput]    = useState('')
  const [showExtra,   setShowExtra]   = useState(false)
  const [saved,       setSaved]       = useState(false)

  const availableCategories = CATEGORIES.filter((c) => c.type === type || c.type === 'both')

  useEffect(() => {
    if (!accountId && activeAccounts.length > 0)
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
  }, [activeAccounts, accountId])

  const handleAmountChange = (v: string) => setAmount(v.replace(/[^\d]/g, ''))
  const formatDisplay      = (v: string) => (v ? Number(v).toLocaleString('ru-RU') : '')

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const reset = () => {
    setAmount(''); setCategory(''); setDescription('')
    setTags([]); setDate(new Date().toISOString().split('T')[0])
    setShowExtra(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !accountId) return
    addTransaction({ type, amount: Number(amount), category, accountId, date, description, tags })
    setSaved(true)
    setTimeout(() => { setSaved(false); reset() }, 1200)
  }

  const isExpense   = type === 'expense'
  const activeColor = isExpense ? V.expense : V.income

  const inputBase =
    'w-full bg-slate-50 dark:bg-[#161D30] border border-slate-200/80 dark:border-white/[0.07] rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none text-sm transition-all duration-150'

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Type toggle */}
      <div className="flex bg-slate-100 dark:bg-[#161D30] rounded-2xl p-1 gap-1 border border-slate-200/60 dark:border-white/[0.05]">
        {(['expense', 'income'] as const).map((t) => (
          <motion.button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategory('') }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              type === t
                ? t === 'expense'
                  ? 'bg-[#E11D48]/12 text-[#E11D48] border border-[#E11D48]/22 shadow-sm'
                  : 'bg-[#059669]/12 text-[#059669] dark:text-[#10B981] border border-[#059669]/22 shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {t === 'expense' ? '❤️ Расход' : '💚 Доход'}
          </motion.button>
        ))}
      </div>

      {/* Amount input */}
      <div className="relative group">
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0"
          required
          className="w-full bg-slate-50 dark:bg-[#161D30] rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-200 dark:placeholder-slate-700 focus:outline-none transition-all duration-150 text-2xl font-bold tracking-tight pr-14 font-heading"
          style={{
            border: `2px solid ${amount ? activeColor + '40' : 'rgba(148,163,184,0.25)'}`,
            boxShadow: amount ? `0 0 0 4px ${activeColor}10` : 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = activeColor + '60'
            e.currentTarget.style.boxShadow   = `0 0 0 4px ${activeColor}10`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = amount ? activeColor + '40' : 'rgba(148,163,184,0.25)'
            e.currentTarget.style.boxShadow   = amount ? `0 0 0 4px ${activeColor}10` : 'none'
          }}
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xl font-semibold pointer-events-none">₽</span>
      </div>

      {/* Category grid */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Категория</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-xl border transition-all duration-150 active:scale-95',
                category === cat.id
                  ? 'border-2 shadow-sm'
                  : 'border-slate-200/80 dark:border-white/[0.07] text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-white/[0.14] bg-slate-50/50 dark:bg-white/[0.02]'
              )}
              style={category === cat.id ? { borderColor: cat.color, background: `${cat.color}14` } : {}}
            >
              <span className="text-xl leading-none">{cat.emoji}</span>
              <span className={cn(
                'text-[9px] text-center leading-tight font-medium',
                category === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className={inputBase}
      />

      {/* Account */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Счёт</p>
        <AccountSelect accounts={activeAccounts} value={accountId} onChange={setAccountId} />
      </div>

      {/* Expand extra */}
      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors w-full"
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание..."
              rows={2}
              className={cn(inputBase, 'resize-none')}
            />
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      background: 'rgba(124,58,237,0.10)',
                      border: '1px solid rgba(124,58,237,0.22)',
                      color: '#7C3AED',
                    }}
                  >
                    <Tag size={9} />{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/[0.07] px-2 py-0.5 rounded-lg hover:border-[#7C3AED]/40 hover:text-[#7C3AED] transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                  placeholder="Новый тег..."
                  className="flex-1 bg-slate-50 dark:bg-[#161D30] border border-slate-200/80 dark:border-white/[0.07] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-[#7C3AED]/45"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-3 rounded-xl transition-colors"
                  style={{
                    background: 'rgba(124,58,237,0.10)',
                    border: '1px solid rgba(124,58,237,0.22)',
                    color: '#7C3AED',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: 'rgba(5,150,105,0.12)',
              border: '1px solid rgba(5,150,105,0.25)',
              color: V.income,
            }}
          >
            <Check size={16} /> Сохранено
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            type="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            disabled={!amount || !category}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40"
            style={{
              background: isExpense
                ? 'linear-gradient(135deg, #E11D48, #BE123C)'
                : 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: isExpense
                ? '0 6px 20px rgba(225,29,72,0.30)'
                : '0 6px 20px rgba(5,150,105,0.28)',
            }}
          >
            <Plus size={16} />
            {isExpense ? 'Добавить расход' : 'Добавить доход'}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  )
}

/* ============================================================
   HOME PAGE — main layout
   ============================================================ */
export function HomePage() {
  return (
    <div className="py-1 sm:py-2 w-full space-y-3 sm:space-y-4">
      <div className="space-y-3 lg:space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,500px)] lg:gap-5 lg:space-y-0 lg:items-start">
        {/* Left column */}
        <div className="space-y-3 sm:space-y-4 min-w-0">
          <SummaryStrip />
          <HomeGoalCard />
          <QuickTextBar />
        </div>

        {/* Right column — sticky quick add */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-[#0F1523] rounded-2xl p-4 md:p-5 lg:sticky lg:top-[96px]"
          style={{
            border: '1px solid rgba(148,163,184,0.16)',
            boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
          }}
        >
          <QuickAddForm />
        </motion.div>
      </div>
    </div>
  )
}
