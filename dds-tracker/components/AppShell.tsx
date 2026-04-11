'use client'

import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ThemeProvider } from '@/components/ThemeProvider'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="desktop-shell pt-14 md:pt-[82px] pb-[88px] md:pb-6 min-h-screen">
        <div className="relative z-10 px-3 py-3 md:px-6 md:py-4 xl:px-8 max-w-[1480px] mx-auto">
          <div className="md:rounded-2xl md:border md:border-slate-200/60 md:bg-white/70 md:p-4 lg:p-5 md:shadow-md dark:md:border-slate-700 dark:md:bg-slate-900">
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
    </ThemeProvider>
  )
}
