'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/catalog'
import { StarRating } from './star-rating'
import { WishlistButton } from './wishlist-button'

const tagStyle: Record<string, string> = {
  Hot: 'bg-rose-500 text-white',
  New: 'bg-emerald-500 text-white',
  Sale: 'bg-[var(--brand-accent)] text-white',
  Limited: 'bg-amber-600 text-white',
  Featured: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
}

interface ProductCardProps {
  product: ProductCardType
  priority?: boolean
  onQuickView?: (product: ProductCardType) => void
  className?: string
}

export function ProductCard({ product, priority, onQuickView, className }: ProductCardProps) {
  const { name, slug, price, compareAt, images, avgRating, reviewCount, tags, stock } = product

  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : null
  const badge = tags.find((t) => t !== 'Featured') ?? null
  const outOfStock = stock === 0

  return (
    <article className={cn('group relative', className)}>
      {/* ── Image container ─────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-[var(--bg-subtle)]"
        style={{ viewTransitionName: `product-image-${slug}` }}
      >
        <div className="relative aspect-square">
          {images[0]?.url ? (
            <Image
              src={images[0].url}
              alt={images[0].alt ?? name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-muted)]">
              <Package className="h-8 w-8 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
          )}

          {/* Second image crossfade on hover */}
          {images[1]?.url && (
            <Image
              src={images[1].url}
              alt={images[1].alt ?? `${name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="absolute inset-0 object-cover opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] group-hover:opacity-100"
            />
          )}
        </div>

        {/* ── Badges ──────────────────────────────────────── */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {discount != null && (
            <span className="rounded-full bg-[var(--brand-accent)] px-2.5 py-0.5 text-[11px] font-700 text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {badge && !discount && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-700 shadow-sm',
                tagStyle[badge] ?? tagStyle.Featured
              )}
            >
              {badge}
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-600 text-white backdrop-blur-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* ── Hover action bar ─────────────────────────────── */}
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <WishlistButton productId={product.id} size="sm" />
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onQuickView(product)
              }}
              aria-label={`Quick view ${name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-base)]/90 shadow-lg backdrop-blur-sm transition-all duration-150 hover:scale-110 hover:bg-[var(--bg-base)]"
            >
              <Eye className="h-3.5 w-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ── Slide-up CTA ─────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/products/${slug}`}
            className="flex w-full items-center justify-center gap-1.5 bg-[var(--brand-primary)] py-2.5 text-xs font-600 text-white transition-colors duration-150 hover:bg-[var(--brand-secondary)]"
          >
            View product
          </Link>
        </div>
      </div>

      {/* ── Info ─────────────────────────────────────────── */}
      <div className="mt-3 space-y-1">
        <Link
          href={`/products/${slug}`}
          className="line-clamp-2 block text-sm font-500 leading-snug text-[var(--text-primary)] transition-colors duration-150 hover:text-[var(--brand-accent)]"
        >
          {name}
        </Link>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} size="xs" />
            <span className="text-[11px] text-[var(--text-muted)]">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-600 text-[var(--text-primary)]">${price.toFixed(2)}</span>
          {compareAt && (
            <span className="text-sm text-[var(--text-muted)] line-through">
              ${compareAt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
