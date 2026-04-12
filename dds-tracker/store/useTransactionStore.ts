'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction, Settings, Budget, Goal,
  RecurringTransaction, Account, Transfer, UserProfile,
} from '@/types'
import { generateId, getDayKey, getMonthKey } from '@/lib/utils'
import { createDefaultAccounts, getDefaultAccountId, LEGACY_DEFAULT_ACCOUNT_IDS } from '@/lib/accounts'
import {
  dbLoadAll,
  dbUpsertAccount, dbDeleteAccount,
  dbUpsertTransaction, dbDeleteTransaction,
  dbUpsertTransfer, dbDeleteTransfer,
  dbUpsertBudget, dbDeleteBudget,
  dbUpsertGoal, dbDeleteGoal,
  dbUpsertRecurring, dbDeleteRecurring,
  dbUpsertSettings,
  dbReplaceAccountReferences,
  dbClearAllUserData,
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

const defaultProfile = (): UserProfile => ({ fullName: '', email: '', phone: '', city: '' })
const defaultSettings = (): Settings => ({ currency: 'RUB', theme: 'light' })

function remapLegacyDefaultAccountIds(
  accountsInput: Account[],
  transactionsInput: Transaction[],
  transfersInput: Transfer[],
  recurringInput: RecurringTransaction[],
) {
  const legacyIds = new Set<string>(LEGACY_DEFAULT_ACCOUNT_IDS)
  const idMap = new Map<string, string>()

  const accounts = accountsInput.map((account) => {
    if (!legacyIds.has(account.id)) return { ...account, archived: account.archived ?? false }
    const nextId = generateId()
    idMap.set(account.id, nextId)
    return { ...account, id: nextId, archived: account.archived ?? false }
  })

  if (idMap.size === 0) {
    return {
      accounts,
      transactions: transactionsInput,
      transfers: transfersInput,
      recurring: recurringInput,
    }
  }

  return {
    accounts,
    transactions: transactionsInput.map((tx) => ({
      ...tx,
      accountId: idMap.get(tx.accountId) ?? tx.accountId,
    })),
    transfers: transfersInput.map((transfer) => ({
      ...transfer,
      fromAccountId: idMap.get(transfer.fromAccountId) ?? transfer.fromAccountId,
      toAccountId: idMap.get(transfer.toAccountId) ?? transfer.toAccountId,
    })),
    recurring: recurringInput.map((rec) => ({
      ...rec,
      accountId: idMap.get(rec.accountId) ?? rec.accountId,
    })),
  }
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
  syncError: string | null

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
  clearAllData: () => Promise<boolean>
  bootstrap: () => void
  loadFromSupabase: () => Promise<void>
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => {
      const handleSyncError = (error: unknown, fallback: string) => {
        console.error('Supabase sync error:', error)
        set({
          syncError: error instanceof Error ? error.message : fallback,
        })
      }

      const syncTask = (task: () => Promise<void>, fallback: string) => {
        task()
          .then(() => set({ syncError: null }))
          .catch((error) => handleSyncError(error, fallback))
      }

      const resetState = () => ({
        accounts: createDefaultAccounts(),
        transactions: [],
        transfers: [],
        budgets: [],
        goals: [],
        recurring: [],
        profile: defaultProfile(),
        settings: defaultSettings(),
        initialized: true,
        supabaseLoaded: true,
        syncError: null,
      })

      return {
        accounts: createDefaultAccounts(),
        transactions: [],
        transfers: [],
        budgets: [],
        goals: [],
        recurring: [],
        profile: defaultProfile(),
        settings: defaultSettings(),
        initialized: false,
        supabaseLoaded: false,
        syncError: null,

        addTransaction: (t) => {
          const newTx: Transaction = { ...t, id: generateId(), createdAt: new Date().toISOString() }
          set((s) => ({ transactions: [newTx, ...s.transactions] }))
          syncTask(() => dbUpsertTransaction(newTx), 'Не удалось сохранить транзакцию в облаке.')
        },

        updateTransaction: (id, updates) => {
          set((s) => ({
            transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
          }))
          const updated = get().transactions.find((t) => t.id === id)
          if (updated) syncTask(() => dbUpsertTransaction(updated), 'Не удалось обновить транзакцию в облаке.')
        },

        deleteTransaction: (id) => {
          set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
          syncTask(() => dbDeleteTransaction(id), 'Не удалось удалить транзакцию из облака.')
        },

        addTransfer: (t) => {
          const newTransfer: Transfer = { ...t, id: generateId(), createdAt: new Date().toISOString() }
          set((s) => ({ transfers: [newTransfer, ...s.transfers] }))
          syncTask(() => dbUpsertTransfer(newTransfer), 'Не удалось сохранить перевод в облаке.')
        },

        deleteTransfer: (id) => {
          set((s) => ({ transfers: s.transfers.filter((t) => t.id !== id) }))
          syncTask(() => dbDeleteTransfer(id), 'Не удалось удалить перевод из облака.')
        },

        addBudget: (b) => {
          const newBudget: Budget = { ...b, id: generateId(), createdAt: new Date().toISOString() }
          set((s) => ({ budgets: [...s.budgets, newBudget] }))
          syncTask(() => dbUpsertBudget(newBudget), 'Не удалось сохранить бюджет в облаке.')
        },

        updateBudget: (id, updates) => {
          set((s) => ({ budgets: s.budgets.map((b) => b.id === id ? { ...b, ...updates } : b) }))
          const updated = get().budgets.find((b) => b.id === id)
          if (updated) syncTask(() => dbUpsertBudget(updated), 'Не удалось обновить бюджет в облаке.')
        },

        deleteBudget: (id) => {
          set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }))
          syncTask(() => dbDeleteBudget(id), 'Не удалось удалить бюджет из облака.')
        },

        addGoal: (g) => {
          const newGoal: Goal = { ...g, id: generateId(), createdAt: new Date().toISOString() }
          set((s) => ({ goals: [...s.goals, newGoal] }))
          syncTask(() => dbUpsertGoal(newGoal), 'Не удалось сохранить цель в облаке.')
        },

        updateGoal: (id, updates) => {
          set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g) }))
          const updated = get().goals.find((g) => g.id === id)
          if (updated) syncTask(() => dbUpsertGoal(updated), 'Не удалось обновить цель в облаке.')
        },

        deleteGoal: (id) => {
          set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
          syncTask(() => dbDeleteGoal(id), 'Не удалось удалить цель из облака.')
        },

        addAccount: (a) => {
          const newAccount: Account = { ...a, archived: a.archived ?? false, id: generateId(), createdAt: new Date().toISOString() }
          set((s) => ({ accounts: [...s.accounts, newAccount] }))
          syncTask(() => dbUpsertAccount(newAccount), 'Не удалось сохранить счёт в облаке.')
        },

        updateAccount: (id, updates) => {
          set((s) => ({
            accounts: s.accounts.map((a) => a.id === id ? { ...a, ...updates } : a),
          }))
          const updated = get().accounts.find((a) => a.id === id)
          if (updated) syncTask(() => dbUpsertAccount(updated), 'Не удалось обновить счёт в облаке.')
        },

        deleteAccount: (id) => {
          const { accounts } = get()
          if (accounts.length <= 1) return

          const fallbackId = accounts.find((a) => a.id !== id)?.id ?? getDefaultAccountId()

          set((s) => {
            if (s.accounts.length <= 1) return s
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

          syncTask(async () => {
            await dbReplaceAccountReferences(id, fallbackId)
            await dbDeleteAccount(id)
          }, 'Не удалось корректно удалить счёт в облаке.')
        },

        addRecurring: (r) => {
          const newRec: RecurringTransaction = { ...r, id: generateId(), lastApplied: null, createdAt: new Date().toISOString() }
          set((s) => ({ recurring: [...s.recurring, newRec] }))
          syncTask(() => dbUpsertRecurring(newRec), 'Не удалось сохранить автоплатёж в облаке.')
        },

        updateRecurring: (id, updates) => {
          set((s) => ({ recurring: s.recurring.map((r) => r.id === id ? { ...r, ...updates } : r) }))
          const updated = get().recurring.find((r) => r.id === id)
          if (updated) syncTask(() => dbUpsertRecurring(updated), 'Не удалось обновить автоплатёж в облаке.')
        },

        deleteRecurring: (id) => {
          set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) }))
          syncTask(() => dbDeleteRecurring(id), 'Не удалось удалить автоплатёж из облака.')
        },

        applyRecurring: () => {
          const { recurring, transactions } = get()
          const today = new Date()
          const todayKey = getDayKey(today)
          const newTx: Transaction[] = []

          const updatedRecurring = recurring.map((rec) => {
            if (!shouldApply(rec, today)) return rec
            const tx: Transaction = {
              id: generateId(),
              type: rec.type,
              amount: rec.amount,
              category: rec.category,
              accountId: rec.accountId,
              date: todayKey,
              description: `${rec.description} (авто)`,
              tags: rec.tags,
              createdAt: new Date().toISOString(),
            }
            newTx.push(tx)
            return { ...rec, lastApplied: todayKey }
          })

          if (newTx.length > 0) {
            set({ transactions: [...newTx, ...transactions], recurring: updatedRecurring })
            syncTask(async () => {
              await Promise.all([
                ...newTx.map((tx) => dbUpsertTransaction(tx)),
                ...updatedRecurring
                  .filter((rec, index) => rec !== recurring[index])
                  .map((rec) => dbUpsertRecurring(rec)),
              ])
            }, 'Не удалось синхронизировать автоплатежи.')
          }
        },

        updateSettings: (s) => {
          set((state) => ({ settings: { ...state.settings, ...s } }))
          const { settings, profile } = get()
          syncTask(() => dbUpsertSettings(settings, profile), 'Не удалось сохранить настройки в облаке.')
        },

        updateProfile: (p) => {
          set((state) => ({ profile: { ...state.profile, ...p } }))
          const { settings, profile } = get()
          syncTask(() => dbUpsertSettings(settings, profile), 'Не удалось сохранить профиль в облаке.')
        },

        resetAllData: () => {
          set(resetState())
        },

        clearAllData: async () => {
          try {
            await dbClearAllUserData()
            set(resetState())
            return true
          } catch (error) {
            handleSyncError(error, 'Не удалось очистить данные в облаке.')
            return false
          }
        },

        loadFromSupabase: async () => {
          try {
            const data = await dbLoadAll()
            if (!data) {
              set({ supabaseLoaded: true, syncError: null })
              return
            }

            // Первый запуск: если в облаке нет счетов, сохраняем локальные дефолты.
            if (data.accounts.length === 0) {
              const defaults = get().accounts.length > 0 ? get().accounts : createDefaultAccounts()
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
              syncError: null,
            })
          } catch (error) {
            handleSyncError(error, 'Не удалось загрузить данные из облака.')
            set({ supabaseLoaded: true })
          }
        },

        bootstrap: () => {
          const { initialized } = get()
          if (!initialized) set({ initialized: true })
          get().loadFromSupabase()
        },
      }
    },
    {
      name: 'dds-tracker-store',
      version: 5,
      migrate: (persistedState: any) => {
        const baseAccounts: Account[] = Array.isArray(persistedState?.accounts) && persistedState.accounts.length > 0
          ? persistedState.accounts.map((a: any) => ({ ...a, archived: a.archived ?? false }))
          : createDefaultAccounts()
        const baseTransactions: Transaction[] = Array.isArray(persistedState?.transactions) ? persistedState.transactions : []
        const baseTransfers: Transfer[] = Array.isArray(persistedState?.transfers) ? persistedState.transfers : []
        const baseRecurring: RecurringTransaction[] = Array.isArray(persistedState?.recurring) ? persistedState.recurring : []
        const { accounts, transactions, transfers, recurring } = remapLegacyDefaultAccountIds(
          baseAccounts,
          baseTransactions,
          baseTransfers,
          baseRecurring,
        )
        const fallbackId = accounts[0]?.id ?? getDefaultAccountId()
        return {
          ...persistedState,
          accounts,
          supabaseLoaded: false,
          syncError: null,
          transfers,
          transactions: transactions.map((tx: any) => ({ ...tx, accountId: tx.accountId || fallbackId })),
          recurring: recurring.map((rec: any) => ({ ...rec, accountId: rec.accountId || fallbackId })),
          profile: {
            fullName: persistedState?.profile?.fullName ?? '',
            email: persistedState?.profile?.email ?? '',
            phone: persistedState?.profile?.phone ?? '',
            city: persistedState?.profile?.city ?? '',
          },
          settings: {
            currency: persistedState?.settings?.currency ?? 'RUB',
            theme: persistedState?.settings?.theme ?? 'light',
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
