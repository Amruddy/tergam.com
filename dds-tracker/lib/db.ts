import { getSupabase } from './supabase'
import { Account, Transaction, Transfer, Budget, Goal, RecurringTransaction, Settings, UserProfile } from '@/types'

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return fallback
}

function createDbError(scope: string, error: unknown) {
  return new Error(`${scope}: ${toErrorMessage(error, 'Unknown Supabase error')}`)
}

async function unwrapQuery<T>(scope: string, query: PromiseLike<{ data: T; error: unknown }>) {
  const { data, error } = await query
  if (error) throw createDbError(scope, error)
  return data
}

async function ensureMutation(scope: string, query: PromiseLike<{ error: unknown }>) {
  const { error } = await query
  if (error) throw createDbError(scope, error)
}

function isDuplicateConstraintError(error: unknown, constraint?: string) {
  if (!error || typeof error !== 'object') return false

  const details = error as { code?: unknown; message?: unknown; details?: unknown }
  const code = typeof details.code === 'string' ? details.code : ''
  const message = typeof details.message === 'string' ? details.message : ''
  const extra = typeof details.details === 'string' ? details.details : ''
  const haystack = `${message} ${extra}`

  if (code === '23505') {
    return constraint ? haystack.includes(constraint) : true
  }

  return constraint ? haystack.includes(constraint) : haystack.includes('duplicate key value violates unique constraint')
}

function generateFallbackIntegerId() {
  return Math.floor(Math.random() * 2_000_000_000) + 1
}

function createSettingsInsertError(error: unknown) {
  if (isDuplicateConstraintError(error, 'settings_pkey')) {
    return new Error(
      'Insert settings: duplicate key on settings_pkey. Most likely public.settings.id uses an out-of-sync integer sequence in Supabase. Fix the sequence in SQL and retry.'
    )
  }

  return createDbError('Insert settings', error)
}

async function getUserId() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw createDbError('Supabase auth', error)
  }
  return data.user?.id ?? null
}

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
  const userId = await getUserId()
  if (!userId) return null
  const supabase = getSupabase()

  const [accountsData, transactionsData, transfersData, budgetsData, goalsData, recurringData, settingsData] = await Promise.all([
    unwrapQuery('Load accounts', supabase.from('accounts').select('*').eq('user_id', userId).order('created_at')),
    unwrapQuery('Load transactions', supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
    unwrapQuery('Load transfers', supabase.from('transfers').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
    unwrapQuery('Load budgets', supabase.from('budgets').select('*').eq('user_id', userId).order('created_at')),
    unwrapQuery('Load goals', supabase.from('goals').select('*').eq('user_id', userId).order('created_at')),
    unwrapQuery('Load recurring', supabase.from('recurring').select('*').eq('user_id', userId).order('created_at')),
    unwrapQuery<any | null>('Load settings', supabase.from('settings').select('*').eq('user_id', userId).maybeSingle()),
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

export const dbUpsertAccount = async (a: Account) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert account', supabase.from('accounts').upsert({ ...fromAccount(a), user_id: userId }))
}

export const dbDeleteAccount = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete account', supabase.from('accounts').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertTransaction = async (t: Transaction) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert transaction', supabase.from('transactions').upsert({ ...fromTransaction(t), user_id: userId }))
}

export const dbDeleteTransaction = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete transaction', supabase.from('transactions').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertTransfer = async (t: Transfer) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert transfer', supabase.from('transfers').upsert({ ...fromTransfer(t), user_id: userId }))
}

export const dbDeleteTransfer = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete transfer', supabase.from('transfers').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertBudget = async (b: Budget) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert budget', supabase.from('budgets').upsert({ ...fromBudget(b), user_id: userId }))
}

export const dbDeleteBudget = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete budget', supabase.from('budgets').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertGoal = async (g: Goal) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert goal', supabase.from('goals').upsert({ ...fromGoal(g), user_id: userId }))
}

export const dbDeleteGoal = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete goal', supabase.from('goals').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertRecurring = async (r: RecurringTransaction) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Upsert recurring', supabase.from('recurring').upsert({ ...fromRecurring(r), user_id: userId }))
}

