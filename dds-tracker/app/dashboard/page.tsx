import dynamic from 'next/dynamic'

const StatsCards = dynamic(() => import('@/components/dashboard/StatsCards').then((mod) => mod.StatsCards))
const QuickTools = dynamic(() => import('@/components/dashboard/QuickTools').then((mod) => mod.QuickTools))
const RevenueAreaChart = dynamic(() => import('@/components/dashboard/RevenueAreaChart').then((mod) => mod.RevenueAreaChart), {
  loading: () => <div className="h-[320px] rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
})
const CategoryBarChart = dynamic(() => import('@/components/dashboard/CategoryBarChart').then((mod) => mod.CategoryBarChart), {
  loading: () => <div className="h-[320px] rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
})
const ExpenseDonutChart = dynamic(() => import('@/components/dashboard/ExpenseDonutChart').then((mod) => mod.ExpenseDonutChart), {
  loading: () => <div className="h-[320px] rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
})
const BalanceLineChart = dynamic(() => import('@/components/dashboard/BalanceLineChart').then((mod) => mod.BalanceLineChart), {
  loading: () => <div className="h-[320px] rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
})
const RecentTransactions = dynamic(() => import('@/components/dashboard/RecentTransactions').then((mod) => mod.RecentTransactions))

export default function DashboardPage() {
  return (
    <div className="space-y-5 py-2">
      <StatsCards />
      <QuickTools />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueAreaChart />
        <CategoryBarChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpenseDonutChart />
        <BalanceLineChart />
      </div>
      <RecentTransactions />
    </div>
  )
}
