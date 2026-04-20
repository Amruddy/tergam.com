import { Category } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Еда', emoji: '🍕', color: '#f97316', type: 'expense' },
  { id: 'rent', name: 'Аренда', emoji: '🏠', color: '#f59e0b', type: 'expense' },
  { id: 'transport', name: 'Транспорт', emoji: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'health', name: 'Здоровье', emoji: '💊', color: '#ec4899', type: 'expense' },
  { id: 'entertainment', name: 'Развлечения', emoji: '🎮', color: '#8b5cf6', type: 'expense' },
  { id: 'clothes', name: 'Одежда', emoji: '👕', color: '#06b6d4', type: 'expense' },
  { id: 'utilities', name: 'ЖКУ', emoji: '🏘️', color: '#84cc16', type: 'expense' },
  { id: 'cafes', name: 'Кафе', emoji: '☕', color: '#c084fc', type: 'expense' },
  { id: 'subscriptions', name: 'Подписки', emoji: '📱', color: '#6366f1', type: 'expense' },
  { id: 'beauty', name: 'Красота', emoji: '💄', color: '#f43f5e', type: 'expense' },
  { id: 'travel', name: 'Путешествия', emoji: '✈️', color: '#0ea5e9', type: 'expense' },
  { id: 'education', name: 'Обучение', emoji: '📚', color: '#14b8a6', type: 'expense' },
  { id: 'gifts', name: 'Подарки', emoji: '🎁', color: '#ef4444', type: 'expense' },
  { id: 'salary', name: 'Зарплата', emoji: '💼', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Фриланс', emoji: '💻', color: '#6366f1', type: 'income' },
  { id: 'sales', name: 'Продажи', emoji: '🛍️', color: '#10b981', type: 'income' },
  { id: 'cashback', name: 'Кэшбек', emoji: '💸', color: '#f59e0b', type: 'income' },
  { id: 'bonus', name: 'Бонусы', emoji: '🎉', color: '#22c55e', type: 'income' },
  { id: 'transfers', name: 'Переводы', emoji: '💰', color: '#16a34a', type: 'income' },
  { id: 'investments', name: 'Инвестиции', emoji: '📈', color: '#f59e0b', type: 'both' },
  { id: 'other', name: 'Прочее', emoji: '✨', color: '#94a3b8', type: 'both' },
]

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense' || c.type === 'both')
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income' || c.type === 'both')
