import { TransactionType } from '@/types'

interface ParsedQuick {
  amount: number | null
  type: TransactionType
  category: string
  description: string
}

const CATEGORY_KEYWORDS: [string[], string, TransactionType | 'both'][] = [
  [['еда', 'кофе', 'ресторан', 'кафе', 'продукты', 'обед', 'ужин', 'завтрак', 'пицца', 'суши', 'бургер'], 'food', 'expense'],
  [['такси', 'метро', 'автобус', 'транспорт', 'бензин', 'парковка', 'убер', 'яндекс'], 'transport', 'expense'],
  [['аптека', 'врач', 'здоровье', 'больница', 'стоматолог', 'медицина'], 'health', 'expense'],
  [['кино', 'игры', 'развлечения', 'концерт', 'театр', 'клуб', 'бар', 'досуг'], 'entertainment', 'expense'],
  [['одежда', 'обувь', 'магазин', 'шопинг'], 'clothes', 'expense'],
  [['аренда', 'квартира', 'съем', 'съём', 'жилье', 'жильё'], 'rent', 'expense'],
  [['коммунальные', 'жкх', 'свет', 'газ', 'вода', 'интернет'], 'utilities', 'expense'],
  [['зарплата', 'зп', 'оклад', 'работа'], 'salary', 'income'],
  [['фриланс', 'проект', 'заказ', 'подработка'], 'freelance', 'income'],
  [['дивиденды', 'акции', 'инвестиции', 'биржа'], 'investments', 'both'],
]

const INCOME_HINTS = ['получил', 'получила', 'пришло', 'заработал', 'заработала', 'доход', 'поступление', 'плюс']
const EXPENSE_HINTS = ['потратил', 'потратила', 'купил', 'купила', 'оплатил', 'оплатила', 'расход', 'минус']

function detectType(text: string): TransactionType {
  if (text.startsWith('+')) return 'income'
  if (text.startsWith('-')) return 'expense'
  if (INCOME_HINTS.some((hint) => text.includes(hint))) return 'income'
  if (EXPENSE_HINTS.some((hint) => text.includes(hint))) return 'expense'
  return 'expense'
}

function normalizeNumberString(value: string): string {
  const compact = value.replace(/\s/g, '')

  // Treat dots between 3-digit groups as thousand separators: 50.000 -> 50000
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) {
    return compact.replace(/\./g, '')
  }

  // Treat commas between 3-digit groups as thousand separators: 50,000 -> 50000
  if (/^\d{1,3}(,\d{3})+$/.test(compact)) {
    return compact.replace(/,/g, '')
  }

  return compact.replace(',', '.')
}

export function parseQuickInput(raw: string): ParsedQuick {
  const original = raw.trim()
  const text = original.toLowerCase()
  let type = detectType(text)
  const cleaned = text.replace(/^[+-]\s*/, '').trim()

  const numMatch = cleaned.match(/[\d\s]+([.,]\d+)?/)
  let amount: number | null = null
  let description = cleaned

  if (numMatch) {
    const numStr = normalizeNumberString(numMatch[0])
    amount = parseFloat(numStr)
    if (Number.isNaN(amount)) amount = null
    description = cleaned.replace(numMatch[0], '').trim()
  }

  let category = 'other'
  for (const [keywords, catId, catType] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => cleaned.includes(kw))) {
      category = catId
      if (catType !== 'both') type = catType
      break
    }
  }

  return {
    amount,
    type,
    category,
    description: description || original,
  }
}
