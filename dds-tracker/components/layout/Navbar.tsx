'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Home, LayoutDashboard, ArrowLeftRight, BarChart3, Landmark, Sun, Moon, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransactionStore } from '@/store/useTransactionStore'
import { Logo } from '@/components/Logo'
import { getSupabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

const UserProfileModal = dynamic(() => import('@/components/UserProfileModal').then((mod) => mod.UserProfileModal), {
  loading: () => <div className="h-[420px] rounded-2xl bg-white dark:bg-[#13131a]" />,
})

const NAV_ITEMS = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/transactions', label: 'Записи', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Счета', icon: Landmark },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const { bootstrap, profile, settings, updateSettings } = useTransactionStore()
  const theme = settings.theme
  const [showProfile, setShowProfile] = useState(false)
  const [authUser, setAuthUser] = useState<User | null>(null)

  useEffect(() => {
    bootstrap()
    const supabase = getSupabase()

    let active = true

    getAuthUser().then((user) => {
      if (!active) return
      setAuthUser(user)
    })

    if (!supabase) {
      return () => {
        active = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) bootstrap()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [bootstrap])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-[72px]">
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 md:hidden" />
      <div className="absolute inset-x-0 top-0 hidden h-full md:block">
        <div className="mx-auto h-full max-w-[1520px] px-8 xl:px-10">
          <div className="mt-3 h-[52px] rounded-2xl border border-slate-200/70 bg-white/78 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:backdrop-blur-none" />
        </div>
      </div>

      <div className="relative h-full max-w-[1520px] mx-auto px-4 md:px-8 xl:px-10 flex items-center gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0 md:pl-2">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center -ml-1">
            <Logo className="w-full h-full" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm md:text-[15px] tracking-tight hidden sm:block">Тергам</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-50/90 px-1.5 py-1 dark:border-slate-800 dark:bg-slate-900">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                  active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {active && <div className="absolute inset-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2 flex-shrink-0 md:pr-2">
          <div className="hidden lg:block text-right mr-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
              {profile.fullName || 'Профиль'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-gray-500 truncate max-w-[220px]">
              {authUser ? 'Аккаунт подключен' : 'Локальный пользователь'}
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 md:p-1 gap-0.5 md:border md:border-slate-200/70 dark:md:border-slate-700">
            {(['RUB', 'USD', 'EUR'] as const).map((cur) => (
              <button key={cur} onClick={() => updateSettings({ currency: cur })} className={cn('px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-semibold transition-all', settings.currency === cur ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300')}>
                {cur === 'RUB' ? '₽' : cur === 'USD' ? '$' : '€'}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 md:p-1 gap-0.5 md:border md:border-slate-200/70 dark:md:border-slate-700">
            <button onClick={() => updateSettings({ theme: 'light' })} title="Светлая тема" className={cn('w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all', theme === 'light' ? 'bg-white text-amber-500 shadow-sm border border-slate-200' : 'text-slate-400 dark:text-gray-500 hover:text-amber-400')}>
              <Sun size={13} />
            </button>
            <button onClick={() => updateSettings({ theme: 'dark' })} title="Тёмная тема" className={cn('w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all', theme === 'dark' ? 'bg-slate-800 text-indigo-400 border border-slate-700' : 'text-slate-400 dark:text-gray-500 hover:text-indigo-500')}>
              <Moon size={13} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowProfile(true)}
          title="Личный кабинет"
          className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 md:border md:border-slate-200/70 dark:md:border-slate-700 text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <UserRound size={13} />
        </button>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <UserProfileModal
              onClose={() => setShowProfile(false)}
              isAuthenticated={Boolean(authUser)}
              authEmail={authUser?.email ?? ''}
              onAuthSuccess={bootstrap}
            />
          </div>
        </div>
      )}
    </header>
  )
}
