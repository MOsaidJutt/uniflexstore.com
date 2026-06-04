'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { m } from 'motion/react'
import { useCart } from '@/hooks/use-cart'
import type { LocalCartItem } from '@/types/cart'
import { formatUSD } from '@/lib/utils'

interface CartItemRowProps {
  item: LocalCartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart()

  const lineTotal = item.price * item.quantity

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
      className="flex gap-4 py-4"
    >
      {/* Image */}
      <Link
        href={`/products/${item.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-subtle)]"
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        )}
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-500 text-[var(--text-primary)] hover:text-[var(--brand-accent)] transition-colors"
          >
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item.productId, item.variantId)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {item.variantValue && (
          <p className="text-xs text-[var(--text-muted)]">
            {item.variantName}: {item.variantValue}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          {/* Quantity stepper */}
          <div className="flex h-9 items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)]">
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-l-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
            </button>
            <span className="min-w-[28px] text-center text-sm font-500 tabular-nums text-[var(--text-primary)]">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-r-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-40"
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-600 tabular-nums text-[var(--text-primary)]">
            {formatUSD(lineTotal)}
          </span>
        </div>
      </div>
    </m.div>
  )
}
