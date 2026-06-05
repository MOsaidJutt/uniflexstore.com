import { DollarSign, ShoppingCart, Users, Clock, AlertTriangle, Package } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { getDashboardStats, getRecentOrders, getLowStockProducts, getTopProducts, getExpiringCerts, getRevenueByMonth } from '@/server/queries/admin/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatUSD } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [stats, recentOrders, lowStock, topProducts, expiringCerts, revenueData] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(8),
    getLowStockProducts(5),
    getTopProducts(5),
    getExpiringCerts(30),
    getRevenueByMonth(6),
  ])

  const now = new Date()
  const expiredCerts = expiringCerts.filter((c) => c.validUntil && c.validUntil < now)
  const soonCerts = expiringCerts.filter((c) => c.validUntil && c.validUntil >= now)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Dashboard" />

      <main className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cert alerts banner */}
        {(expiredCerts.length > 0 || soonCerts.length > 0) && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                Certificate alerts
              </p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-500">
                {expiredCerts.length > 0 && `${expiredCerts.length} expired`}
                {expiredCerts.length > 0 && soonCerts.length > 0 && ', '}
                {soonCerts.length > 0 && `${soonCerts.length} expiring within 30 days`}.{' '}
                <Link href="/admin/brand-authorizations" className="underline hover:no-underline">
                  Review brand authorizations →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatUSD(stats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-emerald-600"
            change={stats.revenueChange}
            changeLabel="vs last month"
          />
          <StatCard
            title="Orders This Month"
            value={stats.monthOrders.toLocaleString()}
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders.toLocaleString()}
            icon={Clock}
            iconColor="text-amber-600"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            icon={Users}
            iconColor="text-violet-600"
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>

          {/* Top products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map(({ product, totalSold }, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm font-semibold text-[var(--text-muted)]">{i + 1}</span>
                  {product.images[0] ? (
                    <img src={product.images[0].url} alt={product.name} className="h-9 w-9 rounded-lg object-cover border border-[var(--border-default)]" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                      <Package className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{totalSold} sold</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent orders + Low stock */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-xs text-[var(--brand-accent)] hover:underline">
                View all →
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {order.user?.name ?? order.guestEmail ?? 'Guest'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      #{order.id.slice(-8)} · {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{formatUSD(order.total)}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Low stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Low Stock</CardTitle>
              <Link href="/admin/products?lowStock=true" className="text-xs text-[var(--brand-accent)] hover:underline">
                View all →
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStock.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">All products well-stocked.</p>
              ) : (
                lowStock.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    {p.images[0] ? (
                      <img src={p.images[0].url} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                        <Package className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{p.name}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? 'destructive' : 'warning'} className="shrink-0">
                      {p.stock === 0 ? 'Out' : p.stock}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default'> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'default',
    DELIVERED: 'success',
    CANCELLED: 'destructive',
    REFUNDED: 'secondary',
  }
  return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>
}

