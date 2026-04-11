import { Account, Transaction } from '@/types'
import { getCategoryById } from './categories'

export function exportTransactionsCSV(transactions: Transaction[], accounts: Account[]) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const header = ['Дата', 'Тип', 'Счёт', 'Категория', 'Описание', 'Теги', 'Сумма (₽)']

  const rows = sorted.map((t) => {
    const cat = getCategoryById(t.category)
    const account = accounts.find((item) => item.id === t.accountId)

    return [
      t.date,
      t.type === 'income' ? 'Доход' : 'Расход',
      account ? `${account.emoji} ${account.name}` : t.accountId,
      `${cat.emoji} ${cat.name}`,
      t.description,
      t.tags.join('; '),
      t.type === 'income' ? t.amount : -t.amount,
    ]
  })

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dds-export-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
