import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { AppShell } from '@/components/AppShell'

/* Brand / heading font */
const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-primary',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

/* Body / UI font — higher readability at small sizes */
const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Тергам — Учёт доходов и расходов',
  description: 'Современное приложение для учёта движения денежных средств',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${montserrat.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen transition-colors duration-300" style={{ viewTransitionName: 'root' }}>
        <AppShell>{children}</AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
