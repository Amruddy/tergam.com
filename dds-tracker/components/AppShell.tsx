'use client'

import { TriangleAlert } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useTransactionStore } from '@/store/useTransactionStore'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { syncError } = useTransactionStore()

  return (
    <ThemeProvider>
      <Navbar />
      <main
        className="desktop-shell min-h-screen pt-[var(--mobile-top-offset)] md:pt-0 md:pb-6"
        style={{
          ['--mobile-top-offset' as string]: 'calc(72px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(94px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="relative z-10 mx-auto max-w-[1520px] px-3 py-3 md:px-8 md:py-4 xl:px-10">
          {syncError && (
            <div className="mb-3 flex items-start gap-2 rounded-[22px] border border-red-200/70 bg-red-500/[0.06] px-3 py-2.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/[0.08] dark:text-red-200">
              <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
          <div className="md:grid md:grid-cols-[88px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <DesktopSidebar />
            <div className="rounded-[26px] border border-slate-200/70 bg-white/88 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/8 dark:bg-[#10111a]/92 dark:shadow-none md:rounded-[28px] md:border-slate-200/60 md:bg-white/70 md:p-4 md:shadow-md dark:md:border-slate-700 dark:md:bg-slate-900 xl:p-5">
              {children}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </ThemeProvider>
  )
}
