import dynamic from 'next/dynamic'

const StatsCards = dynamic(() => import('@/components/dashboard/StatsCards').then((mod) => mod.StatsCards))
const QuickTools = dynamic(() => import('@/components/dashboard/QuickTools').then((mod) => mod.QuickTools))
const RevenueAreaChart = dynamic(() => import('@/components/dashboard/RevenueAreaChart').then((mod) => mod.RevenueAreaChart), {
  loading: () => <div className="h-[320px] rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
})
const RecentTransactions = dynamic(() => import('@/components/dashboard/RecentTransactions').then((mod) => mod.RecentTransactions))

export default function DashboardPage() {
  return (
    <div className="space-y-5 py-2">
      <StatsCards />
      <QuickTools />
      <div className="grid grid-cols-1 gap-4">
        <RevenueAreaChart />
      </div>
      <RecentTransactions />
    </div>
  )
}
