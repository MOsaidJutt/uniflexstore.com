import { AdminTopbar } from '@/components/admin/topbar'
import { Badge } from '@/components/ui/badge'
import { getAdminOrders } from '@/server/queries/admin/orders'
import { formatUSD } from '@/lib/utils'
import Link from 'next/link'
import { OrdersTable } from './_components/orders-table'
import type { OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : undefined
  const page = parseInt(params.page ?? '1')

  const { orders, total, pages } = await getAdminOrders({ status, search: params.search, page })

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Orders" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />

      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Orders</h1>
            <p className="text-sm text-[var(--text-muted)]">{total} total orders</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Link
            href="/admin/orders"
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${!status ? 'bg-[var(--brand-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${status === s ? 'bg-[var(--brand-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}
            >
              {s}
            </Link>
          ))}
        </div>

        <OrdersTable
          orders={orders}
          total={total}
          page={page}
          pages={pages}
          search={params.search ?? ''}
          currentStatus={status}
        />
      </main>
    </div>
  )
}
