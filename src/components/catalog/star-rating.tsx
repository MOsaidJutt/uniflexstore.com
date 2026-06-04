import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'xs' | 'sm' | 'md'
  showValue?: boolean
  className?: string
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  showValue = false,
  className,
}: StarRatingProps) {
  const full = Math.floor(rating)
  const fraction = rating - full
  const hasFraction = fraction >= 0.25 && fraction < 0.75
  const nearFull = fraction >= 0.75

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const isFull = i < full || (i === full && nearFull)
        const isHalf = i === full && hasFraction && !nearFull
        return (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              sizeMap[size],
              isFull
                ? 'fill-amber-400 text-amber-400'
                : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-none text-[var(--border-strong)]'
            )}
          />
        )
      })}
      {showValue && (
        <span className="ml-1 text-xs text-[var(--text-muted)]">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}
