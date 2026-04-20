'use client'

import { MouseEvent, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Grid2x2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { MOBILE_PRIMARY_NAV_ITEMS, MOBILE_SECONDARY_NAV_ITEMS } from '@/components/layout/nav-items'
import { cn } from '@/lib/utils'

function forceNavigate(event: MouseEvent<HTMLElement>, href: string, onBeforeNavigate?: () => void) {
  event.preventDefault()
  onBeforeNavigate?.()
  window.location.assign(href)
}

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)
  const isMoreActive = MOBILE_SECONDARY_NAV_ITEMS.some(({ href }) => pathname === href)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="px-3 pb-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <div className="mx-auto max-w-screen-sm rounded-[28px] border border-slate-200/80 bg-white/94 px-3 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#10111a]/94 dark:shadow-none">
            <div className="grid h-[64px] grid-cols-5 items-center gap-1">
              {MOBILE_PRIMARY_NAV_ITEMS.map(({ href, mobileLabel, icon: Icon, color }) => {
                const active = pathname === href

                return (
                  <a
                    key={href}
                    href={href}
                    aria-label={mobileLabel}
                    onClick={(event) => forceNavigate(event, href)}
                    className="flex flex-col items-center justify-center gap-1.5"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: active ? color : `${color}18` }}
                    >
                      <Icon size={18} style={{ color: active ? '#fff' : color }} />
                    </motion.div>
                    <span
                      className="text-[9px] font-semibold leading-none"
                      style={{ color: active ? color : '#94a3b8' }}
                    >
                      {mobileLabel}
                    </span>
                  </a>
                )
              })}

              <button
                type="button"
                onClick={() => setShowMore(true)}
                aria-label="Еще"
                className="flex flex-col items-center justify-center gap-1.5"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: isMoreActive ? '#8b5cf6' : '#8b5cf618' }}
                >
                  <Grid2x2 size={18} style={{ color: isMoreActive ? '#fff' : '#8b5cf6' }} />
                </motion.div>
                <span
                  className="text-[9px] font-semibold leading-none"
                  style={{ color: isMoreActive ? '#8b5cf6' : '#94a3b8' }}
                >
                  Еще
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 bottom-0 rounded-t-[28px] border-t border-slate-200 bg-white px-4 pb-4 pt-4 dark:border-white/[0.06] dark:bg-[#13131a]"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Разделы</span>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {MOBILE_SECONDARY_NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
                  const active = pathname === href

                  return (
                    <a
                      key={href}
                      href={href}
                      aria-label={label}
                      onClick={(event) => forceNavigate(event, href, () => setShowMore(false))}
                      className="flex flex-col items-center gap-2"
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ background: active ? color : `${color}20` }}
                      >
                        <Icon size={22} style={{ color: active ? '#fff' : color }} />
                      </motion.div>
                      <span
                        className={cn('text-center text-[11px] font-semibold leading-tight')}
                        style={{ color: active ? color : '#64748b' }}
                      >
                        {label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
