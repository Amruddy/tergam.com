'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Search, Trash2, Edit2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X, Download } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { CATEGORIES, getCategoryById } from '@/lib/categories'
import { getAccountById } from '@/lib/accounts'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Transaction, TransactionType } from '@/types'
import { TransactionForm } from './TransactionForm'
import { exportTransactionsCSV } from '@/lib/export'
import { inputCls as sharedInputCls } from '@/components/ui'

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'
const PAGE_SIZE = 20

function SwipeRow({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  const { accounts, settings } = useTransactionStore()
  const cat = getCategoryById(tx.category)
  const account = getAccountById(accounts, tx.accountId)
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-80, -40], [1, 0])
  const [confirming, setConfirming] = useState(false)

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -60) setConfirming(true)
    else x.set(0)
  }

  return (
    <div className="relative overflow-hidden border-b border-slate-50 dark:border-white/3 last:border-0">
      <motion.div style={{ opacity: deleteOpacity }} className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <Trash2 size={18} className="text-white" />
      </motion.div>

      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-500/95 flex items-center justify-center gap-3 z-10">
            <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-medium">Отмена</button>
            <button onClick={onDelete} className="px-4 py-2 rounded-xl bg-white text-red-500 text-sm font-bold">Удалить</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#13131a] relative z-[1] cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${cat.color}15` }}>{cat.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] sm:text-sm text-slate-900 dark:text-white font-medium truncate">{tx.description || cat.name}</div>
          <div className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{account.emoji} {account.name}</span>
            <span>•</span>
            <span>{cat.name}</span>
            {tx.tags.slice(0, 1).map((tag) => <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">{tag}</span>)}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={cn('text-[15px] sm:text-sm font-semibold', tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
            {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, settings.currency)}
          </div>
          <div className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-500">{formatDate(tx.date)}</div>
        </div>
        <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 ml-1">
          <Edit2 size={11} />
        </button>
      </motion.div>
    </div>
  )
}

