import { supabase } from './supabase'
import { Account, Transaction, Transfer, Budget, Goal, RecurringTransaction, Settings, UserProfile } from '@/types'

// ── Row → TS ──────────────────────────────────────────────────────────────────

const toAccount = (r: any): Account => ({
  id: r.id, name: r.name, emoji: r.emoji, color: r.color, type: r.type,
  initialBalance: Number(r.initial_balance), archived: r.archived, createdAt: r.created_at,
})

const toTransaction = (r: any): Transaction => ({
  id: r.id, type: r.type, amount: Number(r.amount), category: r.category,
  accountId: r.account_id, date: r.date, description: r.description,
  tags: r.tags || [], createdAt: r.created_at,
})

const toTransfer = (r: any): Transfer => ({
  id: r.id, fromAccountId: r.from_account_id, toAccountId: r.to_account_id,
  amount: Number(r.amount), date: r.date, description: r.description, createdAt: r.created_at,
})

const toBudget = (r: any): Budget => ({
  id: r.id, category: r.category, amount: Number(r.amount), period: r.period, createdAt: r.created_at,
})

const toGoal = (r: any): Goal => ({
  id: r.id, name: r.name, emoji: r.emoji, targetAmount: Number(r.target_amount),
  savedAmount: Number(r.saved_amount), deadline: r.deadline, color: r.color, createdAt: r.created_at,
})

const toRecurring = (r: any): RecurringTransaction => ({
  id: r.id, type: r.type, amount: Number(r.amount), category: r.category,
  accountId: r.account_id, description: r.description, tags: r.tags || [],
  frequency: r.frequency, startDate: r.start_date, lastApplied: r.last_applied,
  active: r.active, createdAt: r.created_at,
})

// ── TS → Row ──────────────────────────────────────────────────────────────────

const fromAccount = (a: Account) => ({
  id: a.id, name: a.name, emoji: a.emoji, color: a.color, type: a.type,
  initial_balance: a.initialBalance, archived: a.archived, created_at: a.createdAt,
})

const fromTransaction = (t: Transaction) => ({
  id: t.id, type: t.type, amount: t.amount, category: t.category,
  account_id: t.accountId, date: t.date, description: t.description,
  tags: t.tags, created_at: t.createdAt,
})

const fromTransfer = (t: Transfer) => ({
  id: t.id, from_account_id: t.fromAccountId, to_account_id: t.toAccountId,
  amount: t.amount, date: t.date, description: t.description, created_at: t.createdAt,
})

const fromBudget = (b: Budget) => ({
  id: b.id, category: b.category, amount: b.amount, period: b.period, created_at: b.createdAt,
})

const fromGoal = (g: Goal) => ({
  id: g.id, name: g.name, emoji: g.emoji, target_amount: g.targetAmount,
  saved_amount: g.savedAmount, deadline: g.deadline, color: g.color, created_at: g.createdAt,
})

const fromRecurring = (r: RecurringTransaction) => ({
  id: r.id, type: r.type, amount: r.amount, category: r.category,
  account_id: r.accountId, description: r.description, tags: r.tags,
  frequency: r.frequency, start_date: r.startDate, last_applied: r.lastApplied,
  active: r.active, created_at: r.createdAt,
})

// ── Load all ──────────────────────────────────────────────────────────────────

export async function dbLoadAll() {
  const [
    { data: accountsData },
    { data: transactionsData },
    { data: transfersData },
    { data: budgetsData },
    { data: goalsData },
    { data: recurringData },
    { data: settingsData },
  ] = await Promise.all([
    supabase.from('accounts').select('*').order('created_at'),
    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    supabase.from('transfers').select('*').order('created_at', { ascending: false }),
    supabase.from('budgets').select('*').order('created_at'),
    supabase.from('goals').select('*').order('created_at'),
    supabase.from('recurring').select('*').order('created_at'),
    supabase.from('settings').select('*').eq('id', 1).single(),
  ])

  return {
    accounts: (accountsData || []).map(toAccount),
    transactions: (transactionsData || []).map(toTransaction),
    transfers: (transfersData || []).map(toTransfer),
    budgets: (budgetsData || []).map(toBudget),
    goals: (goalsData || []).map(toGoal),
    recurring: (recurringData || []).map(toRecurring),
    settings: settingsData ? { currency: settingsData.currency, theme: settingsData.theme } as Settings : null,
    profile: settingsData ? {
      fullName: settingsData.full_name, email: settingsData.email,
      phone: settingsData.phone, city: settingsData.city,
    } as UserProfile : null,
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const dbUpsertAccount = (a: Account) =>
  supabase.from('accounts').upsert(fromAccount(a))

export const dbDeleteAccount = (id: string) =>
  supabase.from('accounts').delete().eq('id', id)

export const dbUpsertTransaction = (t: Transaction) =>
  supabase.from('transactions').upsert(fromTransaction(t))

export const dbDeleteTransaction = (id: string) =>
  supabase.from('transactions').delete().eq('id', id)

export const dbUpsertTransfer = (t: Transfer) =>
  supabase.from('transfers').upsert(fromTransfer(t))

export const dbDeleteTransfer = (id: string) =>
  supabase.from('transfers').delete().eq('id', id)

export const dbUpsertBudget = (b: Budget) =>
  supabase.from('budgets').upsert(fromBudget(b))

export const dbDeleteBudget = (id: string) =>
  supabase.from('budgets').delete().eq('id', id)

export const dbUpsertGoal = (g: Goal) =>
  supabase.from('goals').upsert(fromGoal(g))

export const dbDeleteGoal = (id: string) =>
  supabase.from('goals').delete().eq('id', id)

export const dbUpsertRecurring = (r: RecurringTransaction) =>
  supabase.from('recurring').upsert(fromRecurring(r))

export const dbDeleteRecurring = (id: string) =>
  supabase.from('recurring').delete().eq('id', id)

export const dbUpsertSettings = (settings: Settings, profile: UserProfile) =>
  supabase.from('settings').upsert({
    id: 1,
    currency: settings.currency, theme: settings.theme,
    full_name: profile.fullName, email: profile.email,
    phone: profile.phone, city: profile.city,
  })
