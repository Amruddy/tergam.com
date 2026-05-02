import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CurrencyCode } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_FORMATS: Record<CurrencyCode, { locale: string; currency: string }> = {
  RUB: { locale: 'ru-RU', currency: 'RUB' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'RUB'): string {
  const { locale, currency: curr } = CURRENCY_FORMATS[currency]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function sanitizeMoneyInput(value: string, options: { allowNegative?: boolean } = {}): string {
  const allowNegative = options.allowNegative ?? false
  let result = ''
  let hasSeparator = false
  let hasMinus = false

  for (const char of value.replace(/\s/g, '').replace(',', '.')) {
    if (char >= '0' && char <= '9') {
      result += char
      continue
    }

    if (char === '.' && !hasSeparator) {
      result += char
      hasSeparator = true
      continue
    }

    if (char === '-' && allowNegative && !hasMinus && result.length === 0) {
      result += char
      hasMinus = true
    }
  }

  return result
}

export function parseMoneyInput(value: string): number {
  const parsed = Number(sanitizeMoneyInput(value, { allowNegative: true }))
  return Number.isFinite(parsed) ? parsed : 0
}

export function parsePositiveMoneyInput(value: string): number | null {
  const parsed = parseMoneyInput(value)
  return parsed > 0 ? parsed : null
}

export function parseNonNegativeMoneyInput(value: string): number | null {
  const parsed = parseMoneyInput(value)
  return parsed >= 0 ? parsed : null
}

export function formatMoneyInput(value: string): string {
  const sanitized = sanitizeMoneyInput(value, { allowNegative: value.startsWith('-') })
  const negative = sanitized.startsWith('-')
  const unsigned = negative ? sanitized.slice(1) : sanitized
  const [integerPart, decimalPart] = unsigned.split('.')
  const formattedInteger = integerPart ? Number(integerPart).toLocaleString('ru-RU') : ''
  const formatted = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger
  return negative ? `-${formatted}` : formatted
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', { month: 'short', year: '2-digit' }).format(date)
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
