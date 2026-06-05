import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { requireAuth } from '@/lib/dal'
import { getOrders } from '@/server/queries/orders'
import { OrdersList } from './_components/orders-list'
import { Reveal } from '@/components/shared/reveal'

export const metadata: Metadata = { title: 'My orders' }

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await requireAuth().catch(() => null)
  if (!session) redirect('/auth/login?next=/orders')

  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))

  const { orders, total, pageSize } = await getOrders(session.user.id, page)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Reveal as="div" className="mb-8" threshold={0.1}>
        <h1 className="font-serif text-3xl font-600 text-[var(--text-primary)]">My orders</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {total === 0
            ? 'No orders yet'
            : total === 1
              ? '1 order'
              : `${total} orders`}
        </p>
      </Reveal>

      <OrdersList orders={orders} />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Order history pages"
          className="mt-8 flex items-center justify-between"
        >
          <Link
            href={page > 1 ? `/orders?page=${page - 1}` : '#'}
            aria-disabled={page <= 1}
            aria-label="Previous page"
            className={[
              'flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-500 transition-colors',
              page <= 1
                ? 'pointer-events-none border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>

          <p className="text-sm text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </p>

          <Link
            href={page < totalPages ? `/orders?page=${page + 1}` : '#'}
            aria-disabled={page >= totalPages}
            aria-label="Next page"
            className={[
              'flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-500 transition-colors',
              page >= totalPages
                ? 'pointer-events-none border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      )}
    </div>
  )
}
