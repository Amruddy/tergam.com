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

      <main className="desktop-shell pt-14 md:pt-[80px] pb-[80px] md:pb-6 min-h-screen">
        <div className="relative z-10 px-3 sm:px-4 md:px-6 xl:px-10 py-3 md:py-4 max-w-[1520px] mx-auto">

          {/* Sync error banner */}
          {syncError && (
            <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-[#E11D48]/20 bg-[#E11D48]/[0.06] px-4 py-3 text-sm text-[#E11D48] dark:border-[#E11D48]/25 dark:bg-[#E11D48]/[0.08] dark:text-[#F87171]">
              <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {/* Content wrapper */}
          <div className="md:rounded-2xl md:border md:border-slate-200/60 dark:md:border-white/[0.055] md:bg-white/70 dark:md:bg-[#0F1523]/80 md:p-4 lg:p-5 md:shadow-[0_4px_20px_rgba(15,23,42,0.07)] dark:md:shadow-[0_4px_20px_rgba(0,0,0,0.40)] md:backdrop-blur-sm">
            {children}
          </div>
        </div>
      </main>

      <BottomNav />
    </ThemeProvider>
  )
}
