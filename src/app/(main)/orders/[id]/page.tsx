import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, Truck } from 'lucide-react'
import { requireAuth } from '@/lib/dal'
import { getOrderById } from '@/server/actions/orders'
import { formatUSD } from '@/lib/utils'
import { OrderStatusBadge } from '../_components/order-status-badge'
import { StatusTimeline } from './_components/status-timeline'
import { CancelOrderButton } from './_components/cancel-order-button'
import { ReturnRequestForm } from './_components/return-request-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return { title: `Order #${id.slice(-8).toUpperCase()}` }
}

const SHIPPING_LABEL: Record<string, string> = {
  standard:  'USPS Standard (3–5 days)',
  expedited: 'UPS 2-Day',
  overnight: 'FedEx Overnight',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireAuth().catch(() => null)
  if (!session) redirect(`/auth/login?next=/orders/${id}`)

  const order = await getOrderById(id, session.user.id)
  if (!order) notFound()

  const shippingAddr = order.address ?? (order.shippingAddress as Record<string, string> | null)
  const canCancel    = ['PENDING', 'PROCESSING'].includes(order.status)
  const canReturn    = order.status === 'DELIVERED'
  const isActive     = !['CANCELLED', 'REFUNDED'].includes(order.status)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All orders
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-600 text-[var(--text-primary)]">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Placed{' '}
            {order.createdAt.toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="mt-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 shadow-[var(--shadow-xs)]">
            <h2 className="mb-5 text-sm font-700 uppercase tracking-widest text-[var(--text-muted)]">
              Order status
            </h2>
            <StatusTimeline status={order.status} updatedAt={order.updatedAt} />
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 shadow-[var(--shadow-xs)]">
            <h2 className="mb-4 text-sm font-700 uppercase tracking-widest text-[var(--text-muted)]">
              Items ({order.items.length})
            </h2>
            <ul role="list" className="divide-y divide-[var(--border-subtle)]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="truncate text-sm font-600 text-[var(--text-primary)] hover:underline hover:decoration-[var(--brand-accent)]"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-700 tabular-nums text-[var(--text-primary)]">
                    {formatUSD(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Actions */}
          {(canCancel || canReturn) && (
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 shadow-[var(--shadow-xs)]">
              <h2 className="mb-4 text-sm font-700 uppercase tracking-widest text-[var(--text-muted)]">
                Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                {canCancel && <CancelOrderButton orderId={order.id} />}
                {canReturn && (
                  <ReturnRequestForm
                    orderId={order.id}
                    alreadySubmitted={!!order.returnRequest}
                  />
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order summary */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-700 uppercase tracking-widest text-[var(--text-muted)]">
              <Package className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
              Summary
            </h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatUSD(Number(order.subtotal))}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>Discount{order.couponCode && ` (${order.couponCode})`}</dt>
                  <dd className="tabular-nums">−{formatUSD(Number(order.discount))}</dd>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {Number(order.shippingCost) === 0 ? 'Free' : formatUSD(Number(order.shippingCost))}
                </dd>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatUSD(Number(order.tax))}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2 font-700 text-[var(--text-primary)]">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatUSD(Number(order.total))}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping address */}
          {shippingAddr && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5 shadow-[var(--shadow-xs)]">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-700 uppercase tracking-widest text-[var(--text-muted)]">
                <MapPin className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
                Ship to
              </h2>
              <address className="not-italic text-sm text-[var(--text-secondary)]">
                {(shippingAddr as Record<string, string>).firstName && (
                  <p className="font-600 text-[var(--text-primary)]">
                    {(shippingAddr as Record<string, string>).firstName}{' '}
                    {(shippingAddr as Record<string, string>).lastName}
                  </p>
                )}
                <p>{shippingAddr.line1}</p>
                {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                </p>
                <p>United States</p>
              </address>
              {order.shippingMethod && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {SHIPPING_LABEL[order.shippingMethod] ?? order.shippingMethod}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
