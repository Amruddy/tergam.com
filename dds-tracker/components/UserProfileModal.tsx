'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, TriangleAlert, UserRound } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { signInWithEmail, signOutUser, signUpWithEmail } from '@/lib/auth'
import { Btn, FieldLabel, FormCard, inputCls } from '@/components/ui'

export function UserProfileModal({
  onClose,
  forceSetup = false,
  isAuthenticated = false,
  authEmail = '',
  onAuthSuccess,
}: {
  onClose?: () => void
  forceSetup?: boolean
  isAuthenticated?: boolean
  authEmail?: string
  onAuthSuccess?: () => void
}) {
  const { profile, updateProfile, resetAllData, clearAllData, syncError } = useTransactionStore()
  const [fullName, setFullName] = useState(profile.fullName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [city, setCity] = useState(profile.city)
  const [confirmReset, setConfirmReset] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authFormEmail, setAuthFormEmail] = useState(profile.email)
  const [authPassword, setAuthPassword] = useState('')
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    setFullName(profile.fullName)
    setEmail(profile.email)
    setPhone(profile.phone)
    setCity(profile.city)
    if (!authFormEmail) setAuthFormEmail(profile.email)
  }, [profile, authFormEmail])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
    })
    onClose?.()
  }

  const handleReset = async () => {
    setClearLoading(true)
    const cleared = await clearAllData()
    setClearLoading(false)
    if (!cleared) return
    setConfirmReset(false)
    onClose?.()
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authFormEmail.trim() || !authPassword) return
    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('Пароли не совпадают')
      return
    }

    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const response = authMode === 'login'
      ? await signInWithEmail(authFormEmail, authPassword)
      : await signUpWithEmail(authFormEmail, authPassword, fullName || authFormEmail)

    setAuthLoading(false)

    if (response.error) {
      setAuthError(response.error.message)
      return
    }

    setEmail(authFormEmail.trim())
    updateProfile({
      fullName: fullName.trim(),
      email: authFormEmail.trim(),
      phone: phone.trim(),
      city: city.trim(),
    })

    if (authMode === 'register' && !response.data.session) {
      setAuthMessage('Аккаунт создан. Подтвердите email и затем войдите.')
      setAuthPassword('')
      setAuthPasswordConfirm('')
      return
    }

    setAuthPassword('')
    setAuthPasswordConfirm('')
    onAuthSuccess?.()
    onClose?.()
  }

  const handleSignOut = async () => {
    await signOutUser()
    resetAllData()
    onAuthSuccess?.()
    onClose?.()
  }

  const body = (
    <FormCard title={forceSetup ? 'Личный кабинет' : 'Мой кабинет'} onClose={onClose ?? (() => {})}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/8 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
            <UserRound size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {fullName.trim() || authEmail || 'Пользователь'}
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500 break-words">
              {isAuthenticated
                ? `Авторизован: ${authEmail}`
                : 'Локальный режим. Для синхронизации между устройствами войдите в аккаунт.'}
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <form onSubmit={handleAuth} className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/8 p-4">
            <div className="flex gap-2">
              <Btn type="button" variant={authMode === 'login' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setAuthMode('login')}>
                Вход
              </Btn>
              <Btn type="button" variant={authMode === 'register' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setAuthMode('register')}>
                Регистрация
              </Btn>
            </div>

            <div>
              <FieldLabel>Email</FieldLabel>
              <input value={authFormEmail} onChange={(e) => setAuthFormEmail(e.target.value)} placeholder="example@mail.com" className={inputCls} />
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

            <Btn type="submit" variant="primary" className="w-full" disabled={authLoading || !authFormEmail.trim() || !authPassword}>
              {authLoading ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Btn>
          </form>
        )}

        {isAuthenticated && (
          <Btn type="button" variant="secondary" className="w-full" onClick={handleSignOut}>
            <LogOut size={14} /> Выйти из аккаунта
          </Btn>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FieldLabel>Имя</FieldLabel>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Как вас зовут" className={inputCls} />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className={inputCls} />
          </div>

          <div>
            <FieldLabel>Телефон</FieldLabel>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..." className={inputCls} />
          </div>

          <div>
            <FieldLabel>Город</FieldLabel>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" className={inputCls} />
          </div>

          {!forceSetup && (
            <div className="rounded-2xl border border-red-200/70 dark:border-red-500/20 bg-red-500/[0.04] p-3 space-y-3">
              <div className="flex items-start gap-2">
                <TriangleAlert size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Очистить все данные</div>
                  <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    Удалит локальные и облачные транзакции, счета, переводы, бюджеты, цели, автоплатежи и профиль.
                  </div>
                </div>
              </div>

              {confirmReset ? (
                <div className="flex gap-2">
                  <Btn type="button" variant="danger" className="flex-1" onClick={handleReset} disabled={clearLoading}>
                    {clearLoading ? 'Удаление...' : 'Подтвердить очистку'}
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
          )}

          <div className="flex gap-2 pt-1">
            {!forceSetup && (
              <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Закрыть
              </Btn>
            )}
            <Btn type="submit" variant="primary" className="flex-1" disabled={!fullName.trim()}>
              Сохранить
            </Btn>
          </div>
        </form>
      </div>
    </FormCard>
  )

  if (!forceSetup) return body

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        {body}
      </motion.div>
    </div>
  )
}
