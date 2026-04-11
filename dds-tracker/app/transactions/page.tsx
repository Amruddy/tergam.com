import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionTable } from '@/components/transactions/TransactionTable'

export default function TransactionsPage() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col xl:grid xl:grid-cols-[360px_minmax(0,1fr)] gap-4 md:gap-6 items-start">
        <div className="w-full xl:sticky xl:top-24">
          <TransactionForm />
        </div>
        <div className="w-full space-y-4">
          <TransactionTable />
        </div>
      </div>
    </div>
  )
}
