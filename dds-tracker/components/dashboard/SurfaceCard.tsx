'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SurfaceCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

interface SurfaceHeaderProps {
  title: string
  subtitle?: string
  aside?: React.ReactNode
  className?: string
}

export function SurfaceCard({ children, className, delay = 0 }: SurfaceCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#13131a] sm:p-5 lg:p-6',
        className
      )}
    >
      {children}
    </motion.section>
  )
}

export function SurfaceHeader({ title, subtitle, aside, className }: SurfaceHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:mb-5', className)}>
      <div className="min-w-0 space-y-1">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base lg:text-lg">{title}</h3>
        {subtitle ? <p className="max-w-[42rem] text-xs leading-relaxed text-slate-500 dark:text-gray-500 lg:text-sm">{subtitle}</p> : null}
      </div>
      {aside ? <div className="flex flex-wrap items-center gap-3">{aside}</div> : null}
    </div>
  )
}
