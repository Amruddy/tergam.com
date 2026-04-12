import { Account, AccountType, Transaction, Transfer } from '@/types'
import { generateId } from '@/lib/utils'

const DEFAULT_ACCOUNT_TEMPLATES: Omit<Account, 'id'>[] = [
  { name: 'Наличные', emoji: '💵', color: '#22c55e', type: 'cash', initialBalance: 0, archived: false, createdAt: '2026-04-11T00:00:00.000Z' },
  { name: 'Карта', emoji: '💳', color: '#6366f1', type: 'card', initialBalance: 0, archived: false, createdAt: '2026-04-11T00:00:00.000Z' },
  { name: 'Сбережения', emoji: '🪙', color: '#f59e0b', type: 'savings', initialBalance: 0, archived: false, createdAt: '2026-04-11T00:00:00.000Z' },
  { name: 'Долги', emoji: '📉', color: '#ef4444', type: 'debt', initialBalance: 0, archived: false, createdAt: '2026-04-11T00:00:00.000Z' },
]

export const LEGACY_DEFAULT_ACCOUNT_IDS = ['cash', 'card', 'savings', 'debt'] as const

export function createDefaultAccounts(): Account[] {
  return DEFAULT_ACCOUNT_TEMPLATES.map((account) => ({ ...account, id: generateId() }))
}

export const DEFAULT_ACCOUNTS: Account[] = createDefaultAccounts()

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Наличные',
  card: 'Карта',
  savings: 'Сбережения',
  debt: 'Долги',
}

export const getDefaultAccountId = (accounts: Account[] = DEFAULT_ACCOUNTS) =>
  accounts.find((account) => account.type === 'card')?.id ?? accounts[0]?.id ?? ''

export const getAccountById = (accounts: Account[], id: string) =>
  accounts.find((account) => account.id === id) ??
  accounts[0] ??
  DEFAULT_ACCOUNTS[0]

export const getAccountTypeLabel = (type: AccountType) => ACCOUNT_TYPE_LABELS[type]

export const getActiveAccounts = (accounts: Account[]) => accounts.filter((account) => !account.archived)

export function getAccountBalance(account: Account, transactions: Transaction[], transfers: Transfer[]) {
  const txDelta = transactions.reduce((sum, tx) => {
    if (tx.accountId !== account.id) return sum
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount
  }, 0)

  const transferDelta = transfers.reduce((sum, transfer) => {
    if (transfer.toAccountId === account.id) return sum + transfer.amount
    if (transfer.fromAccountId === account.id) return sum - transfer.amount
    return sum
  }, 0)

  return account.initialBalance + txDelta + transferDelta
}

export function getAccountMonthChange(account: Account, transactions: Transaction[], transfers: Transfer[], monthKey: string) {
  const txDelta = transactions.reduce((sum, tx) => {
    if (tx.accountId !== account.id || !tx.date.startsWith(monthKey)) return sum
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount
  }, 0)

  const transferDelta = transfers.reduce((sum, transfer) => {
    if (!transfer.date.startsWith(monthKey)) return sum
    if (transfer.toAccountId === account.id) return sum + transfer.amount
    if (transfer.fromAccountId === account.id) return sum - transfer.amount
    return sum
  }, 0)

  return txDelta + transferDelta
}
