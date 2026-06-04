'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { m, AnimatePresence } from 'motion/react'
import type { ProductCard } from '@/types/catalog'
import { StarRating } from './star-rating'
import { AddToCartButton } from './add-to-cart-button'
import { WishlistButton } from './wishlist-button'

interface QuickViewModalProps {
  product: ProductCard | null
  onClose: () => void
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Keyboard handling: Escape to close, Tab trap
  useEffect(() => {
    if (!product) return

    // Move focus to close button on open
    const id = setTimeout(() => closeButtonRef.current?.focus(), 30)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [product, onClose])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [product])

  const discount =
    product?.compareAt != null
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : null

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <m.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[500] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl bg-[var(--bg-base)] shadow-2xl">
              {/* Close */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close quick view"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-subtle)] transition-colors hover:bg-[var(--bg-muted)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="grid sm:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square bg-[var(--bg-subtle)]">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  {discount != null && (
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--brand-accent)] px-2 py-0.5 text-[11px] font-600 text-white">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <h2 className="font-serif text-xl font-600 leading-snug text-[var(--text-primary)]">
                      {product.name}
                    </h2>
                    {product.reviewCount > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <StarRating rating={product.avgRating} size="xs" />
                        <span className="text-xs text-[var(--text-muted)]">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-700 text-[var(--text-primary)]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAt && (
                      <span className="text-sm text-[var(--text-muted)] line-through">
                        ${product.compareAt.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {product.stock === 0 && (
                    <p className="text-sm font-500 text-rose-600">Out of stock</p>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs font-500 text-amber-600">Only {product.stock} left!</p>
                  )}

                  <div className="flex items-center gap-2">
                    <AddToCartButton
                      productId={product.id}
                      stock={product.stock}
                      size="md"
                      className="flex-1"
                    />
                    <WishlistButton productId={product.id} />
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 text-sm font-500 text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
                  >
                    View full details
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
