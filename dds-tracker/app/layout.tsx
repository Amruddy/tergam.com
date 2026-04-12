import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/AppShell'

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-primary',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Тергам — Учёт доходов и расходов',
  description: 'Современное приложение для учёта движения денежных средств',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className="font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
