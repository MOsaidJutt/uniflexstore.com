'use client'

import Image from 'next/image'
import { ChevronDown, Lock, RotateCcw, Shield } from 'lucide-react'
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import type { LocalCartItem } from '@/types/cart'
import type { ShippingMethod } from '@/types/checkout'
import { FREE_SHIPPING_THRESHOLD } from '@/types/checkout'
import { formatUSD } from '@/lib/utils'

interface OrderSummaryProps {
  items: LocalCartItem[]
  subtotal: number
  shippingMethod: ShippingMethod | null
  couponCode: string
  couponDiscount: number
  tax: number
}

export function OrderSummary({
  items,
  subtotal,
  shippingMethod,
  couponCode,
  couponDiscount,
  tax,
}: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const summaryId = 'order-summary-items'

  const shipping = shippingMethod
    ? subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod.id === 'standard'
      ? 0
      : shippingMethod.price
    : null

  const discountedSubtotal = Math.max(subtotal - couponDiscount, 0)
  const total = discountedSubtotal + (shipping ?? 0) + tax

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-6">
      {/* Mobile toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={summaryId}
        className="flex w-full items-center justify-between lg:hidden"
      >
        <span className="text-sm font-600 text-[var(--text-primary)]">
          Order summary ({items.length} item{items.length !== 1 ? 's' : ''})
        </span>
        <div className="flex items-center gap-2 text-sm font-700 text-[var(--text-primary)]">
          {formatUSD(total)}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Items — always visible on desktop, collapsible on mobile */}
      <div className="hidden lg:block">
        <h2 className="mb-4 text-sm font-600 text-[var(--text-primary)]">Order summary</h2>
        <SummaryItems items={items} />
      </div>

      <AnimatePresence>
        {expanded && (
          <m.div
            id={summaryId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mt-4">
              <SummaryItems items={items} />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Totals */}
      <div className="mt-4 space-y-2 border-t border-[var(--border-default)] pt-4 text-sm">
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatUSD(subtotal)}</span>
        </div>

        {couponCode && couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount ({couponCode})</span>
            <span className="tabular-nums">−{formatUSD(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Shipping</span>
          {shipping === null ? (
            <span className="text-[var(--text-muted)]">Calculated next</span>
          ) : shipping === 0 ? (
            <span className="font-500 text-emerald-600 dark:text-emerald-400">Free</span>
          ) : (
            <span className="tabular-nums">{formatUSD(shipping)}</span>
          )}
        </div>

        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Tax (est.)</span>
          {tax > 0 ? (
            <span className="tabular-nums">{formatUSD(tax)}</span>
          ) : (
            <span className="text-[var(--text-muted)]">Calculated next</span>
          )}
        </div>

        <div className="flex justify-between border-t border-[var(--border-default)] pt-3 text-base font-700 text-[var(--text-primary)]">
          <span>Total</span>
          <span className="tabular-nums">{formatUSD(total)}</span>
        </div>
      </div>

      {/* Trust signals */}
      <div className="mt-5 flex items-center justify-center gap-5">
        {[
          { icon: Lock, label: 'SSL Secured' },
          { icon: RotateCcw, label: 'Free Returns' },
          { icon: Shield, label: 'Buyer Protection' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Icon className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryItems({ items }: { items: LocalCartItem[] }) {
  return (
    <ul className="space-y-3" role="list">
      {items.map((item) => (
        <li
          key={`${item.productId}-${item.variantId ?? 'base'}`}
          className="flex items-center gap-3"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-muted)]">
            {item.image && (
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
            )}
            <span
              aria-label={`Quantity: ${item.quantity}`}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-accent)] text-[10px] font-600 text-white"
            >
              {item.quantity}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-500 text-[var(--text-primary)]">{item.name}</p>
            {item.variantValue && (
              <p className="text-[11px] text-[var(--text-muted)]">{item.variantValue}</p>
            )}
          </div>
          <span className="shrink-0 text-xs font-600 tabular-nums text-[var(--text-primary)]">
            {formatUSD(item.price * item.quantity)}
          </span>
        </li>
      ))}
    </ul>
  )
}
