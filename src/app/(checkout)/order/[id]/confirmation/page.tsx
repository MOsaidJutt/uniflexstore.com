import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, MapPin, Clock, ArrowRight } from 'lucide-react'
import { db } from '@/server/db'
import { getSession } from '@/lib/dal'
import { formatUSD } from '@/lib/utils'
import { ClearGuestCart } from './clear-guest-cart'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
}

interface Params { id: string }
interface SearchParams { payment_intent?: string }

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params
  const { payment_intent } = await searchParams
  const session = await getSession()
  const userId = session?.user?.id ?? null

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
    },
  })

  if (!order) notFound()

  // Authorization: registered owner OR guest arriving via Stripe's payment_intent param
  const isOwner = order.userId != null && userId === order.userId
  const isGuestWithToken =
    order.userId == null && payment_intent != null && order.stripePaymentId === payment_intent

  if (!isOwner && !isGuestWithToken) notFound()

  const shippingAddr = order.address ?? (order.shippingAddress as Record<string, string> | null)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Clear guest localStorage cart on mount */}
      <ClearGuestCart />

      {/* Success header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-3xl font-600 text-[var(--text-primary)]">Order confirmed!</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Thank you for your purchase.{' '}
          {order.guestEmail && (
            <>
              A confirmation will be sent to{' '}
              <span className="font-500 text-[var(--text-primary)]">{order.guestEmail}</span>.
            </>
          )}
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
          Order #{order.id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Status banner */}
      <div className="mb-8 flex items-center gap-3 rounded-xl bg-[var(--brand-teal-light)] px-5 py-4">
        <Clock className="h-5 w-5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-600 text-[var(--text-primary)]">
            {order.status === 'PROCESSING'
              ? 'Your order is being processed'
              : order.status === 'PENDING'
                ? 'Payment is being verified'
                : `Status: ${order.status}`}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            We&apos;ll email you when your order ships.
          </p>
        </div>
      </div>

      {/* Items */}
      <section className="mb-8">
        <h2 className="mb-4 font-600 text-[var(--text-primary)]">
          Items ordered ({order.items.length})
        </h2>
        <ul
          role="list"
          className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]"
        >
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-subtle)]">
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-500 text-[var(--text-primary)]">
                  {item.product.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
              </div>
              <span className="shrink-0 text-sm font-600 tabular-nums text-[var(--text-primary)]">
                {formatUSD(Number(item.price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals + shipping address */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-subtle)] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-600 text-[var(--text-primary)]">
            <Package className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
            Order total
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatUSD(Number(order.subtotal))}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <dt>Discount</dt>
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

        {shippingAddr && (
          <div className="rounded-xl border border-[var(--border-subtle)] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-600 text-[var(--text-primary)]">
              <MapPin className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
              Shipping to
            </h2>
            <address className="not-italic text-sm text-[var(--text-secondary)]">
              {shippingAddr.line1}
              {shippingAddr.line2 && <>, {shippingAddr.line2}</>}
              <br />
              {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
              <br />
              United States
            </address>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              via{' '}
              {order.shippingMethod === 'overnight'
                ? 'FedEx Overnight'
                : order.shippingMethod === 'expedited'
                  ? 'UPS 2-Day'
                  : 'USPS Standard'}
            </p>
          </div>
        )}
      </div>

      {/* CTAs — "View my orders" hidden for guest orders */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)] sm:w-auto"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        {order.userId && (
          <Link
            href="/account"
            className="flex w-full items-center justify-center rounded-xl border border-[var(--border-default)] px-6 py-3.5 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] sm:w-auto"
          >
            View my orders
          </Link>
        )}
      </div>
    </div>
  )
}
