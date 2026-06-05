import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/dal'
import { getOrders } from '@/server/actions/orders'
import { OrdersList } from './_components/orders-list'

export const metadata: Metadata = { title: 'My orders' }

export default async function OrdersPage() {
  const session = await requireAuth().catch(() => null)
  if (!session) redirect('/auth/login?next=/orders')

  const orders = await getOrders(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-600 text-[var(--text-primary)]">My orders</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {orders.length === 0
            ? 'No orders yet'
            : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      <OrdersList orders={orders} />
    </div>
  )
}
