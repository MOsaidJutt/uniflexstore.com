'use client'

import { useState } from 'react'
import { m } from 'motion/react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ProductCard as ProductCardType } from '@/types/catalog'
import { ProductCard } from './product-card'
import { QuickViewModal } from './quick-view-modal'
import { gridReveal, cardReveal } from '@/lib/motion'

interface ProductGridProps {
  products: ProductCardType[]
  columns?: 2 | 3 | 4
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] px-6 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)]">
          <ShoppingBag className="h-6 w-6 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
        <p className="font-serif text-xl font-semibold text-[var(--text-primary)]">
          No products found
        </p>
        <p className="mt-2 max-w-[32ch] text-sm text-[var(--text-muted)]">
          Try adjusting your filters, or browse the full catalog.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)]"
        >
          Browse all products
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns]

  return (
    <>
      <m.ul
        role="list"
        variants={gridReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className={`grid gap-x-4 gap-y-8 ${colClass}`}
      >
        {products.map((product, i) => (
          <m.li key={product.id} variants={cardReveal}>
            <ProductCard
              product={product}
              priority={i < 4}
              onQuickView={setQuickViewProduct}
            />
          </m.li>
        ))}
      </m.ul>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  )
}
