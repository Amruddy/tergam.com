'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction,
  Settings,
  Budget,
  Goal,
  RecurringTransaction,
  Account,
  Transfer,
  UserProfile,
} from '@/types'
import { generateId, getDayKey, getMonthKey } from '@/lib/utils'
import { DEFAULT_ACCOUNTS, getDefaultAccountId } from '@/lib/accounts'

function shouldApply(rec: RecurringTransaction, today: Date): boolean {
  if (!rec.active) return false
  const todayKey = getDayKey(today)
  if (rec.lastApplied === todayKey) return false

  if (!rec.lastApplied) return true

  const last = new Date(rec.lastApplied)
  if (rec.frequency === 'daily') return todayKey > rec.lastApplied
  if (rec.frequency === 'weekly') {
    const msWeek = 7 * 24 * 60 * 60 * 1000
    return today.getTime() - last.getTime() >= msWeek
  }
  if (rec.frequency === 'monthly') {
    return getMonthKey(today) > getMonthKey(last)
  }
  return false
}

interface TransactionStore {
  accounts: Account[]
  transactions: Transaction[]
  transfers: Transfer[]
  budgets: Budget[]
  goals: Goal[]
  recurring: RecurringTransaction[]
  profile: UserProfile
  settings: Settings
  initialized: boolean

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, t: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void
  deleteTransaction: (id: string) => void

  addTransfer: (t: Omit<Transfer, 'id' | 'createdAt'>) => void
  deleteTransfer: (id: string) => void

