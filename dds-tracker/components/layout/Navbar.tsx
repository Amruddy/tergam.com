'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Home, LayoutDashboard, ArrowLeftRight, BarChart3, Landmark, Sun, Moon, UserRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTransactionStore } from '@/store/useTransactionStore'
import { Logo } from '@/components/Logo'
import { UserProfileModal } from '@/components/UserProfileModal'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/',              label: 'Главная',   icon: Home },
  { href: '/dashboard',    label: 'Дашборд',   icon: LayoutDashboard },
  { href: '/transactions', label: 'Записи',    icon: ArrowLeftRight },
  { href: '/accounts',     label: 'Счета',     icon: Landmark },
  { href: '/analytics',    label: 'Аналитика', icon: BarChart3 },
]

export function Navbar() {
  const pathname  = usePathname()
  const { bootstrap, profile, settings, updateSettings } = useTransactionStore()
  const theme     = settings.theme
  const [showProfile, setShowProfile] = useState(false)
  const [authUser, setAuthUser]       = useState<User | null>(null)

  useEffect(() => {
    bootstrap()
    let active = true
    getAuthUser().then((user) => { if (!active) return; setAuthUser(user) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) bootstrap()
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [bootstrap])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-[68px]">

      {/* ── Mobile header glass ── */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background: 'rgba(241, 245, 249, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 2px 20px rgba(15, 23, 42, 0.07), 0 1px 0 rgba(148, 163, 184, 0.08)',
        }}
      />
      {/* dark overlay for mobile */}
      <div
        className="absolute inset-0 md:hidden hidden dark:block"
        style={{
          background: 'rgba(15, 21, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.055)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.35)',
        }}
      />

      {/* ── Desktop frosted pill ── */}
      <div className="absolute inset-x-0 top-0 hidden h-full md:block">
        <div className="mx-auto h-full max-w-[1520px] px-6 xl:px-10">
          <div
            className="mt-3 h-[52px] rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.80)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 2px 16px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>
      {/* dark desktop pill overlay */}
      <div className="absolute inset-x-0 top-0 hidden h-full dark:md:block">
        <div className="mx-auto h-full max-w-[1520px] px-6 xl:px-10">
          <div
            className="mt-3 h-[52px] rounded-2xl"
            style={{
              background: 'rgba(15, 21, 35, 0.90)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.40)',
            }}
          />
        </div>
      </div>

      {/* ── Content row ── */}
      <div className="relative h-full max-w-[1520px] mx-auto px-4 md:px-6 xl:px-10 flex items-center gap-3 md:gap-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-2.5 flex-shrink-0 md:pl-1">
          <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center -ml-1 flex-shrink-0">
            <Logo className="w-full h-full" />
          </div>
          <span className="font-heading font-bold text-slate-900 dark:text-white text-[14px] md:text-[15px] tracking-tight hidden sm:block">
            Тергам
          </span>
        </Link>

        {/* Desktop nav pills */}
        <nav className="hidden md:flex items-center gap-0.5 rounded-xl border border-slate-200/70 dark:border-white/[0.07] bg-slate-100/80 dark:bg-white/[0.04] px-1 py-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 whitespace-nowrap flex-shrink-0',
                  active
                    ? 'text-[#7C3AED] dark:text-[#A78BFA]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.09]"
                    style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={14} className="relative z-10 flex-shrink-0" />
                <span className="relative z-10">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0 md:pr-1">

          {/* User name (lg only) */}
          <div className="hidden lg:block text-right">
            <div className="text-[12px] font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[160px]">
              {profile.fullName || 'Профиль'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
              {authUser?.email || profile.city || profile.email || 'Локальный режим'}
            </div>
          </div>

          {/* Currency switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl p-0.5 border border-slate-200/70 dark:border-white/[0.07]">
            {(['RUB', 'USD', 'EUR'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => updateSettings({ currency: cur })}
                className={cn(
                  'px-2 md:px-2.5 py-1 md:py-1.5 rounded-[9px] text-xs font-semibold transition-all duration-150',
                  settings.currency === cur
                    ? 'bg-white dark:bg-white/[0.10] text-[#7C3AED] dark:text-[#A78BFA] shadow-xs border border-slate-200/80 dark:border-white/[0.10]'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {cur === 'RUB' ? '₽' : cur === 'USD' ? '$' : '€'}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-slate-200 dark:bg-white/[0.08] hidden md:block" />

          {/* Theme switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl p-0.5 border border-slate-200/70 dark:border-white/[0.07]">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              title="Светлая тема"
              className={cn(
                'w-7 h-7 md:w-8 md:h-8 rounded-[9px] flex items-center justify-center transition-all duration-150',
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs border border-amber-200/60'
                  : 'text-slate-400 dark:text-slate-500 hover:text-amber-400'
              )}
            >
              <Sun size={13} />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              title="Тёмная тема"
              className={cn(
                'w-7 h-7 md:w-8 md:h-8 rounded-[9px] flex items-center justify-center transition-all duration-150',
                theme === 'dark'
                  ? 'bg-[#1E263D] text-[#A78BFA] border border-[#7C3AED]/30'
                  : 'text-slate-400 dark:text-slate-500 hover:text-[#7C3AED] dark:hover:text-[#A78BFA]'
              )}
            >
              <Moon size={13} />
            </button>
          </div>

          {/* Profile button */}
          <button
            onClick={() => setShowProfile(true)}
            title="Личный кабинет"
            className="w-9 h-9 md:w-8 md:h-8 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 border border-slate-200/80 dark:border-white/[0.07] bg-white/60 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] hover:border-[#7C3AED]/30 dark:hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/05"
          >
            <UserRound size={15} />
          </button>
        </div>
      </div>

      {/* Profile modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="w-full sm:max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <UserProfileModal
                onClose={() => setShowProfile(false)}
                isAuthenticated={Boolean(authUser)}
                authEmail={authUser?.email ?? ''}
                onAuthSuccess={bootstrap}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
