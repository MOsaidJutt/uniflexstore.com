'use client'

import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  productId: string
  variantId?: string | null
  stock?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddToCartButton({
  stock = 0,
  size = 'md',
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const outOfStock = stock === 0

  const handleClick = () => {
    if (outOfStock || added) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      disabled={outOfStock}
      aria-label={outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-600 transition-all duration-200',
        size === 'sm' && 'px-4 py-2.5 text-sm',
        size === 'md' && 'px-6 py-3.5 text-sm',
        size === 'lg' && 'w-full px-8 py-4 text-base',
        outOfStock
          ? 'cursor-not-allowed bg-[var(--bg-muted)] text-[var(--text-muted)]'
          : added
            ? 'bg-emerald-600 text-white'
            : 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] active:scale-[0.98]',
        className
      )}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Added!
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </button>
  )
}
