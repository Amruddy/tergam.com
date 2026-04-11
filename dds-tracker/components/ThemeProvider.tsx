'use client'

import { useEffect } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useTransactionStore()

  useEffect(() => {
    const html = document.documentElement
    const theme = settings.theme
    html.classList.toggle('dark', theme === 'dark')
  }, [settings.theme])

  return <>{children}</>
}
