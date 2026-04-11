'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, ArrowLeftRight, BarChart3, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/transactions', label: 'Записи', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Счета', icon: Landmark },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 dark:bg-[#0d0d14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-2 pb-safe shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-stretch h-[68px]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-1.5 relative rounded-2xl">
                {active && <motion.div layoutId="bottom-pill" className="absolute top-2 w-11 h-11 rounded-2xl bg-indigo-500/12 dark:bg-indigo-500/20" transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }} />}
                <Icon size={20} className={cn('relative z-10 transition-colors', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-500')} />
                <span className={cn('text-[10px] font-semibold relative z-10 transition-colors', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-500')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
