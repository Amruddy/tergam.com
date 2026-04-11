'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TriangleAlert, UserRound } from 'lucide-react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { Btn, FieldLabel, FormCard, inputCls } from '@/components/ui'

export function UserProfileModal({
  onClose,
  forceSetup = false,
}: {
  onClose?: () => void
  forceSetup?: boolean
}) {
  const { profile, updateProfile, resetAllData } = useTransactionStore()
  const [fullName, setFullName] = useState(profile.fullName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [city, setCity] = useState(profile.city)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setFullName(profile.fullName)
    setEmail(profile.email)
    setPhone(profile.phone)
    setCity(profile.city)
  }, [profile])

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

  const handleReset = () => {
    resetAllData()
    setConfirmReset(false)
    onClose?.()
  }

  const body = (
    <FormCard title={forceSetup ? 'Профиль пользователя' : 'Мой профиль'} onClose={onClose ?? (() => {})}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/8 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
            <UserRound size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {fullName.trim() || 'Новый пользователь'}
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500">
              Локальный профиль хранится только на этом устройстве
            </div>
          </div>
        </div>

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
                  Удалит транзакции, счета, переводы, бюджеты, цели, автоплатежи и профиль пользователя.
                </div>
              </div>
            </div>

            {confirmReset ? (
              <div className="flex gap-2">
                <Btn type="button" variant="danger" className="flex-1" onClick={handleReset}>
                  Подтвердить очистку
                </Btn>
                <Btn type="button" variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
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
