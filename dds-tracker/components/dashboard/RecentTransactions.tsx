'use client'

import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTransactionStore } from '@/store/useTransactionStore'
import { getCategoryById } from '@/lib/categories'
import { getAccountById } from '@/lib/accounts'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export function RecentTransactions() {
  const { accounts, transactions, settings } = useTransactionStore()

  const recent = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [transactions]
  )

  return (
    <div
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">Последние транзакции</h3>
          <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">10 актуальных записей</p>
        </div>
        <Link href="/transactions" className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
          Все <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-1">
        {recent.map((tx) => {
          const cat = getCategoryById(tx.category)
          const account = getAccountById(accounts, tx.accountId)
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 dark:text-white font-medium truncate">{tx.description || cat.name}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-400 dark:text-gray-500">{account.emoji} {account.name}</span>
                  <span className="text-xs text-slate-300 dark:text-gray-600">•</span>
                  <span className="text-xs text-slate-400 dark:text-gray-500">{cat.name}</span>
                  {tx.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={cn('text-sm font-semibold', tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, settings.currency)}
                </div>
                <div className="text-xs text-slate-400 dark:text-gray-600 mt-0.5">{formatDate(tx.date)}</div>
              </div>
            </div>
          )
        })}
        {recent.length === 0 && <div className="text-center py-8 text-slate-400 dark:text-gray-600 text-sm">Нет транзакций</div>}
      </div>
    </div>
  )
}
