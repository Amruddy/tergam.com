import { TransactionType } from '@/types'

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

export function parseQuickInput(raw: string): ParsedQuick {
  const text = raw.trim().toLowerCase()

  // detect explicit type sign
  let type: TransactionType = 'expense'
  let cleaned = text
  if (text.startsWith('+')) { type = 'income'; cleaned = text.slice(1).trim() }
  else if (text.startsWith('-')) { type = 'expense'; cleaned = text.slice(1).trim() }

  // extract number
  const numMatch = cleaned.match(/[\d\s]+([.,]\d+)?/)
  let amount: number | null = null
  let description = cleaned
  if (numMatch) {
    const numStr = numMatch[0].replace(/\s/g, '').replace(',', '.')
    amount = parseFloat(numStr)
    if (isNaN(amount)) amount = null
    description = cleaned.replace(numMatch[0], '').trim()
  }

  // detect category from keywords
  let category = 'other'
  for (const [keywords, catId, catType] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => cleaned.includes(kw))) {
      category = catId
      if (catType !== 'both') type = catType as TransactionType
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
