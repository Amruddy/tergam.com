'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Landmark, PencilLine, Plus, Trash2, Wallet } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAccountBalance, getAccountMonthChange, getAccountTypeLabel, getActiveAccounts } from '@/lib/accounts'
import { formatCurrency, cn, getMonthKey, formatDate } from '@/lib/utils'
import { Account, AccountType } from '@/types'
import { Btn, EmptyState, FieldLabel, FormCard, IconBtn, PageHeader, SectionLabel, StatStrip, inputCls } from '@/components/ui'
import { getCategoryById } from '@/lib/categories'

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string; emoji: string; color: string }[] = [
  { value: 'cash', label: 'Наличные', emoji: '💵', color: '#22c55e' },
  { value: 'card', label: 'Карта', emoji: '💳', color: '#6366f1' },
  { value: 'savings', label: 'Сбережения', emoji: '🪙', color: '#f59e0b' },
  { value: 'debt', label: 'Долги', emoji: '📉', color: '#ef4444' },
]

type HistoryItem =
  | { id: string; kind: 'transaction'; date: string; createdAt: string; title: string; subtitle: string; amount: number }
  | { id: string; kind: 'transfer'; date: string; createdAt: string; title: string; subtitle: string; amount: number }

function AccountEditor({
  title,
  account,
  onClose,
}: {
  title: string
  account?: Account
  onClose: () => void
}) {
  const { updateAccount, addAccount } = useTransactionStore()
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'card')
  const [initialBalance, setInitialBalance] = useState(String(account?.initialBalance ?? 0))

  const selectedType = ACCOUNT_TYPE_OPTIONS.find((item) => item.value === type) ?? ACCOUNT_TYPE_OPTIONS[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const payload = {
      name: name.trim(),
      type,
      emoji: selectedType.emoji,
      color: selectedType.color,
      initialBalance: Number(initialBalance || '0'),
      archived: account?.archived ?? false,
    }

    if (account) updateAccount(account.id, payload)
    else addAccount(payload)
    onClose()
  }

  return (
    <FormCard title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Название</FieldLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Альфа карта" className={inputCls} />
        </div>

        <div>
          <FieldLabel>Тип счёта</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all',
                  type === option.value ? 'border-2 shadow-sm' : 'border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15'
                )}
                style={type === option.value ? { borderColor: option.color, background: `${option.color}12` } : {}}
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Стартовый баланс</FieldLabel>
          <div className="relative">
            <input type="text" inputMode="numeric" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value.replace(/[^\d-]/g, ''))} placeholder="0" className={cn(inputCls, 'pr-8')} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm font-medium">₽</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Btn>
          <Btn type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
            {account ? 'Сохранить' : 'Добавить'}
          </Btn>
        </div>
      </form>
    </FormCard>
  )
}

function TransferForm({ onClose }: { onClose: () => void }) {
  const { accounts, addTransfer } = useTransactionStore()
  const activeAccounts = getActiveAccounts(accounts)
  const [fromAccountId, setFromAccountId] = useState(activeAccounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState(activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || !amount) return
    addTransfer({
      fromAccountId,
      toAccountId,
      amount: Number(amount),
      date,
      description: description.trim(),
    })
    onClose()
  }

  return (
    <FormCard title="Перевод между счетами" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Со счёта</FieldLabel>
          <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} className={inputCls}>
            {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.emoji} {account.name}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>На счёт</FieldLabel>
          <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className={inputCls}>
            {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.emoji} {account.name}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Сумма</FieldLabel>
          <div className="relative">
            <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className={cn(inputCls, 'pr-8')} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm font-medium">₽</span>
          </div>
        </div>

        <div>
          <FieldLabel>Дата</FieldLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>

        <div>
          <FieldLabel>Комментарий</FieldLabel>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Например, перевёл на накопления" className={inputCls} />
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Отмена</Btn>
          <Btn type="submit" variant="primary" className="flex-1" disabled={!amount || !fromAccountId || !toAccountId || fromAccountId === toAccountId}>Перевести</Btn>
        </div>
      </form>
    </FormCard>
  )
}

