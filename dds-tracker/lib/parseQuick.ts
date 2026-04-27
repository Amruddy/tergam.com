import { TransactionType } from '@/types'
import { getCategoriesByType } from '@/lib/categories'

interface ParsedQuick {
  amount: number | null
  type: TransactionType
  category: string
  description: string
}

// keyword → category id
const CATEGORY_KEYWORDS: [string[], string, TransactionType | 'both'][] = [
  [['еда', 'кофе', 'ресторан', 'кафе', 'продукты', 'обед', 'ужин', 'завтрак', 'пицца', 'суши', 'бургер'], 'food', 'expense'],
  [['такси', 'метро', 'автобус', 'транспорт', 'бензин', 'парковка', 'убер', 'яндекс'], 'transport', 'expense'],
  [['аптека', 'врач', 'здоровье', 'больница', 'стоматолог', 'медицина'], 'health', 'expense'],
  [['кино', 'игры', 'развлечения', 'концерт', 'театр', 'клуб', 'бар', 'досуг'], 'entertainment', 'expense'],
  [['одежда', 'обувь', 'магазин', 'шопинг'], 'clothes', 'expense'],
  [['аренда', 'коммунальные', 'квартира', 'жкх', 'свет', 'газ', 'вода', 'интернет'], 'utilities', 'expense'],
  [['зарплата', 'зп', 'оклад', 'работа'], 'salary', 'income'],
  [['фриланс', 'проект', 'заказ', 'подработка'], 'freelance', 'income'],
  [['дивиденды', 'акции', 'инвестиции', 'биржа'], 'investments', 'both'],
]

function normalizeMoneyText(value: string): string {
  const compact = value.replace(/\s/g, '').replace(',', '.')

  if (!compact.includes('.')) return compact

  const parts = compact.split('.')
  const looksLikeThousands = parts.length > 1 && parts.slice(1).every((part) => part.length === 3)
  if (looksLikeThousands) return parts.join('')

  return compact
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\wа-яА-Я\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTrailingType(value: string): { text: string; type: TransactionType | null } {
  const normalized = normalizePhrase(value)
  const incomeMatch = normalized.match(/\b(доход|доходы|приход|поступление)\s*$/)
  if (incomeMatch) {
    return {
      text: value.replace(new RegExp(`${incomeMatch[1]}\\s*$`, 'i'), '').trim(),
      type: 'income',
    }
  }

  const expenseMatch = normalized.match(/\b(расход|расходы|трата|покупка)\s*$/)
  if (expenseMatch) {
    return {
      text: value.replace(new RegExp(`${expenseMatch[1]}\\s*$`, 'i'), '').trim(),
      type: 'expense',
    }
  }

  return { text: value, type: null }
}

export function parseQuickInput(raw: string): ParsedQuick {
  const text = raw.trim().toLowerCase()

  // detect explicit type sign
  let type: TransactionType = 'expense'
  let explicitType: TransactionType | null = null
  let cleaned = text
  if (text.startsWith('+')) { type = 'income'; explicitType = 'income'; cleaned = text.slice(1).trim() }
  else if (text.startsWith('-')) { type = 'expense'; explicitType = 'expense'; cleaned = text.slice(1).trim() }

  const trailingType = parseTrailingType(cleaned)
  if (trailingType.type) {
    type = trailingType.type
    explicitType = trailingType.type
    cleaned = trailingType.text
  }

  // extract number
  const numMatch = cleaned.match(/\d[\d\s.,]*/)
  let amount: number | null = null
  let description = cleaned
  if (numMatch) {
    const numStr = normalizeMoneyText(numMatch[0])
    amount = Number(numStr)
    if (isNaN(amount)) amount = null
    description = cleaned.replace(numMatch[0], '').trim()
  }

  // detect category from keywords
  let category = 'other'
  const normalizedCleaned = normalizePhrase(cleaned)

  for (const cat of getCategoriesByType(type)) {
    const normalizedName = normalizePhrase(cat.name)
    if (normalizedName && normalizedCleaned.includes(normalizedName)) {
      category = cat.id
      if (!explicitType && cat.type !== 'both') type = cat.type
      break
    }
  }

  for (const [keywords, catId, catType] of CATEGORY_KEYWORDS) {
    if (category !== 'other') break
    if (explicitType && catType !== 'both' && catType !== explicitType) continue
    if (keywords.some((kw) => normalizedCleaned.includes(normalizePhrase(kw)))) {
      category = catId
      if (!explicitType && catType !== 'both') type = catType as TransactionType
      break
    }
  }

  return {
    amount,
    type,
    category,
    description: description || raw.trim(),
  }
}
