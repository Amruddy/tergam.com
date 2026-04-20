import {
  ArrowLeftRight,
  BarChart3,
  Home,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  RefreshCw,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  mobileLabel: string
  icon: LucideIcon
  color: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Главная', mobileLabel: 'Главная', icon: Home, color: '#22c55e' },
  { href: '/dashboard', label: 'Дашборд', mobileLabel: 'Обзор', icon: LayoutDashboard, color: '#3b82f6' },
  { href: '/transactions', label: 'Записи', mobileLabel: 'Записи', icon: ArrowLeftRight, color: '#06b6d4' },
  { href: '/accounts', label: 'Счета', mobileLabel: 'Счета', icon: Landmark, color: '#f59e0b' },
  { href: '/budgets', label: 'Бюджеты', mobileLabel: 'Лимиты', icon: PiggyBank, color: '#ef4444' },
  { href: '/goals', label: 'Цели', mobileLabel: 'Цели', icon: Trophy, color: '#eab308' },
  { href: '/recurring', label: 'Автоплатежи', mobileLabel: 'Авто', icon: RefreshCw, color: '#8b5cf6' },
  { href: '/analytics', label: 'Аналитика', mobileLabel: 'Отчеты', icon: BarChart3, color: '#6366f1' },
]

export const MOBILE_PRIMARY_NAV_ITEMS = NAV_ITEMS.slice(0, 4)
export const MOBILE_SECONDARY_NAV_ITEMS = NAV_ITEMS.slice(4)
