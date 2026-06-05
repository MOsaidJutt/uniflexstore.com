import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AdminTopbar } from '@/components/admin/topbar'
import { getAdminCustomerById } from '@/server/queries/admin/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatUSD } from '@/lib/utils'
import type { OrderStatus } from '@prisma/client'

interface PageProps { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default'> = {
  PENDING: 'warning', PROCESSING: 'info', SHIPPED: 'default', DELIVERED: 'success', CANCELLED: 'destructive', REFUNDED: 'secondary',
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const customer = await getAdminCustomerById(id)
  if (!customer) notFound()

  const totalSpent = customer.orders
    .filter((o) => !['CANCELLED', 'REFUNDED'].includes(o.status))
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar
        title={customer.name ?? customer.email}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Customers', href: '/admin/customers' }]}
      />

      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-[var(--text-muted)]">Name</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{customer.name ?? 'Not set'}</p>
                  {customer.isBanned && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Banned</Badge>}
                </div>
              </div>
              <div><span className="text-[var(--text-muted)]">Email</span><p className="font-medium">{customer.email}</p></div>
              {customer.phone && <div><span className="text-[var(--text-muted)]">Phone</span><p className="font-medium">{customer.phone}</p></div>}
              <div><span className="text-[var(--text-muted)]">Joined</span><p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p></div>
              <div><span className="text-[var(--text-muted)]">Total Spent</span><p className="font-semibold text-lg text-[var(--text-primary)]">{formatUSD(totalSpent)}</p></div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Order History ({customer.orders.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {customer.orders.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No orders yet.</p>
              ) : (
                customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-[var(--text-primary)]">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                      <span className="font-semibold text-sm">{formatUSD(order.total)}</span>
                    </div>
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
