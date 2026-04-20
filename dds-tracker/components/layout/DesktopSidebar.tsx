'use client'

import { MouseEvent, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { cn } from '@/lib/utils'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAuthUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

function forceNavigate(event: MouseEvent<HTMLElement>, href: string) {
  event.preventDefault()
  window.location.assign(href)
}

export function DesktopSidebar() {
  const pathname = usePathname()
  const { bootstrap, profile } = useTransactionStore()
  const [authUser, setAuthUser] = useState<User | null>(null)

  useEffect(() => {
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
    <aside className="hidden md:sticky md:top-4 md:z-20 md:flex md:h-[calc(100vh-2rem)] md:w-[88px] md:shrink-0 md:self-start md:flex-col md:rounded-2xl md:border md:border-slate-200/70 md:bg-white md:px-3 md:py-4 dark:md:border-white/8 dark:md:bg-[#13131a] lg:w-[220px]">
      <a
        href="/"
        title="Главная"
        aria-label="Главная"
        onClick={(event) => forceNavigate(event, '/')}
        className="mb-5 flex items-center justify-center transition-opacity hover:opacity-80 lg:justify-start"
      >
        <Logo className="h-11 w-11 shrink-0" />
        <div className="ml-3 hidden min-w-0 lg:block">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">DDS Tracker</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Личный бюджет</div>
        </div>
      </a>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href

          return (
            <a
              key={href}
              href={href}
              title={label}
              aria-label={label}
              onClick={(event) => forceNavigate(event, href)}
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className={cn(
                  'flex h-12 items-center justify-center rounded-2xl transition-all lg:w-full lg:justify-start lg:px-3',
                  active
                    ? 'shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]',
                )}
                style={{ background: active ? color : `${color}20` }}
              >
                <Icon size={19} className="shrink-0" style={{ color: active ? '#fff' : color }} />
                <span
                  className={cn(
                    'ml-3 hidden text-sm font-medium lg:block',
                    active ? 'text-white' : 'text-slate-700 dark:text-slate-200',
                  )}
                >
                  {label}
                </span>
              </motion.div>
            </a>
          )
        })}
      </nav>

      <a
        href="/profile"
        title={profile.fullName || 'Профиль'}
        aria-label={profile.fullName || 'Профиль'}
        onClick={(event) => forceNavigate(event, '/profile')}
        className="block"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className="flex h-12 items-center justify-center rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/[0.03] lg:w-full lg:justify-start lg:px-3"
          style={{ background: pathname === '/profile' ? '#6366f1' : '#6366f120' }}
        >
          <UserRound
            size={19}
            className="shrink-0"
            style={{ color: pathname === '/profile' ? '#fff' : '#6366f1' }}
          />
          <div className="ml-3 hidden min-w-0 lg:block">
            <div
              className={cn(
                'truncate text-sm font-medium',
                pathname === '/profile' ? 'text-white' : 'text-slate-700 dark:text-slate-200',
              )}
            >
              {profile.fullName || authUser?.email || 'Профиль'}
            </div>
            <div
              className={cn(
                'truncate text-xs',
                pathname === '/profile' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {authUser?.email || 'Личный кабинет'}
            </div>
          </div>
        </motion.div>
      </a>
    </aside>
  )
}
