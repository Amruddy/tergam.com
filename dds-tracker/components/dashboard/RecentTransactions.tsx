'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { getAccountById } from '@/lib/accounts'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { SurfaceCard, SurfaceHeader } from './SurfaceCard'

export function RecentTransactions() {
  const { accounts, transactions, settings } = useTransactionStore()

  const recent = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [transactions]
  )

  return (
    <SurfaceCard delay={0.7} className="space-y-4">
      <SurfaceHeader
        title="Последние транзакции"
        subtitle="10 актуальных записей без перегрузки деталями."
        aside={
          <Link href="/transactions" className="flex items-center gap-1 text-xs text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
            Все <ArrowRight size={12} />
          </Link>
        }
      />

      <div className="space-y-1.5">
        {recent.map((tx, i) => {
          const cat = getCategoryById(tx.category)
          const account = getAccountById(accounts, tx.accountId)
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.04 }}
              className="flex items-center gap-3 rounded-[18px] border border-transparent px-3 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/[0.06] dark:hover:bg-white/3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                {cat.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{tx.description || cat.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-gray-500">{account.emoji} {account.name}</span>
                  <span className="text-xs text-slate-300 dark:text-gray-600">•</span>
                  <span className="text-xs text-slate-400 dark:text-gray-500">{cat.name}</span>
                  {tx.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400 dark:bg-white/5 dark:text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className={cn('text-sm font-semibold leading-tight', tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, settings.currency)}
                </div>
                <div className="mt-0.5 text-xs text-slate-400 dark:text-gray-600">{formatDate(tx.date)}</div>
              </div>
            </motion.div>
          )
        })}
        {recent.length === 0 ? <div className="py-8 text-center text-sm text-slate-400 dark:text-gray-600">Нет транзакций</div> : null}
      </div>
    </SurfaceCard>
  )
}
