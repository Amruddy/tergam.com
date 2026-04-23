import { useTransactionStore } from '@/store/useTransactionStore'
import { Category, TransactionType } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Еда', emoji: '🍕', color: '#f97316', type: 'expense' },
  { id: 'transport', name: 'Транспорт', emoji: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'health', name: 'Здоровье', emoji: '💊', color: '#ec4899', type: 'expense' },
  { id: 'entertainment', name: 'Развлечения', emoji: '🎮', color: '#8b5cf6', type: 'expense' },
  { id: 'clothes', name: 'Одежда', emoji: '👕', color: '#06b6d4', type: 'expense' },
  { id: 'utilities', name: 'Коммунальные', emoji: '🏠', color: '#84cc16', type: 'expense' },
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

export const getAllCategories = (): Category[] => {
  const { customCategories = [] } = useTransactionStore.getState()
  return [...CATEGORIES, ...customCategories]
}

export const getCategoriesByType = (type?: TransactionType | 'all'): Category[] => {
  const categories = getAllCategories()
  if (!type || type === 'all') return categories
  return categories.filter((category) => category.type === type || category.type === 'both')
}

export const getCategoryById = (id: string): Category =>
  getAllCategories().find((category) => category.id === id) ?? CATEGORIES[CATEGORIES.length - 1]

export const EXPENSE_CATEGORIES = () => getCategoriesByType('expense')
export const INCOME_CATEGORIES = () => getCategoriesByType('income')
