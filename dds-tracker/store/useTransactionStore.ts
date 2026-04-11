'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction, Settings, Budget, Goal,
  RecurringTransaction, Account, Transfer, UserProfile,
} from '@/types'
import { generateId, getDayKey, getMonthKey } from '@/lib/utils'
import { DEFAULT_ACCOUNTS, getDefaultAccountId } from '@/lib/accounts'
import {
  dbLoadAll,
  dbUpsertAccount, dbDeleteAccount,
  dbUpsertTransaction, dbDeleteTransaction,
  dbUpsertTransfer, dbDeleteTransfer,
  dbUpsertBudget, dbDeleteBudget,
  dbUpsertGoal, dbDeleteGoal,
  dbUpsertRecurring, dbDeleteRecurring,
  dbUpsertSettings,
} from '@/lib/db'

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
  supabaseLoaded: boolean

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
  loadFromSupabase: () => Promise<void>
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
      profile: { fullName: '', email: '', phone: '', city: '' },
      settings: { currency: 'RUB', theme: 'dark' },
      initialized: false,
      supabaseLoaded: false,

      addTransaction: (t) => {
        const newTx: Transaction = { ...t, id: generateId(), createdAt: new Date().toISOString() }
        set((s) => ({ transactions: [newTx, ...s.transactions] }))
        dbUpsertTransaction(newTx).catch(console.error)
      },

      updateTransaction: (id, updates) => {
        set((s) => ({
          transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
        }))
        const updated = get().transactions.find((t) => t.id === id)
        if (updated) dbUpsertTransaction(updated).catch(console.error)
      },

      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
        dbDeleteTransaction(id).catch(console.error)
      },

      addTransfer: (t) => {
        const newTransfer: Transfer = { ...t, id: generateId(), createdAt: new Date().toISOString() }
        set((s) => ({ transfers: [newTransfer, ...s.transfers] }))
        dbUpsertTransfer(newTransfer).catch(console.error)
      },

      deleteTransfer: (id) => {
        set((s) => ({ transfers: s.transfers.filter((t) => t.id !== id) }))
        dbDeleteTransfer(id).catch(console.error)
      },

      addBudget: (b) => {
        const newBudget: Budget = { ...b, id: generateId(), createdAt: new Date().toISOString() }
        set((s) => ({ budgets: [...s.budgets, newBudget] }))
        dbUpsertBudget(newBudget).catch(console.error)
      },

      updateBudget: (id, updates) => {
        set((s) => ({ budgets: s.budgets.map((b) => b.id === id ? { ...b, ...updates } : b) }))
        const updated = get().budgets.find((b) => b.id === id)
        if (updated) dbUpsertBudget(updated).catch(console.error)
      },

      deleteBudget: (id) => {
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }))
        dbDeleteBudget(id).catch(console.error)
      },

      addGoal: (g) => {
        const newGoal: Goal = { ...g, id: generateId(), createdAt: new Date().toISOString() }
        set((s) => ({ goals: [...s.goals, newGoal] }))
        dbUpsertGoal(newGoal).catch(console.error)
      },

      updateGoal: (id, updates) => {
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g) }))
        const updated = get().goals.find((g) => g.id === id)
        if (updated) dbUpsertGoal(updated).catch(console.error)
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
        dbDeleteGoal(id).catch(console.error)
      },

      addAccount: (a) => {
        const newAccount: Account = { ...a, archived: a.archived ?? false, id: generateId(), createdAt: new Date().toISOString() }
        set((s) => ({ accounts: [...s.accounts, newAccount] }))
        dbUpsertAccount(newAccount).catch(console.error)
      },

      updateAccount: (id, updates) => {
        set((s) => ({
          accounts: s.accounts.map((a) => a.id === id ? { ...a, ...updates } : a),
        }))
        const updated = get().accounts.find((a) => a.id === id)
        if (updated) dbUpsertAccount(updated).catch(console.error)
      },

      deleteAccount: (id) => {
        set((s) => {
          if (s.accounts.length <= 1) return s
          const fallbackId = s.accounts.find((a) => a.id !== id)?.id ?? getDefaultAccountId()
          return {
            accounts: s.accounts.filter((a) => a.id !== id),
            transactions: s.transactions.map((tx) => tx.accountId === id ? { ...tx, accountId: fallbackId } : tx),
            recurring: s.recurring.map((rec) => rec.accountId === id ? { ...rec, accountId: fallbackId } : rec),
            transfers: s.transfers.map((tr) => ({
              ...tr,
              fromAccountId: tr.fromAccountId === id ? fallbackId : tr.fromAccountId,
              toAccountId: tr.toAccountId === id ? fallbackId : tr.toAccountId,
            })),
          }
        })
        dbDeleteAccount(id).catch(console.error)
      },

      addRecurring: (r) => {
        const newRec: RecurringTransaction = { ...r, id: generateId(), lastApplied: null, createdAt: new Date().toISOString() }
        set((s) => ({ recurring: [...s.recurring, newRec] }))
        dbUpsertRecurring(newRec).catch(console.error)
      },

      updateRecurring: (id, updates) => {
        set((s) => ({ recurring: s.recurring.map((r) => r.id === id ? { ...r, ...updates } : r) }))
        const updated = get().recurring.find((r) => r.id === id)
        if (updated) dbUpsertRecurring(updated).catch(console.error)
      },

      deleteRecurring: (id) => {
        set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) }))
        dbDeleteRecurring(id).catch(console.error)
      },

      applyRecurring: () => {
        const { recurring, transactions } = get()
        const today = new Date()
        const todayKey = getDayKey(today)
        const newTx: Transaction[] = []

        const updatedRecurring = recurring.map((rec) => {
          if (!shouldApply(rec, today)) return rec
          const tx: Transaction = {
            id: generateId(), type: rec.type, amount: rec.amount, category: rec.category,
            accountId: rec.accountId, date: todayKey,
            description: `${rec.description} (авто)`, tags: rec.tags,
            createdAt: new Date().toISOString(),
          }
          newTx.push(tx)
          return { ...rec, lastApplied: todayKey }
        })

        if (newTx.length > 0) {
          set({ transactions: [...newTx, ...transactions], recurring: updatedRecurring })
          newTx.forEach((tx) => dbUpsertTransaction(tx).catch(console.error))
          updatedRecurring.forEach((rec, i) => {
            if (rec !== recurring[i]) dbUpsertRecurring(rec).catch(console.error)
          })
        }
      },

      updateSettings: (s) => {
        set((state) => ({ settings: { ...state.settings, ...s } }))
        const { settings, profile } = get()
        dbUpsertSettings(settings, profile).catch(console.error)
      },

      updateProfile: (p) => {
        set((state) => ({ profile: { ...state.profile, ...p } }))
        const { settings, profile } = get()
        dbUpsertSettings(settings, profile).catch(console.error)
      },

      resetAllData: () => {
        set({
          accounts: DEFAULT_ACCOUNTS,
          transactions: [], transfers: [], budgets: [], goals: [], recurring: [],
          profile: { fullName: '', email: '', phone: '', city: '' },
          settings: { currency: 'RUB', theme: 'dark' },
          initialized: true,
        })
      },

      loadFromSupabase: async () => {
        try {
          const data = await dbLoadAll()
          if (!data) {
            set({ supabaseLoaded: true })
            return
          }

          // Первый запуск: нет счетов в БД → вставляем дефолтные
          if (data.accounts.length === 0) {
            const defaults = get().accounts.length > 0 ? get().accounts : DEFAULT_ACCOUNTS
            await Promise.all(defaults.map((a) => dbUpsertAccount(a)))
            data.accounts = defaults
          }

          set({
            accounts: data.accounts,
            transactions: data.transactions,
            transfers: data.transfers,
            budgets: data.budgets,
            goals: data.goals,
            recurring: data.recurring,
            settings: data.settings ?? get().settings,
            profile: data.profile ?? get().profile,
            supabaseLoaded: true,
          })
        } catch (e) {
          console.error('Supabase sync error:', e)
          set({ supabaseLoaded: true })
        }
      },

      bootstrap: () => {
        const { initialized } = get()
        if (!initialized) set({ initialized: true })
        get().loadFromSupabase()
      },
    }),
    {
      name: 'dds-tracker-store',
      version: 4,
      migrate: (persistedState: any) => {
        const accounts: Account[] = Array.isArray(persistedState?.accounts) && persistedState.accounts.length > 0
          ? persistedState.accounts.map((a: any) => ({ ...a, archived: a.archived ?? false }))
          : DEFAULT_ACCOUNTS
        const fallbackId = accounts[0]?.id ?? getDefaultAccountId()
        return {
          ...persistedState,
          accounts,
          supabaseLoaded: false,
          transfers: Array.isArray(persistedState?.transfers) ? persistedState.transfers : [],
          transactions: Array.isArray(persistedState?.transactions)
            ? persistedState.transactions.map((tx: any) => ({ ...tx, accountId: tx.accountId || fallbackId }))
            : [],
          recurring: Array.isArray(persistedState?.recurring)
            ? persistedState.recurring.map((rec: any) => ({ ...rec, accountId: rec.accountId || fallbackId }))
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
