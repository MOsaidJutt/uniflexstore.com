'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, ArrowRight, Package } from 'lucide-react'
import { m, AnimatePresence, LayoutGroup } from 'motion/react'
import { useCart } from '@/hooks/use-cart'
import { CartItemRow } from './cart-item-row'
import { FREE_SHIPPING_THRESHOLD } from '@/types/checkout'
import { cartDrawer } from '@/lib/motion'
import { formatUSD } from '@/lib/utils'

// ─── Focus trap ───────────────────────────────────────────────────────────────
// Cycles Tab / Shift+Tab within the drawer element. Same pattern as header.tsx.

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
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
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [active, ref])
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { state, closeCart, itemCount, subtotal } = useCart()
  const { isOpen, items } = state

  const drawerRef = useRef<HTMLElement>(null)
  // Save the element that triggered the open so we can restore focus on close
  const returnFocusRef = useRef<Element | null>(null)

  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement
    } else {
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Escape key closes the drawer
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closeCart])

  useFocusTrap(isOpen, drawerRef)

  const shippingProgress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1)
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[350] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.aside
            key="cart-drawer"
            ref={drawerRef}
            variants={cartDrawer}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-[400] flex w-full max-w-sm flex-col bg-[var(--bg-base)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
                <span className="font-600 text-[var(--text-primary)]">
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-1.5 text-sm font-400 text-[var(--text-muted)]">
                      ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && (
              <div className="shrink-0 border-b border-[var(--border-subtle)] px-5 py-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  {freeShipping ? (
                    <span className="font-500 text-[var(--success)]">
                      You qualify for free standard shipping!
                    </span>
                  ) : (
                    <span>
                      Add{' '}
                      <span className="font-600 text-[var(--text-primary)]">
                        {formatUSD(remaining)}
                      </span>{' '}
                      more for free shipping
                    </span>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <m.div
                    className="h-full rounded-full bg-[var(--brand-accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-subtle)]">
                    <Package className="h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-500 text-[var(--text-primary)]">Your cart is empty</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Add items to get started.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-2 text-sm font-500 text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
                  >
                    Continue shopping →
                  </button>
                </div>
              ) : (
                <LayoutGroup>
                  <m.div layout className="divide-y divide-[var(--border-subtle)]">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <CartItemRow
                          key={`${item.productId}-${item.variantId ?? 'base'}`}
                          item={item}
                        />
                      ))}
                    </AnimatePresence>
                  </m.div>
                </LayoutGroup>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-[var(--border-subtle)] px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-base font-700 tabular-nums text-[var(--text-primary)]">
                    {formatUSD(subtotal)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-[var(--text-muted)]">
                  Shipping &amp; taxes calculated at checkout.
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-600 text-white transition-colors duration-200 hover:bg-[var(--brand-secondary)]"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-3 flex w-full items-center justify-center text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Continue shopping
                </Link>
              </div>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  )
}
