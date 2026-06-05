import { AdminTopbar } from '@/components/admin/topbar'
import { getAnalyticsData } from '@/server/queries/admin/analytics'
import { getRevenueByMonth } from '@/server/queries/admin/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart, StatusBreakdown } from '@/components/admin/revenue-chart'
import { AnalyticsCharts } from './_components/analytics-charts'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [analytics, revenueData] = await Promise.all([
    getAnalyticsData(30),
    getRevenueByMonth(12),
  ])

  const totalOrders = analytics.ordersByStatus.reduce((s, o) => s + o.count, 0)
  const conversionRate = totalOrders > 0
    ? Math.round((analytics.registeredOrders / (analytics.registeredOrders + analytics.guestOrders)) * 100)
    : 0

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Analytics" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Total Orders (30d)</p>
              <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Registered Checkout %</p>
              <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{conversionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Guest Orders (30d)</p>
              <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{analytics.guestOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>
          <StatusBreakdown data={analytics.ordersByStatus.map((o) => ({ name: o.status, value: o.count }))} />
        </div>

        <AnalyticsCharts
          topProducts={analytics.topProducts}
          topCategories={analytics.topCategories}
          dailyRevenue={analytics.dailyRevenue}
        />
      </main>
    </div>
  )
}
