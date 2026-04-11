export type TransactionType = 'income' | 'expense'
export type AccountType = 'cash' | 'card' | 'savings' | 'debt'

export interface Account {
  id: string
  name: string
  emoji: string
  color: string
  type: AccountType
  initialBalance: number
  archived: boolean
  createdAt: string
}

export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  description: string
  createdAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  accountId: string
  date: string
  description: string
  tags: string[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export type CurrencyCode = 'RUB' | 'USD' | 'EUR'

export type ThemeMode = 'dark' | 'light'

export interface UserProfile {
  fullName: string
  email: string
  phone: string
  city: string
}

export interface Settings {
  currency: CurrencyCode
  theme: ThemeMode
}

// ── Budgets ──────────────────────────────────────────────────────────────────
export interface Budget {
  id: string
  category: string
  amount: number
  period: 'month'
  createdAt: string
}

// ── Goals ────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  savedAmount: number
  deadline: string
  color: string
  createdAt: string
}

// ── Recurring transactions ────────────────────────────────────────────────────
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly'

export interface RecurringTransaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  accountId: string
  description: string
  tags: string[]
  frequency: RecurringFrequency
  startDate: string
  lastApplied: string | null
  active: boolean
  createdAt: string
}
