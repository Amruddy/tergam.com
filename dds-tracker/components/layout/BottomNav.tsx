'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, ArrowLeftRight, BarChart3, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',             label: 'Главная',  icon: Home },
  { href: '/dashboard',   label: 'Дашборд',  icon: LayoutDashboard },
  { href: '/transactions',label: 'Записи',   icon: ArrowLeftRight },
  { href: '/accounts',    label: 'Счета',    icon: Landmark },
  { href: '/analytics',   label: 'Аналитика',icon: BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass surface */}
      <div
        className="relative bg-white/95 dark:bg-[#0F1523]/97 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/[0.055]"
        style={{
          boxShadow: '0 -8px 32px rgba(15,23,42,0.09), 0 -1px 0 rgba(148,163,184,0.06)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
        }}
      >
        <div className="flex items-stretch h-[68px] px-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-[5px] relative select-none"
              >
                {/* Animated active pill */}
                {active && (
                  <motion.div
                    layoutId="bottom-pill"
                    className="absolute top-2 w-[50px] h-[40px] rounded-[13px] bg-[var(--primary-muted)] dark:bg-[rgba(124,58,237,0.18)]"
                    style={{ border: '1px solid var(--primary-border)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                {/* Icon */}
                <Icon
                  size={active ? 21 : 19}
                  strokeWidth={active ? 2.2 : 1.75}
                  className={cn(
                    'relative z-10 transition-all duration-200',
                    active
                      ? 'icon-glow-primary text-[#7C3AED] dark:text-[#A78BFA]'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                />

                {/* Label */}
                <span
                  className={cn(
                    'relative z-10 leading-none transition-all duration-200',
                    active
                      ? 'text-[10px] font-semibold text-[#7C3AED] dark:text-[#A78BFA]'
                      : 'text-[10px] font-medium text-slate-400 dark:text-slate-500'
                  )}
                >
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
