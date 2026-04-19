import type { Account, Transaction, Transfer, Budget, Goal, RecurringTransaction, Settings } from '@/types'

const MAX_AMOUNT = 1_000_000_000
const MAX_NAME = 200
const MAX_DESCRIPTION = 1000
const MAX_CATEGORY = 100
const MAX_TAG_LENGTH = 50
const MAX_TAGS = 20

const VALID_TRANSACTION_TYPES = new Set(['income', 'expense'])
const VALID_ACCOUNT_TYPES = new Set(['cash', 'card', 'savings', 'debt'])
const VALID_FREQUENCIES = new Set(['daily', 'weekly', 'monthly'])
const VALID_CURRENCIES = new Set(['RUB', 'USD', 'EUR'])
const VALID_THEMES = new Set(['light', 'dark'])

function assertPositiveAmount(amount: unknown, field = 'Сумма') {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    throw new Error(`${field}: должна быть числом.`)
  }
  if (amount <= 0) throw new Error(`${field}: должна быть больше нуля.`)
  if (amount > MAX_AMOUNT) throw new Error(`${field}: превышает максимум ${MAX_AMOUNT.toLocaleString('ru')}.`)
}

function assertFiniteAmount(amount: unknown, field = 'Сумма') {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    throw new Error(`${field}: должна быть числом.`)
  }
  if (Math.abs(amount) > MAX_AMOUNT) throw new Error(`${field}: превышает максимум ${MAX_AMOUNT.toLocaleString('ru')}.`)
}

function assertNonEmptyString(value: unknown, field: string, maxLength = MAX_NAME) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field}: не может быть пустым.`)
  }
  if (value.length > maxLength) {
    throw new Error(`${field}: не может быть длиннее ${maxLength} символов.`)
  }
}

function assertValidDate(value: unknown, field = 'Дата') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value))) {
    throw new Error(`${field}: неверный формат даты.`)
  }
}

function assertTags(tags: unknown) {
  if (!Array.isArray(tags)) return
  if (tags.length > MAX_TAGS) throw new Error(`Теги: не более ${MAX_TAGS} штук.`)
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.length > MAX_TAG_LENGTH) {
      throw new Error(`Тег: не может быть длиннее ${MAX_TAG_LENGTH} символов.`)
    }
  }
}

function assertOptionalDescription(description: unknown) {
  if (typeof description === 'string' && description.length > MAX_DESCRIPTION) {
    throw new Error(`Описание: не может быть длиннее ${MAX_DESCRIPTION} символов.`)
  }
}

export function validateTransaction(t: Omit<Transaction, 'id' | 'createdAt'> | Transaction) {
  if (!VALID_TRANSACTION_TYPES.has(t.type)) throw new Error('Тип транзакции: недопустимое значение.')
  assertPositiveAmount(t.amount)
  assertNonEmptyString(t.category, 'Категория', MAX_CATEGORY)
  assertNonEmptyString(t.accountId, 'Счёт')
  assertValidDate(t.date)
  assertOptionalDescription(t.description)
  assertTags(t.tags)
}

export function validateTransfer(t: Omit<Transfer, 'id' | 'createdAt'> | Transfer) {
  assertNonEmptyString(t.fromAccountId, 'Счёт-источник')
  assertNonEmptyString(t.toAccountId, 'Счёт-получатель')
  if (t.fromAccountId === t.toAccountId) {
    throw new Error('Перевод: счёт-источник и счёт-получатель должны быть разными.')
  }
  assertPositiveAmount(t.amount)
  assertValidDate(t.date)
  assertOptionalDescription(t.description)
}

export function validateBudget(b: Omit<Budget, 'id' | 'createdAt'> | Budget) {
  assertNonEmptyString(b.category, 'Категория', MAX_CATEGORY)
  assertPositiveAmount(b.amount, 'Лимит бюджета')
}

export function validateGoal(g: Omit<Goal, 'id' | 'createdAt'> | Goal) {
  assertNonEmptyString(g.name, 'Название цели')
  assertPositiveAmount(g.targetAmount, 'Целевая сумма')
  if (typeof g.savedAmount !== 'number' || !isFinite(g.savedAmount) || g.savedAmount < 0) {
    throw new Error('Накопленная сумма: должна быть неотрицательным числом.')
  }
  if (g.savedAmount > MAX_AMOUNT) {
    throw new Error(`Накопленная сумма: превышает максимум ${MAX_AMOUNT.toLocaleString('ru')}.`)
  }
}

export function validateAccount(a: Omit<Account, 'id' | 'createdAt'> | Account) {
  assertNonEmptyString(a.name, 'Название счёта')
  if (!VALID_ACCOUNT_TYPES.has(a.type)) throw new Error('Тип счёта: недопустимое значение.')
  assertFiniteAmount(a.initialBalance, 'Начальный баланс')
}

export function validateRecurring(r: Omit<RecurringTransaction, 'id' | 'createdAt' | 'lastApplied'> | RecurringTransaction) {
  if (!VALID_TRANSACTION_TYPES.has(r.type)) throw new Error('Тип транзакции: недопустимое значение.')
  assertPositiveAmount(r.amount)
  assertNonEmptyString(r.category, 'Категория', MAX_CATEGORY)
  assertNonEmptyString(r.accountId, 'Счёт')
  if (!VALID_FREQUENCIES.has(r.frequency)) throw new Error('Частота: недопустимое значение.')
  assertOptionalDescription(r.description)
  assertTags(r.tags)
}

export function validateSettings(s: Partial<Settings>) {
  if (s.currency !== undefined && !VALID_CURRENCIES.has(s.currency)) {
    throw new Error('Валюта: недопустимое значение.')
  }
  if (s.theme !== undefined && !VALID_THEMES.has(s.theme)) {
    throw new Error('Тема: недопустимое значение.')
  }
}
