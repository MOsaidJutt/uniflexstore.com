'use client'

import Link from 'next/link'
import Image from 'next/image'
import { m } from 'motion/react'
import { ShoppingBag, ChevronRight, Package } from 'lucide-react'
import { formatUSD, decimalToNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { OrderStatusBadge } from './order-status-badge'

type OrderRow = {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  total: number | string | { toNumber(): number }
  createdAt: Date
  items: {
    id: string
    quantity: number
    product: {
      name: string
      slug: string
      images: { url: string }[]
    }
  }[]
}

interface Props {
  orders: OrderRow[]
}

export function OrdersList({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
          <ShoppingBag className="h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-600 text-[var(--text-primary)]">No orders yet</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            When you place an order, it will appear here.
          </p>
        </div>
        <Link
          href="/products"
          className="mt-2 rounded-xl bg-[var(--brand-accent)] px-6 py-3 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-accent-hover)]"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <m.ul
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      role="list"
      className="space-y-3"
    >
      {orders.map((order) => {
        const firstImage = order.items[0]?.product.images[0]
        const extraCount = order.items.length - 1

        return (
          <m.li key={order.id} variants={staggerItem}>
            <Link
              href={`/orders/${order.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5 shadow-[var(--shadow-xs)] transition-all duration-200 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]"
              aria-label={`Order ${order.id.slice(-8).toUpperCase()}, ${order.items.map(i => i.product.name).join(', ')}, ${order.status.charAt(0) + order.status.slice(1).toLowerCase()}`}
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                {firstImage ? (
                  <Image
                    src={firstImage.url}
                    alt={order.items[0].product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-6 w-6 text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                )}
                {extraCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                    <span className="text-xs font-700 text-white">+{extraCount}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1" aria-hidden="true">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-600 text-[var(--text-primary)]">
                      {order.items.map((i) => i.product.name).join(', ')}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {order.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                      {' · '}
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-700 tabular-nums text-[var(--text-primary)]">
                      {formatUSD(decimalToNumber(order.total))}
                    </p>
                    <OrderStatusBadge status={order.status} className="mt-1.5" />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </m.li>
        )
      })}
    </m.ul>
  )
}
