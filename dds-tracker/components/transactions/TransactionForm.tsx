'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Tag, Check } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { CATEGORIES } from '@/lib/categories'
import { getActiveAccounts, getDefaultAccountId } from '@/lib/accounts'
import { cn } from '@/lib/utils'
import { Transaction, TransactionType } from '@/types'
import { AccountSelect } from '@/components/ui'

interface Props {
  editingTx?: Transaction | null
  onClose?: () => void
}

const SUGGESTED_TAGS = ['работа', 'продукты', 'такси', 'жильё', 'досуг', 'здоровье', 'онлайн']

export function TransactionForm({ editingTx, onClose }: Props) {
  const { accounts, addTransaction, updateTransaction } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type)
      setAmount(String(editingTx.amount))
      setCategory(editingTx.category)
      setAccountId(editingTx.accountId)
      setDate(editingTx.date)
      setDescription(editingTx.description)
      setTags(editingTx.tags)
    }
  }, [editingTx])

  useEffect(() => {
    if (!editingTx && !accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
    }
  }, [activeAccounts, accountId, editingTx])

  const availableCategories = CATEGORIES.filter((c) => c.type === type || c.type === 'both')

  const handleAmountChange = (v: string) => setAmount(v.replace(/[^\d]/g, ''))
  const formatDisplay = (v: string) => v ? Number(v).toLocaleString('ru-RU') : ''

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !date || !accountId) return

    const payload = { type, amount: Number(amount), category, accountId, date, description, tags }

    if (editingTx) {
      updateTransaction(editingTx.id, payload)
      onClose?.()
      return
    }

    addTransaction(payload)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setAmount('')
      setDescription('')
      setTags([])
      setCategory('')
    }, 1500)
  }

  const inputCls = 'w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-[#1e1e2e] rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 space-y-5 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white font-semibold">{editingTx ? 'Редактировать' : 'Добавить транзакцию'}</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex bg-slate-100 dark:bg-[#0a0a0f] rounded-xl p-1 gap-1">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategory('') }}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              type === t
                ? t === 'expense'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25'
                  : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25'
                : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
            )}
          >
            {t === 'expense' ? '❤️ Расход' : '💚 Доход'}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Сумма</label>
        <div className="relative">
          <input type="text" value={formatDisplay(amount)} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" required className={cn(inputCls, 'text-lg font-semibold pr-8')} />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 font-medium">₽</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Категория</label>
        <div className="grid grid-cols-4 gap-2">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-xs',
                category === cat.id
                  ? 'border-2 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-[#1e1e2e] text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-700 dark:hover:text-gray-300'
              )}
              style={category === cat.id ? { borderColor: cat.color, background: `${cat.color}15` } : {}}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Счёт</label>
        <AccountSelect accounts={activeAccounts} value={accountId} onChange={setAccountId} />
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Дата</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Описание</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание транзакции..." rows={2} className={cn(inputCls, 'resize-none text-sm')} />
      </div>

      <div>
        <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1.5">Теги</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-lg">
              <Tag size={10} />{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900 dark:hover:text-white ml-0.5"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="text-xs text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-[#1e1e2e] px-2.5 py-1 rounded-lg hover:border-indigo-400/40 hover:text-indigo-500 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400 transition-colors"
            >
              + {tag}
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
            className="flex-1 bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-[#1e1e2e] rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50"
          />
          <button type="button" onClick={() => addTag(tagInput)} className="px-3 py-2 bg-indigo-500/15 border border-indigo-500/25 rounded-xl text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/25 transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full py-3 rounded-xl bg-green-500/15 border border-green-500/25 text-green-600 dark:text-green-400 font-medium text-sm flex items-center justify-center gap-2">
            <Check size={16} /> Сохранено!
          </motion.div>
        ) : (
          <motion.button
            key="submit"
            type="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all',
              type === 'expense'
                ? 'bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/25'
                : 'bg-green-500/15 border border-green-500/25 text-green-600 dark:text-green-400 hover:bg-green-500/25'
            )}
          >
            {editingTx ? 'Сохранить изменения' : `Добавить ${type === 'expense' ? 'расход' : 'доход'}`}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  )
}
