'use client'

import { useEffect } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTransactionStore((state) => state.settings.theme)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}