function AccountCard({
  account,
  balance,
  monthChange,
  history,
  onEdit,
  onToggleArchive,
  onDelete,
}: {
  account: Account
  balance: number
  monthChange: number
  history: HistoryItem[]
  onEdit: () => void
  onToggleArchive: () => void
  onDelete: () => void
}) {
  const { settings } = useTransactionStore()
  const positive = balance >= 0

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${account.color}16` }}>
            {account.emoji}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white truncate">{account.name}</div>
            <div className="text-xs text-slate-400 dark:text-gray-500">{getAccountTypeLabel(account.type)}{account.archived ? ' • архив' : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn variant="secondary" onClick={onEdit} title="Редактировать счёт">
            <PencilLine size={12} />
          </IconBtn>
          <IconBtn variant="secondary" onClick={onToggleArchive} title={account.archived ? 'Вернуть из архива' : 'Архивировать'}>
            <Archive size={12} />
          </IconBtn>
          {account.archived && (
            <IconBtn variant="danger" onClick={onDelete} title="Удалить счёт">
              <Trash2 size={12} />
            </IconBtn>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-1">Текущий баланс</div>
          <div className={cn('text-xl font-bold', positive ? 'text-slate-900 dark:text-white' : 'text-red-500')}>
            {formatCurrency(balance, settings.currency)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-1">Изменение за месяц</div>
          <div className={cn('text-sm font-semibold', monthChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
            {monthChange >= 0 ? '+' : '−'}{formatCurrency(Math.abs(monthChange), settings.currency)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
        <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-2">Последняя активность</div>
        {history.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-gray-600">Операций по счёту пока нет</div>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-700 dark:text-gray-300 truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-400 dark:text-gray-600 truncate">{item.subtitle} • {formatDate(item.date)}</div>
                </div>
                <div className={cn('text-xs font-semibold flex-shrink-0', item.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
                  {item.amount >= 0 ? '+' : '−'}{formatCurrency(Math.abs(item.amount), settings.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function AccountsPage() {
  const { accounts, transactions, transfers, settings, updateAccount, deleteAccount } = useTransactionStore()
  const [mode, setMode] = useState<'create' | 'edit' | 'transfer' | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const activeAccounts = useMemo(() => getActiveAccounts(accounts), [accounts])
  const archivedAccounts = useMemo(() => accounts.filter((account) => account.archived), [accounts])

  const now = new Date()
  const thisMonth = getMonthKey(now)

  const accountCards = useMemo(() => {
    return accounts.map((account) => {
      const balance = getAccountBalance(account, transactions, transfers)
      const monthChange = getAccountMonthChange(account, transactions, transfers, thisMonth)

      const txHistory: HistoryItem[] = transactions
        .filter((tx) => tx.accountId === account.id)
        .map((tx) => {
          const category = getCategoryById(tx.category)
          return {
            id: `tx-${tx.id}`,
            kind: 'transaction' as const,
            date: tx.date,
            createdAt: tx.createdAt,
            title: tx.description || category.name,
            subtitle: category.name,
            amount: tx.type === 'income' ? tx.amount : -tx.amount,
          }
        })

      const transferHistory: HistoryItem[] = transfers
        .filter((transfer) => transfer.fromAccountId === account.id || transfer.toAccountId === account.id)
        .map((transfer) => {
          const isIncoming = transfer.toAccountId === account.id
          const counterparty = accounts.find((item) => item.id === (isIncoming ? transfer.fromAccountId : transfer.toAccountId))
          return {
            id: `transfer-${transfer.id}-${account.id}`,
            kind: 'transfer' as const,
            date: transfer.date,
            createdAt: transfer.createdAt,
            title: isIncoming ? 'Перевод на счёт' : 'Перевод со счёта',
            subtitle: `${counterparty?.emoji ?? '↔'} ${counterparty?.name ?? 'Другой счёт'}${transfer.description ? ` • ${transfer.description}` : ''}`,
            amount: isIncoming ? transfer.amount : -transfer.amount,
          }
        })

      const history = [...txHistory, ...transferHistory]
        .sort((a, b) => {
          const byDate = new Date(b.date).getTime() - new Date(a.date).getTime()
          if (byDate !== 0) return byDate
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        .slice(0, 3)

      return { account, balance, monthChange, history }
    })
  }, [accounts, transactions, transfers, thisMonth])

  const totalBalance = activeAccounts.reduce((sum, account) => sum + getAccountBalance(account, transactions, transfers), 0)
  const monthDelta = activeAccounts.reduce((sum, account) => sum + getAccountMonthChange(account, transactions, transfers, thisMonth), 0)
  const debtTotal = activeAccounts.filter((account) => getAccountBalance(account, transactions, transfers) < 0).reduce((sum, account) => sum + Math.abs(getAccountBalance(account, transactions, transfers)), 0)

  return (
    <div className="space-y-5 py-2">
      <PageHeader
        icon={Landmark}
        iconColor="#0ea5e9"
        title="Счета"
        subtitle="Переводы, баланс и история по каждому счёту"
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={() => setMode('transfer')}><ArrowLeftRight size={15} /> Перевод</Btn>
            <Btn onClick={() => setMode('create')}><Plus size={15} /> Добавить</Btn>
          </div>
        }
      />

      <StatStrip items={[
        { label: 'Активных счетов', value: String(activeAccounts.length), icon: Wallet, color: '#0ea5e9' },
        { label: 'Общий баланс', value: formatCurrency(totalBalance, settings.currency), icon: ArrowUpCircle, color: '#22c55e' },
        { label: 'Изменение за месяц', value: `${monthDelta >= 0 ? '+' : '−'}${formatCurrency(Math.abs(monthDelta), settings.currency)}`, icon: ArrowUpCircle, color: monthDelta >= 0 ? '#6366f1' : '#ef4444' },
        { label: 'Долги', value: formatCurrency(debtTotal, settings.currency), icon: ArrowDownCircle, color: '#ef4444' },
      ]} />

      <AnimatePresence>
        {(mode === 'create' || (mode === 'edit' && selectedAccount) || mode === 'transfer') && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setMode(null); setSelectedAccount(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {mode === 'create' && <AccountEditor title="Новый счёт" onClose={() => setMode(null)} />}
              {mode === 'edit' && selectedAccount && <AccountEditor title="Редактировать счёт" account={selectedAccount} onClose={() => { setSelectedAccount(null); setMode(null) }} />}
              {mode === 'transfer' && <TransferForm onClose={() => setMode(null)} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeAccounts.length === 0 && mode !== 'create' ? (
        <EmptyState
          emoji="🏦"
          title="Активных счетов нет"
          subtitle="Добавьте счёт или верните один из архива, чтобы работать с балансами и переводами"
          action={<Btn variant="ghost" onClick={() => setMode('create')}><Plus size={14} /> Создать счёт</Btn>}
        />
      ) : (
        <div className="space-y-5">
          {activeAccounts.length > 0 && (
            <div className="space-y-3">
              <SectionLabel>Активные</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {accountCards.filter((item) => !item.account.archived).map(({ account, balance, monthChange, history }) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    balance={balance}
                    monthChange={monthChange}
                    history={history}
                    onEdit={() => { setSelectedAccount(account); setMode('edit') }}
                    onToggleArchive={() => updateAccount(account.id, { archived: true })}
                    onDelete={() => deleteAccount(account.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {archivedAccounts.length > 0 && (
            <div className="space-y-3">
              <SectionLabel>Архив</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {accountCards.filter((item) => item.account.archived).map(({ account, balance, monthChange, history }) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    balance={balance}
                    monthChange={monthChange}
                    history={history}
                    onEdit={() => { setSelectedAccount(account); setMode('edit') }}
                    onToggleArchive={() => updateAccount(account.id, { archived: false })}
                    onDelete={() => deleteAccount(account.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
