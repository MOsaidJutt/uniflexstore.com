import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { StarRating } from './star-rating'
import type { ProductReview } from '@/types/catalog'

interface ReviewSectionProps {
  reviews: ProductReview[]
  avgRating: number
  reviewCount: number
}

function ratingBars(reviews: ProductReview[]) {
  const counts = [0, 0, 0, 0, 0] // index 0 = 1 star
  for (const r of reviews) counts[r.rating - 1]++
  return counts.reverse() // 5-star first
}

export function ReviewSection({ reviews, avgRating, reviewCount }: ReviewSectionProps) {
  if (reviewCount === 0) {
    return (
      <section aria-label="Reviews" className="pt-12 border-t border-[var(--border-subtle)]">
        <h2 className="font-serif text-2xl font-600 text-[var(--text-primary)]">Reviews</h2>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          No reviews yet. Be the first to share your experience!
        </p>
      </section>
    )
  }

  const bars = ratingBars(reviews)

  return (
    <section aria-label="Customer reviews" className="border-t border-[var(--border-subtle)] pt-12">
      <h2 className="font-serif text-2xl font-600 text-[var(--text-primary)]">
        Customer Reviews
      </h2>

      {/* Summary */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        {/* Average */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--bg-subtle)] px-8 py-6 text-center sm:w-48 sm:shrink-0">
          <span className="font-serif text-5xl font-700 text-[var(--text-primary)]">
            {avgRating.toFixed(1)}
          </span>
          <StarRating rating={avgRating} size="md" className="mt-2" />
          <span className="mt-1.5 text-xs text-[var(--text-muted)]">
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bars */}
        <div className="flex flex-1 flex-col justify-center gap-2">
          {bars.map((count, i) => {
            const star = 5 - i
            const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-5 text-right text-xs text-[var(--text-muted)]">{star}</span>
                <StarRating rating={1} max={1} size="xs" />
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-7 text-xs text-[var(--text-muted)]">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <ul className="mt-8 space-y-8" role="list">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-b border-[var(--border-subtle)] pb-8 last:border-0"
          >
            {/* Reviewer */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={`Profile photo of ${review.user.name ?? 'reviewer'}`}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-muted)] text-sm font-600 text-[var(--text-secondary)]">
                    {(review.user.name ?? 'A')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-600 text-[var(--text-primary)]">
                    {review.user.name ?? 'Anonymous'}
                  </p>
                  <time
                    dateTime={review.createdAt.toISOString()}
                    className="text-xs text-[var(--text-muted)]"
                  >
                    {review.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>

              <StarRating rating={review.rating} size="sm" />
            </div>

            {/* Content */}
            <div className="mt-3 space-y-1.5">
              {review.title && (
                <p className="font-600 text-[var(--text-primary)]">{review.title}</p>
              )}
              {review.body && (
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{review.body}</p>
              )}
              {review.verified && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[11px] font-500">Verified Purchase</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
