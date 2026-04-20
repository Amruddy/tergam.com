'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserRound } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { useTransactionStore } from '@/store/useTransactionStore'
import { Logo } from '@/components/Logo'

export function Navbar() {
  const { bootstrap } = useTransactionStore()
  const router = useRouter()

  useEffect(() => {
    bootstrap()
    const supabase = getSupabase()
    let active = true

    getAuthUser().then((user) => { if (!active) return })

    if (!supabase) return () => { active = false }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) bootstrap()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [bootstrap])

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="absolute inset-x-0 top-0 h-[72px]">
        <div className="mx-3 mt-2 h-[56px] rounded-[24px] border border-slate-200/80 bg-white/92 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#10111a]/92 dark:shadow-none" />
      </div>

      <div className="relative mx-auto flex h-[72px] max-w-[1520px] items-center gap-3 px-6">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <div className="-ml-1 flex h-8 w-8 items-center justify-center">
            <Logo className="h-full w-full" />
          </div>
          <span className="hidden text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:block">
            Тергам
          </span>
        </Link>

        <div className="ml-auto">
          <button
            onClick={() => router.push('/profile')}
            title="Личный кабинет"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/70 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:border-white/8 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <UserRound size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}
