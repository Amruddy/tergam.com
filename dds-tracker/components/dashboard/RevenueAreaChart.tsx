'use client'

import { useMemo } from 'react'
import { useTransactionStore } from '@/store/useTransactionStore'
import { formatCurrency, getMonthKey, formatMonth } from '@/lib/utils'

export function RevenueAreaChart() {
  const { transactions, settings } = useTransactionStore()

  const data = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months[getMonthKey(d)] = { income: 0, expense: 0 }
    }
    transactions.forEach((t) => {
      const key = t.date.substring(0, 7)
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount
        else months[key].expense += t.amount
      }
    })
    return Object.entries(months).map(([key, vals]) => ({
      month: formatMonth(key + '-01'),
      income: vals.income,
      expense: vals.expense,
    }))
  }, [transactions])
  const maxAmount = Math.max(1, ...data.flatMap((item) => [item.income, item.expense]))

  return (
    <div
      className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 md:p-6 transition-colors duration-300"
    >
      <div className="mb-3 md:mb-4">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">Доходы vs Расходы</h3>
        <p className="text-slate-400 dark:text-gray-500 text-xs mt-0.5">Последние 6 месяцев</p>
      </div>
      <div className="grid grid-cols-6 gap-2 h-[200px] items-end">
        {data.map((item) => {
          const incomeHeight = Math.max(4, Math.round((item.income / maxAmount) * 150))
          const expenseHeight = Math.max(4, Math.round((item.expense / maxAmount) * 150))
          return (
            <div key={item.month} className="min-w-0 flex h-full flex-col justify-end gap-2">
              <div className="flex flex-1 items-end justify-center gap-1.5">
                <div
                  className="w-full max-w-5 rounded-t-md bg-green-500/75"
                  style={{ height: incomeHeight }}
                  title={`Доходы: ${formatCurrency(item.income, settings.currency)}`}
                />
                <div
                  className="w-full max-w-5 rounded-t-md bg-red-500/75"
                  style={{ height: expenseHeight }}
                  title={`Расходы: ${formatCurrency(item.expense, settings.currency)}`}
                />
              </div>
              <div className="truncate text-center text-[10px] text-slate-400 dark:text-gray-500">{item.month}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />Доходы</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Расходы</span>
      </div>
    </div>
  )
}
