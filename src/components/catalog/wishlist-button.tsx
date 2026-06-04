'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  initialState?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function WishlistButton({
  initialState = false,
  size = 'md',
  className,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialState)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setWishlisted((v) => !v)
      }}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={wishlisted}
      className={cn(
        'flex items-center justify-center rounded-full bg-[var(--bg-base)]/90 shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-110 hover:bg-[var(--bg-base)] active:scale-95',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          'transition-all duration-150',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          wishlisted ? 'fill-rose-500 text-rose-500' : 'fill-none text-[var(--text-secondary)]'
        )}
      />
    </button>
  )
}
