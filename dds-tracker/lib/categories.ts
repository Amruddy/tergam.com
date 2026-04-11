import { Category } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Еда', emoji: '🍕', color: '#f97316', type: 'expense' },
  { id: 'transport', name: 'Транспорт', emoji: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'health', name: 'Здоровье', emoji: '💊', color: '#ec4899', type: 'expense' },
  { id: 'entertainment', name: 'Развлечения', emoji: '🎮', color: '#a855f7', type: 'expense' },
  { id: 'clothes', name: 'Одежда', emoji: '👕', color: '#06b6d4', type: 'expense' },
  { id: 'utilities', name: 'Коммунальные', emoji: '🏠', color: '#84cc16', type: 'expense' },
  { id: 'salary', name: 'Зарплата', emoji: '💼', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Фриланс', emoji: '💻', color: '#6366f1', type: 'income' },
  { id: 'investments', name: 'Инвестиции', emoji: '📈', color: '#f59e0b', type: 'both' },
  { id: 'other', name: 'Прочее', emoji: '✨', color: '#94a3b8', type: 'both' },
]

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense' || c.type === 'both')
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income' || c.type === 'both')