  addBudget: (b: Omit<Budget, 'id' | 'createdAt'>) => void
  updateBudget: (id: string, b: Partial<Omit<Budget, 'id' | 'createdAt'>>) => void
  deleteBudget: (id: string) => void

  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, g: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void
  deleteGoal: (id: string) => void

  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, a: Partial<Omit<Account, 'id' | 'createdAt'>>) => void
  deleteAccount: (id: string) => void

  addRecurring: (r: Omit<RecurringTransaction, 'id' | 'createdAt' | 'lastApplied'>) => void
  updateRecurring: (id: string, r: Partial<Omit<RecurringTransaction, 'id' | 'createdAt'>>) => void
  deleteRecurring: (id: string) => void
  applyRecurring: () => void

  updateSettings: (s: Partial<Settings>) => void
  updateProfile: (p: Partial<UserProfile>) => void
  resetAllData: () => void
  bootstrap: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,
      transactions: [],
      transfers: [],
      budgets: [],
      goals: [],
      recurring: [],
      profile: {
        fullName: '',
        email: '',
        phone: '',
        city: '',
      },
      settings: {
        currency: 'RUB',
        theme: 'dark',
      },
      initialized: false,

      addTransaction: (t) =>
        set((s) => ({
          transactions: [{ ...t, id: generateId(), createdAt: new Date().toISOString() }, ...s.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((s) => ({
          transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
        })),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addTransfer: (t) =>
        set((s) => ({
          transfers: [{ ...t, id: generateId(), createdAt: new Date().toISOString() }, ...s.transfers],
        })),

      deleteTransfer: (id) =>
        set((s) => ({ transfers: s.transfers.filter((t) => t.id !== id) })),

      addBudget: (b) =>
        set((s) => ({
          budgets: [...s.budgets, { ...b, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateBudget: (id, updates) =>
        set((s) => ({ budgets: s.budgets.map((b) => b.id === id ? { ...b, ...updates } : b) })),

      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [...s.goals, { ...g, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g) })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addAccount: (a) =>
        set((s) => ({
          accounts: [...s.accounts, { ...a, archived: a.archived ?? false, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateAccount: (id, updates) =>
        set((s) => ({
          accounts: s.accounts.map((account) => account.id === id ? { ...account, ...updates } : account),
        })),

      deleteAccount: (id) =>
        set((s) => {
          if (s.accounts.length <= 1) return s

          const fallbackId = s.accounts.find((account) => account.id !== id)?.id ?? getDefaultAccountId()

          return {
            accounts: s.accounts.filter((account) => account.id !== id),
            transactions: s.transactions.map((tx) => tx.accountId === id ? { ...tx, accountId: fallbackId } : tx),
            recurring: s.recurring.map((rec) => rec.accountId === id ? { ...rec, accountId: fallbackId } : rec),
            transfers: s.transfers.map((transfer) => ({
              ...transfer,
              fromAccountId: transfer.fromAccountId === id ? fallbackId : transfer.fromAccountId,
              toAccountId: transfer.toAccountId === id ? fallbackId : transfer.toAccountId,
            })),
          }
        }),

      addRecurring: (r) =>
        set((s) => ({
          recurring: [...s.recurring, { ...r, id: generateId(), lastApplied: null, createdAt: new Date().toISOString() }],
        })),

      updateRecurring: (id, updates) =>
        set((s) => ({ recurring: s.recurring.map((r) => r.id === id ? { ...r, ...updates } : r) })),

      deleteRecurring: (id) =>
        set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) })),

      applyRecurring: () => {
        const { recurring, transactions } = get()
        const today = new Date()
        const todayKey = getDayKey(today)
        const newTx: Transaction[] = []

        const updatedRecurring = recurring.map((rec) => {
          if (!shouldApply(rec, today)) return rec

          newTx.push({
            id: generateId(),
            type: rec.type,
            amount: rec.amount,
            category: rec.category,
            accountId: rec.accountId,
            date: todayKey,
            description: `${rec.description} (авто)`,
            tags: rec.tags,
            createdAt: new Date().toISOString(),
          })

          return { ...rec, lastApplied: todayKey }
        })

        if (newTx.length > 0) {
          set({ transactions: [...newTx, ...transactions], recurring: updatedRecurring })
        }
      },

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      updateProfile: (p) =>
        set((state) => ({ profile: { ...state.profile, ...p } })),

      resetAllData: () =>
        set({
          accounts: DEFAULT_ACCOUNTS,
          transactions: [],
          transfers: [],
          budgets: [],
          goals: [],
          recurring: [],
          profile: {
            fullName: '',
            email: '',
            phone: '',
            city: '',
          },
          settings: {
            currency: 'RUB',
            theme: 'dark',
          },
          initialized: true,
        }),

      bootstrap: () => {
        const { initialized } = get()
        if (!initialized) {
          set({ initialized: true })
        }
      },
    }),
    {
      name: 'dds-tracker-store',
      version: 4,
      migrate: (persistedState: any) => {
        const accounts: Account[] = Array.isArray(persistedState?.accounts) && persistedState.accounts.length > 0
          ? persistedState.accounts.map((account: any) => ({
            ...account,
            archived: account.archived ?? false,
          }))
          : DEFAULT_ACCOUNTS
        const fallbackId = accounts[0]?.id ?? getDefaultAccountId()

        return {
          ...persistedState,
          accounts,
          transfers: Array.isArray(persistedState?.transfers) ? persistedState.transfers : [],
          transactions: Array.isArray(persistedState?.transactions)
            ? persistedState.transactions.map((tx: any) => ({
              ...tx,
              accountId: tx.accountId || fallbackId,
            }))
            : [],
          recurring: Array.isArray(persistedState?.recurring)
            ? persistedState.recurring.map((rec: any) => ({
              ...rec,
              accountId: rec.accountId || fallbackId,
            }))
            : [],
          profile: {
            fullName: persistedState?.profile?.fullName ?? '',
            email: persistedState?.profile?.email ?? '',
            phone: persistedState?.profile?.phone ?? '',
            city: persistedState?.profile?.city ?? '',
          },
          settings: {
            currency: persistedState?.settings?.currency ?? 'RUB',
            theme: persistedState?.settings?.theme ?? 'dark',
          },
        }
      },
    }
  )
)

export function useChartTheme() {
  const { settings } = useTransactionStore()
  const isDark = settings.theme !== 'light'
  return {
    isDark,
    grid: isDark ? '#1e1e2e' : '#e2e8f0',
    tick: isDark ? '#6b7280' : '#94a3b8',
    tooltipBg: isDark ? '#13131a' : '#ffffff',
    tooltipBorder: isDark ? '#1e1e2e' : '#e2e8f0',
    tooltipText: isDark ? '#ffffff' : '#0f172a',
    tooltipMuted: isDark ? '#9ca3af' : '#64748b',
  }
}