export const dbDeleteRecurring = async (id: string) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()
  await ensureMutation('Delete recurring', supabase.from('recurring').delete().eq('id', id).eq('user_id', userId))
}

export const dbUpsertSettings = async (settings: Settings, profile: UserProfile) => {
  const userId = await getUserId()
  if (!userId) return
  const supabase = getSupabase()

  const payload = {
    user_id: userId,
    currency: settings.currency,
    theme: settings.theme,
    full_name: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
  }

  const loadExisting = () => supabase.from('settings').select('id, user_id').eq('user_id', userId).maybeSingle()
  const updateExisting = async (existing: { id?: string | null; user_id?: string | null }) => {
    const pkCol = existing.id ? 'id' : 'user_id'
    const pkVal = existing.id || userId
    await ensureMutation('Update settings', supabase.from('settings').update(payload).eq(pkCol, pkVal))
  }

  const { data: existing, error: existingError } = await loadExisting()
  if (existingError) throw createDbError('Load settings for upsert', existingError)

  if (existing) {
    await updateExisting(existing)
    return
  }

  const { error: insertError } = await supabase.from('settings').insert(payload)
  if (!insertError) return

  if (isDuplicateConstraintError(insertError, 'settings_user_id_idx')) {
    const { data: createdByRace, error: raceLoadError } = await loadExisting()
    if (raceLoadError) throw createDbError('Reload settings after duplicate user_id', raceLoadError)
    if (createdByRace) {
      await updateExisting(createdByRace)
      return
    }
  }

  if (isDuplicateConstraintError(insertError, 'settings_pkey')) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const payloadWithId = { id: generateFallbackIntegerId(), ...payload }
      const { error: retryError } = await supabase.from('settings').insert(payloadWithId)
      if (!retryError) return

      if (isDuplicateConstraintError(retryError, 'settings_user_id_idx')) {
        const { data: createdByRace, error: raceLoadError } = await loadExisting()
        if (raceLoadError) throw createDbError('Reload settings after duplicate primary key', raceLoadError)
        if (createdByRace) {
          await updateExisting(createdByRace)
          return
        }
      }

      if (!isDuplicateConstraintError(retryError, 'settings_pkey')) {
        throw createDbError('Insert settings', retryError)
      }
    }

    throw createSettingsInsertError(insertError)
  }

  throw createSettingsInsertError(insertError)
}

export const dbReplaceAccountReferences = async (fromAccountId: string, toAccountId: string) => {
  const userId = await getUserId()
  if (!userId || fromAccountId === toAccountId) return
  const supabase = getSupabase()

  await Promise.all([
    ensureMutation(
      'Reassign transaction accounts',
      supabase.from('transactions').update({ account_id: toAccountId }).eq('user_id', userId).eq('account_id', fromAccountId)
    ),
    ensureMutation(
      'Reassign recurring accounts',
      supabase.from('recurring').update({ account_id: toAccountId }).eq('user_id', userId).eq('account_id', fromAccountId)
    ),
    ensureMutation(
      'Reassign transfer source accounts',
      supabase.from('transfers').update({ from_account_id: toAccountId }).eq('user_id', userId).eq('from_account_id', fromAccountId)
    ),
    ensureMutation(
      'Reassign transfer destination accounts',
      supabase.from('transfers').update({ to_account_id: toAccountId }).eq('user_id', userId).eq('to_account_id', fromAccountId)
    ),
  ])
}

export const dbClearAllUserData = async () => {
  const userId = await getUserId()
  if (!userId) return false
  const supabase = getSupabase()

  await Promise.all([
    ensureMutation('Delete transactions', supabase.from('transactions').delete().eq('user_id', userId)),
    ensureMutation('Delete transfers', supabase.from('transfers').delete().eq('user_id', userId)),
    ensureMutation('Delete budgets', supabase.from('budgets').delete().eq('user_id', userId)),
    ensureMutation('Delete goals', supabase.from('goals').delete().eq('user_id', userId)),
    ensureMutation('Delete recurring', supabase.from('recurring').delete().eq('user_id', userId)),
    ensureMutation('Delete settings', supabase.from('settings').delete().eq('user_id', userId)),
    ensureMutation('Delete accounts', supabase.from('accounts').delete().eq('user_id', userId)),
  ])

  return true
}
