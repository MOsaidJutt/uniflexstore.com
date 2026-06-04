'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SortOption } from '@/types/catalog'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
]

interface SortSelectProps {
  current?: string
  total?: number
  className?: string
}

export function SortSelect({ current = 'newest', total, className }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {total != null && (
        <p className="text-sm text-[var(--text-muted)]">
          <span className="font-600 text-[var(--text-primary)]">{total}</span>
          {' '}product{total !== 1 ? 's' : ''}
        </p>
      )}

      <div className="ml-auto flex items-center gap-2.5">
        <label className="hidden text-xs text-[var(--text-muted)] sm:inline">Sort by</label>
        <Select value={current} onValueChange={handleChange}>
          <SelectTrigger className="h-9 w-[180px] rounded-lg border-[var(--border-default)] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
