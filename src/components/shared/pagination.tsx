'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  pageCount: number
}

export function Pagination({ page, pageCount }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pageCount <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = buildPages(page, pageCount)

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-1"
    >
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-[var(--text-muted)]"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-500 transition-colors',
              p === page
                ? 'bg-[var(--brand-primary)] text-white'
                : 'border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]

  if (current > 3) pages.push('…')

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }

  if (current < total - 2) pages.push('…')

  pages.push(total)
  return pages
}