function TableRow({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  const { accounts, settings } = useTransactionStore()
  const cat = getCategoryById(tx.category)
  const account = getAccountById(accounts, tx.accountId)
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="border-b border-slate-50 dark:border-[#1e1e2e]/50 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${cat.color}15` }}>{cat.emoji}</div>
          <span className="text-xs text-slate-500 dark:text-gray-400">{cat.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{account.emoji}</span>
          <span className="text-xs text-slate-500 dark:text-gray-400">{account.name}</span>
        </div>
      </td>
      <td className="px-4 py-3"><span className="text-sm text-slate-900 dark:text-white">{tx.description || '—'}</span></td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {tx.tags.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500">{tag}</span>)}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400 dark:text-gray-500 whitespace-nowrap">{formatDate(tx.date)}</td>
      <td className="px-4 py-3 text-right">
        <span className={cn('font-semibold text-sm', tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
          {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, settings.currency)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 flex items-center justify-center">
            <Edit2 size={12} />
          </button>
          {confirmDel ? (
            <button onClick={onDelete} className="px-2 py-1 rounded-lg bg-red-500/15 text-red-500 text-xs hover:bg-red-500/25">✓</button>
          ) : (
            <button onClick={() => setConfirmDel(true)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

export function TransactionTable() {
  const { accounts, transactions, deleteTransaction, settings } = useTransactionStore()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach((t) => t.tags.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [transactions])

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        getCategoryById(t.category).name.toLowerCase().includes(q) ||
        getAccountById(accounts, t.accountId).name.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      )
    }
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType)
    if (filterCategory !== 'all') list = list.filter((t) => t.category === filterCategory)
    if (filterAccount !== 'all') list = list.filter((t) => t.accountId === filterAccount)
    if (filterTag) list = list.filter((t) => t.tags.includes(filterTag))
    if (filterFrom) list = list.filter((t) => t.date >= filterFrom)
    if (filterTo) list = list.filter((t) => t.date <= filterTo)
    list.sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      if (sortField === 'date') return (a.date > b.date ? 1 : -1) * mult
      return (a.amount - b.amount) * mult
    })
    return list
  }, [accounts, transactions, search, filterType, filterCategory, filterAccount, filterTag, filterFrom, filterTo, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300 dark:text-gray-600" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-indigo-500" /> : <ChevronDown size={12} className="text-indigo-500" />
  }

  const resetFilters = () => { setSearch(''); setFilterType('all'); setFilterCategory('all'); setFilterAccount('all'); setFilterTag(''); setFilterFrom(''); setFilterTo(''); setPage(1) }
  const hasFilters = search || filterType !== 'all' || filterCategory !== 'all' || filterAccount !== 'all' || filterTag || filterFrom || filterTo

  const inputCls = sharedInputCls

  const Pagination = () => totalPages <= 1 ? null : (
    <div className="p-3 border-t border-slate-100 dark:border-[#1e1e2e] flex items-center justify-center gap-1.5">
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 flex items-center justify-center"><ChevronLeft size={14} /></button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i
        return (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={cn('w-8 h-8 rounded-lg text-xs font-medium transition-all', page === p ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5')}
          >
            {p}
          </button>
        )
      })}
      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 flex items-center justify-center"><ChevronRight size={14} /></button>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {editingTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingTx(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <TransactionForm editingTx={editingTx} onClose={() => setEditingTx(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3 md:p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Поиск..." className={cn(inputCls, 'w-full pl-8 pr-3 py-2 text-[15px] sm:text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700')} />
          </div>
          <button onClick={() => exportTransactionsCSV(filtered, accounts)} title="Экспорт CSV" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors flex-shrink-0">
            <Download size={14} />
            <span className="hidden md:inline text-xs">CSV</span>
          </button>
          {hasFilters && (
            <button onClick={resetFilters} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 flex-shrink-0">
              <X size={13} /> <span className="text-xs hidden md:inline">Сброс</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <div className="flex bg-slate-100 dark:bg-[#0a0a0f] rounded-xl p-0.5 gap-0.5">
            {([['all', 'Все'], ['income', '💚'], ['expense', '❤️']] as const).map(([val, label]) => (
              <button key={val} onClick={() => { setFilterType(val as any); setPage(1) }} className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all', filterType === val ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300')}>{label}</button>
            ))}
          </div>
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }} className={cn(inputCls, 'px-2.5 py-1.5 text-xs')}>
            <option value="all">Все категории</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <select value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setPage(1) }} className={cn(inputCls, 'px-2.5 py-1.5 text-xs')}>
            <option value="all">Все счета</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.emoji} {account.name}</option>)}
          </select>
          {allTags.length > 0 && (
            <select value={filterTag} onChange={(e) => { setFilterTag(e.target.value); setPage(1) }} className={cn(inputCls, 'px-2.5 py-1.5 text-xs')}>
              <option value="">Все теги</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}
          <input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }} className={cn(inputCls, 'px-2.5 py-1.5 text-xs')} />
          <span className="text-slate-300 dark:text-gray-600 self-center text-xs">—</span>
          <input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1) }} className={cn(inputCls, 'px-2.5 py-1.5 text-xs')} />
        </div>
      </div>

      <div className="md:hidden bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1e1e2e] flex items-center justify-between">
          <span className="text-[13px] sm:text-xs text-slate-400 dark:text-gray-500"><span className="text-slate-900 dark:text-white font-medium">{filtered.length}</span> записей</span>
          <span className="text-[12px] sm:text-xs text-slate-400 dark:text-gray-500 italic">← потяните для удаления</span>
        </div>
        <AnimatePresence initial={false}>
          {paginated.map((tx) => <SwipeRow key={tx.id} tx={tx} onEdit={() => setEditingTx(tx)} onDelete={() => deleteTransaction(tx.id)} />)}
        </AnimatePresence>
        {paginated.length === 0 && <div className="py-10 text-center text-slate-400 dark:text-gray-600 text-sm">Не найдено</div>}
        <Pagination />
      </div>

      <div className="hidden md:block bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-[#1e1e2e] flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-gray-500">Найдено: <span className="text-slate-900 dark:text-white font-medium">{filtered.length}</span></span>
          <span className="text-xs text-slate-300 dark:text-gray-600">Стр. {page} / {totalPages}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[#1e1e2e]">
              <th className="text-left text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3">Категория</th>
              <th className="text-left text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3">Счёт</th>
              <th className="text-left text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3">Описание</th>
              <th className="text-left text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3">Теги</th>
              <th className="text-left text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-white" onClick={() => toggleSort('date')}><span className="flex items-center gap-1">Дата <SortIcon field="date" /></span></th>
              <th className="text-right text-xs text-slate-400 dark:text-gray-500 font-medium px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-white" onClick={() => toggleSort('amount')}><span className="flex items-center justify-end gap-1">Сумма <SortIcon field="amount" /></span></th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {paginated.map((tx) => <TableRow key={tx.id} tx={tx} onEdit={() => setEditingTx(tx)} onDelete={() => deleteTransaction(tx.id)} />)}
            </AnimatePresence>
          </tbody>
        </table>
        {paginated.length === 0 && <div className="py-12 text-center text-slate-400 dark:text-gray-600 text-sm">Транзакции не найдены</div>}
        <Pagination />
      </div>
    </>
  )
}
