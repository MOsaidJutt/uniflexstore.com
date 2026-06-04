'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import type { ProductVariantData } from '@/types/catalog'
import { VariantSelector } from '@/components/catalog/variant-selector'
import { AddToCartButton } from '@/components/catalog/add-to-cart-button'
import { WishlistButton } from '@/components/catalog/wishlist-button'

interface PDPActionsProps {
  productId: string
  slug: string
  basePrice: number
  compareAt: number | null
  stock: number
  variants: ProductVariantData[]
}

export function PDPActions({
  productId,
  basePrice,
  compareAt,
  stock,
  variants,
}: PDPActionsProps) {
  const [variantPrice, setVariantPrice] = useState<number | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [variantStock, setVariantStock] = useState<number | null>(null)

  const displayPrice = variantPrice ?? basePrice
  const discount = compareAt ? Math.round((1 - displayPrice / compareAt) * 100) : null

  // When a variant is selected, use its individual stock; otherwise fall back to product stock
  const effectiveStock = variantStock !== null ? variantStock : stock

  function handleVariantChange(
    _selected: Record<string, string>,
    varId: string | null,
    price: number | null,
  ) {
    setSelectedVariantId(varId)
    setVariantPrice(price)
    // Look up the selected variant's stock from the variants array
    const variant = varId ? variants.find((v) => v.id === varId) : null
    setVariantStock(variant?.stock ?? null)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live price */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl font-700 text-[var(--text-primary)]">
          ${displayPrice.toFixed(2)}
        </span>
        {compareAt && (
          <span className="text-lg text-[var(--text-muted)] line-through">
            ${compareAt.toFixed(2)}
          </span>
        )}
        {discount != null && (
          <span className="rounded-full bg-[var(--brand-accent)] px-2.5 py-0.5 text-sm font-600 text-white">
            Save {discount}%
          </span>
        )}
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <VariantSelector
          variants={variants}
          basePrice={basePrice}
          onChange={handleVariantChange}
        />
      )}

      {/* Stock status — uses variant stock when a variant is selected */}
      {effectiveStock === 0 ? (
        <p className="font-500 text-rose-600">Out of stock</p>
      ) : effectiveStock <= 5 ? (
        <p className="text-sm font-500 text-amber-600">
          Only {effectiveStock} left in stock — order soon
        </p>
      ) : (
        <p className="text-sm text-emerald-600">In stock · Ready to ship</p>
      )}

      {/* CTA row */}
      <div className="flex items-center gap-3">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          stock={effectiveStock}
          size="lg"
          className="flex-1"
        />
        <WishlistButton productId={productId} size="md" />
        <button
          onClick={handleShare}
          aria-label="Share product"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
