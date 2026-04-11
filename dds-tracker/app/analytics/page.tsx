import dynamic from 'next/dynamic'

const AnalyticsContent = dynamic(
  () => import('@/components/analytics/AnalyticsContent').then((mod) => mod.AnalyticsContent),
  {
    loading: () => <div className="h-64 rounded-2xl bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/[0.06]" />,
  }
)

export default function AnalyticsPage() {
  return <AnalyticsContent />
}
