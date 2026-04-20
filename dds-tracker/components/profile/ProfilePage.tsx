'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Moon, Sun, TriangleAlert, UserRound } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getAuthUser } from '@/lib/auth'
import { signInWithEmail, signOutUser, signUpWithEmail } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { Btn, FieldLabel, PageHeader, inputCls } from '@/components/ui'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#13131a]"
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">{children}</h3>
}

export function ProfilePage() {
  const { bootstrap, profile, settings, updateProfile, updateSettings, resetAllData, clearAllData, syncError } = useTransactionStore()
  const theme = settings.theme

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState(profile.fullName)
  const [nameSaved, setNameSaved] = useState(false)

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState(profile.email)
  const [authPassword, setAuthPassword] = useState('')
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  const [confirmReset, setConfirmReset] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)

  useEffect(() => {
    setFullName(profile.fullName)
    if (!authEmail) setAuthEmail(profile.email)
  }, [profile, authEmail])

  useEffect(() => {
    const supabase = getSupabase()
    let active = true

    getAuthUser().then((user) => {
      if (!active) return
      setAuthUser(user)
    })

    if (!supabase) return () => { active = false }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)
      if (user) bootstrap()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [bootstrap])

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    updateProfile({ fullName: fullName.trim(), email: profile.email, phone: profile.phone, city: profile.city })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.trim() || !authPassword) return
    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('Пароли не совпадают')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const response = authMode === 'login'
      ? await signInWithEmail(authEmail, authPassword)
      : await signUpWithEmail(authEmail, authPassword, fullName || authEmail)

    setAuthLoading(false)

    if (response.error) {
      setAuthError(response.error.message)
      return
    }

    updateProfile({ fullName: fullName.trim(), email: authEmail.trim(), phone: profile.phone, city: profile.city })

    if (authMode === 'register' && !response.data.session) {
      setAuthMessage('Аккаунт создан. Подтвердите email и войдите.')
      setAuthPassword('')
      setAuthPasswordConfirm('')
      return
    }

    setAuthPassword('')
    setAuthPasswordConfirm('')
    bootstrap()
  }

  const handleSignOut = async () => {
    await signOutUser()
    resetAllData()
    bootstrap()
  }

  const handleClearData = async () => {
    setClearLoading(true)
    await clearAllData()
    setClearLoading(false)
    setConfirmReset(false)
  }

  return (
    <div className="space-y-4 py-2 sm:space-y-5">
      <PageHeader
        title="Личный кабинет"
        subtitle="Профиль, настройки и безопасность"
        icon={UserRound as LucideIcon}
        iconColor="#6366f1"
      />

      {/* Profile info */}
      <SectionCard delay={0.05}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
            <UserRound size={22} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.fullName || 'Пользователь'}
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500">
              {authUser ? `Авторизован: ${authUser.email}` : 'Локальный режим'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="flex gap-2">
          <div className="flex-1">
            <FieldLabel>Имя</FieldLabel>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Как вас зовут"
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <Btn type="submit" variant={nameSaved ? 'secondary' : 'primary'} disabled={!fullName.trim()}>
              {nameSaved ? 'Сохранено' : 'Сохранить'}
            </Btn>
          </div>
        </form>
      </SectionCard>

      {/* Currency */}
      <SectionCard delay={0.1}>
        <SectionTitle>Валюта</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {(['RUB', 'USD', 'EUR'] as const).map((cur) => (
            <button
              key={cur}
              onClick={() => updateSettings({ currency: cur })}
              className={cn(
                'rounded-2xl border py-3 text-sm font-semibold transition-all',
                settings.currency === cur
                  ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                  : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              {cur === 'RUB' ? '₽ Рубль' : cur === 'USD' ? '$ Доллар' : '€ Евро'}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard delay={0.15}>
        <SectionTitle>Тема оформления</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={cn(
              'flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all',
              theme === 'light'
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400'
                : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <Sun size={16} /> Светлая
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={cn(
              'flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all',
              theme === 'dark'
                ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-500 dark:text-indigo-300'
                : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <Moon size={16} /> Тёмная
          </button>
        </div>
      </SectionCard>

      {/* Auth */}
      <SectionCard delay={0.2}>
        <SectionTitle>Аккаунт и синхронизация</SectionTitle>

        {authUser ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Вы вошли как <span className="font-semibold">{authUser.email}</span>. Данные синхронизируются между устройствами.
            </div>
            <Btn type="button" variant="secondary" className="w-full" onClick={handleSignOut}>
              <LogOut size={14} /> Выйти из аккаунта
            </Btn>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-500 dark:border-white/8 dark:bg-white/5 dark:text-gray-400">
              Войдите, чтобы синхронизировать данные между устройствами
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Btn type="button" variant={authMode === 'login' ? 'primary' : 'secondary'} className="w-full" onClick={() => setAuthMode('login')}>
                Вход
              </Btn>
              <Btn type="button" variant={authMode === 'register' ? 'primary' : 'secondary'} className="w-full" onClick={() => setAuthMode('register')}>
                Регистрация
              </Btn>
            </div>

            <div>
              <FieldLabel>Email</FieldLabel>
              <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="example@mail.com" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Пароль</FieldLabel>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Минимум 6 символов" className={inputCls} />
            </div>
            {authMode === 'register' && (
              <div>
                <FieldLabel>Повторите пароль</FieldLabel>
                <input type="password" value={authPasswordConfirm} onChange={(e) => setAuthPasswordConfirm(e.target.value)} placeholder="Повторите пароль" className={inputCls} />
              </div>
            )}
            {authError && <div className="text-xs text-red-500">{authError}</div>}
            {authMessage && <div className="text-xs text-green-600 dark:text-green-400">{authMessage}</div>}
            {syncError && <div className="text-xs text-red-500">{syncError}</div>}
            <Btn type="submit" variant="primary" className="w-full" disabled={authLoading || !authEmail.trim() || !authPassword}>
              {authLoading ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Btn>
          </form>
        )}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard delay={0.25}>
        <SectionTitle>Опасная зона</SectionTitle>
        <div className="rounded-2xl border border-red-200/70 bg-red-500/[0.04] p-4 space-y-3 dark:border-red-500/20">
          <div className="flex items-start gap-2">
            <TriangleAlert size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Очистить все данные</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                Удалит транзакции, счета, бюджеты, цели, автоплатежи и профиль.
              </div>
            </div>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <Btn type="button" variant="danger" className="flex-1" onClick={handleClearData} disabled={clearLoading}>
                {clearLoading ? 'Удаление...' : 'Подтвердить'}
              </Btn>
              <Btn type="button" variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)} disabled={clearLoading}>
                Отмена
              </Btn>
            </div>
          ) : (
            <Btn type="button" variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
              Очистить все данные
            </Btn>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
