import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, Truck, ExternalLink } from 'lucide-react'
import { requireAuth } from '@/lib/dal'
import { getOrderById } from '@/server/queries/orders'
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

      {/* Two-column layout — collapses at md breakpoint (tablet portrait) */}
      <div className="grid gap-6 md:grid-cols-[1fr_296px]">
        {/* Left column */}
        <div className="space-y-6">

          {/* Status timeline — primary card, stronger border */}
          <section
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-base)] p-6 shadow-[var(--shadow-sm)]"
            aria-labelledby="section-status"
          >
            <h2 id="section-status" className="mb-5 text-base font-700 text-[var(--text-primary)]">
              Order status
            </h2>
            <StatusTimeline status={order.status} updatedAt={order.updatedAt} />

            {/* Tracking info — shown when shipped */}
            {order.status === 'SHIPPED' && order.trackingNumber && (
              <div className="mt-5 rounded-xl bg-[var(--brand-teal-light)] px-4 py-3.5">
                <p className="text-xs font-700 text-[var(--brand-accent)]">
                  Tracking number
                </p>
                <p className="mt-1 font-mono text-sm font-600 text-[var(--text-primary)]">
                  {order.trackingNumber}
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--brand-accent)] hover:underline"
                  >
                    Track package
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </section>

          {/* Items — borderless, divider rhythm */}
          <section aria-labelledby="section-items">
            <h2 id="section-items" className="mb-3 text-sm font-600 text-[var(--text-secondary)]">
              {order.items.length === 1 ? '1 item' : `${order.items.length} items`}
            </h2>
            <ul
              role="list"
              className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]"
            >
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4 first:pt-4 last:pb-4">
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
                      title={item.product.name}
                      className="block truncate text-sm font-600 text-[var(--text-primary)] hover:underline hover:decoration-[var(--brand-accent)]"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-700 tabular-nums text-[var(--text-primary)]">
                    {formatUSD(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Actions — no card wrapper, buttons are self-describing */}
          {(canCancel || canReturn) && (
            <section aria-label="Order actions">
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

        {/* Right column — tinted compact cards, no border */}
        <div className="space-y-4">

          {/* Order summary */}
          <div className="rounded-2xl bg-[var(--bg-subtle)] p-5">
            <h2 className="mb-3 text-sm font-600 text-[var(--text-secondary)]">Order total</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatUSD(Number(order.subtotal))}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[var(--text-success)]">
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
                <dt>Sales tax</dt>
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
            <div className="rounded-2xl bg-[var(--bg-subtle)] p-5">
              <h2 className="mb-3 text-sm font-600 text-[var(--text-secondary)]">Shipping address</h2>
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
