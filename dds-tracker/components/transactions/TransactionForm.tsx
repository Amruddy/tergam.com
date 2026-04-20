'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, Tag, X } from 'lucide-react'
import { getActiveAccounts, getDefaultAccountId } from '@/lib/accounts'
import { TRANSACTION_SUGGESTED_TAGS } from '@/lib/app-constants'
import { useTransactionStore } from '@/store/useTransactionStore'
import type { Transaction, TransactionType } from '@/types'
import { cn } from '@/lib/utils'
import { AccountSelect, CategoryGrid, FieldLabel, TypeToggle, inputCls as sharedInputCls } from '@/components/ui'

interface Props {
  editingTx?: Transaction | null
  onClose?: () => void
}

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
    if (!editingTx) return
    setType(editingTx.type)
    setAmount(String(editingTx.amount))
    setCategory(editingTx.category)
    setAccountId(editingTx.accountId)
    setDate(editingTx.date)
    setDescription(editingTx.description)
    setTags(editingTx.tags)
  }, [editingTx])

  useEffect(() => {
    if (!editingTx && !accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0]?.id ?? getDefaultAccountId())
    }
  }, [activeAccounts, accountId, editingTx])

  const handleAmountChange = (value: string) => setAmount(value.replace(/[^\d]/g, ''))
  const formatDisplay = (value: string) => (value ? Number(value).toLocaleString('ru-RU') : '')

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase()
    if (normalized && !tags.includes(normalized)) setTags([...tags, normalized])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((item) => item !== tag))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !date || !accountId) return

    const payload = {
      type,
      amount: Number(amount),
      category,
      accountId,
      date,
      description,
      tags,
    }

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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#13131a] md:rounded-2xl md:p-6 md:space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
          {editingTx ? 'Редактировать' : 'Добавить транзакцию'}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <TypeToggle value={type} onChange={(nextType) => { setType(nextType); setCategory('') }} />

      <div>
        <FieldLabel>Сумма</FieldLabel>
        <div className="relative">
          <input
            type="text"
            value={formatDisplay(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            required
            className={cn(sharedInputCls, 'pr-10 text-lg font-semibold tracking-[-0.02em] whitespace-nowrap')}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-slate-400 dark:text-gray-500">₽</span>
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
        <FieldLabel>Дата</FieldLabel>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={sharedInputCls} />
      </div>

      <div>
        <FieldLabel>Описание</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание транзакции..."
          rows={3}
          className={cn(sharedInputCls, 'min-h-[104px] resize-none py-3 text-[15px]')}
        />
      </div>

      <div>
        <FieldLabel>Теги</FieldLabel>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex min-h-8 items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300"
            >
              <Tag size={10} />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:text-indigo-900 dark:hover:text-white"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          {TRANSACTION_SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="min-h-8 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-indigo-400/40 hover:text-indigo-500 dark:border-[#1e1e2e] dark:text-gray-500 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
            >
              + {tag}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
            placeholder="Новый тег..."
            className={cn(sharedInputCls, 'flex-1')}
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="flex min-h-11 items-center justify-center rounded-2xl border border-indigo-500/25 bg-indigo-500/15 px-4 text-indigo-500 transition-colors hover:bg-indigo-500/25 dark:text-indigo-400"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-green-500/25 bg-green-500/15 py-3 text-sm font-medium text-green-600 dark:text-green-400"
          >
            <Check size={16} /> Сохранено!
          </motion.div>
        ) : (
          <motion.button
            key="submit"
            type="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'min-h-12 w-full rounded-2xl py-3 text-sm font-semibold transition-all',
              type === 'expense'
                ? 'border border-red-500/25 bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400'
                : 'border border-green-500/25 bg-green-500/15 text-green-600 hover:bg-green-500/25 dark:text-green-400'
            )}
          >
            {editingTx ? 'Сохранить изменения' : `Добавить ${type === 'expense' ? 'расход' : 'доход'}`}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  )
}
