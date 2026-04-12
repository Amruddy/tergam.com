'use client'

import { TriangleAlert } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useTransactionStore } from '@/store/useTransactionStore'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { syncError } = useTransactionStore()

  return (
    <ThemeProvider>
      <Navbar />
      <main className="desktop-shell pt-14 md:pt-[82px] pb-[88px] md:pb-6 min-h-screen">
        <div className="relative z-10 px-3 py-3 md:px-6 md:py-4 xl:px-8 max-w-[1480px] mx-auto">
          {syncError && (
            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-red-200/70 bg-red-500/[0.06] px-3 py-2.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/[0.08] dark:text-red-200">
              <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
          <div className="md:rounded-2xl md:border md:border-slate-200/60 md:bg-white/70 md:p-4 lg:p-5 md:shadow-md dark:md:border-slate-700 dark:md:bg-slate-900">
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
    </ThemeProvider>
  )
}
