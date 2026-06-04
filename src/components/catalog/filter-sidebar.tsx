'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { COLOR_MAP, COLOR_VARIANT_NAMES } from '@/lib/color-map'
import type { FilterOptions } from '@/types/catalog'

interface FilterSidebarProps {
  filterOptions: FilterOptions
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Accordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const headingId = `filter-heading-${title.toLowerCase().replace(/\s+/g, '-')}`
  const panelId = `filter-panel-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="border-b border-[var(--border-subtle)] pb-5 pt-4">
      <h3>
        <button
          id={headingId}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between text-sm font-600 text-[var(--text-primary)]"
        >
          {title}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200',
              open ? 'rotate-180' : ''
            )}
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Focus trap hook ──────────────────────────────────────────────────────────

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'
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

// ─── Price inputs (debounced — only apply on blur) ────────────────────────────

function PriceInputs({
  filterOptions,
  onApply,
}: {
  filterOptions: FilterOptions
  onApply: (min: number, max: number) => void
}) {
  const searchParams = useSearchParams()
  const minParam = searchParams.get('minPrice')
  const maxParam = searchParams.get('maxPrice')

  const [localMin, setLocalMin] = useState(
    minParam ? Number(minParam) : filterOptions.priceRange.min
  )
  const [localMax, setLocalMax] = useState(
    maxParam ? Number(maxParam) : filterOptions.priceRange.max
  )

  // Sync if URL changes externally (e.g. "Clear all")
  useEffect(() => {
    setLocalMin(minParam ? Number(minParam) : filterOptions.priceRange.min)
    setLocalMax(maxParam ? Number(maxParam) : filterOptions.priceRange.max)
  }, [minParam, maxParam, filterOptions.priceRange.min, filterOptions.priceRange.max])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
            $
          </span>
          <input
            type="number"
            value={localMin}
            min={filterOptions.priceRange.min}
            max={localMax - 1}
            aria-label="Minimum price"
            onChange={(e) => setLocalMin(Number(e.target.value))}
            onBlur={() => onApply(localMin, localMax)}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] py-1.5 pl-6 pr-2 text-sm text-[var(--text-primary)] focus:border-[var(--brand-accent)] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[var(--text-muted)]">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
            $
          </span>
          <input
            type="number"
            value={localMax}
            min={localMin + 1}
            max={filterOptions.priceRange.max}
            aria-label="Maximum price"
            onChange={(e) => setLocalMax(Number(e.target.value))}
            onBlur={() => onApply(localMin, localMax)}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] py-1.5 pl-6 pr-2 text-sm text-[var(--text-primary)] focus:border-[var(--brand-accent)] focus:outline-none"
          />
        </div>
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">
        Range: ${filterOptions.priceRange.min} – ${filterOptions.priceRange.max}
      </p>
    </div>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function FilterSidebar({ filterOptions }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useFocusTrap(mobileOpen, drawerRef)

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // ── Read filter state from URL (multi-value-safe) ──────────────────────────

  // Collect unique variant keys first to avoid duplicate iteration
  const activeVariants: Record<string, string[]> = {}
  const seenKeys = new Set<string>()
  for (const key of searchParams.keys()) {
    if (key.startsWith('v_') && !seenKeys.has(key)) {
      seenKeys.add(key)
      activeVariants[key.slice(2)] = searchParams.getAll(key)
    }
  }

  const inStock = searchParams.get('inStock') === 'true'

  const hasActiveFilters =
    seenKeys.size > 0 ||
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    inStock

  // Active filter count for mobile badge
  const activeCount =
    Object.values(activeVariants).flat().length +
    (searchParams.has('minPrice') ? 1 : 0) +
    (searchParams.has('maxPrice') ? 1 : 0) +
    (inStock ? 1 : 0)

  // ── URL helpers ────────────────────────────────────────────────────────────

  const pushParams = useCallback(
    (updater: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    // URLSearchParams.delete(key) removes all values for that key
    const filterKeys = new Set<string>()
    for (const key of params.keys()) {
      if (key.startsWith('v_') || key === 'minPrice' || key === 'maxPrice' || key === 'inStock') {
        filterKeys.add(key)
      }
    }
    filterKeys.forEach((k) => params.delete(k))
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleVariant(varName: string, value: string) {
    pushParams((params) => {
      const key = `v_${varName}`
      const current = params.getAll(key)
      // Remove ALL existing values for this key, then re-add the ones we want to keep
      params.delete(key)
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v))
      } else {
        current.forEach((v) => params.append(key, v))
        params.append(key, value)
      }
    })
  }

  function applyPrice(min: number, max: number) {
    pushParams((params) => {
      if (min > filterOptions.priceRange.min) params.set('minPrice', String(min))
      else params.delete('minPrice')
      if (max < filterOptions.priceRange.max) params.set('maxPrice', String(max))
      else params.delete('maxPrice')
    })
  }

  function toggleInStock() {
    pushParams((params) => {
      if (params.get('inStock') === 'true') params.delete('inStock')
      else params.set('inStock', 'true')
    })
  }

  // ── Sidebar content ────────────────────────────────────────────────────────

  const sidebarContent = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm font-600 text-[var(--text-primary)]">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex min-h-[32px] items-center gap-1 rounded px-2 text-xs text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {/* Availability */}
      <Accordion title="Availability" defaultOpen>
        <label className="flex cursor-pointer items-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={inStock}
            onChange={toggleInStock}
            className="h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--brand-accent)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">In Stock Only</span>
        </label>
      </Accordion>

      {/* Price */}
      <Accordion title="Price">
        <PriceInputs filterOptions={filterOptions} onApply={applyPrice} />
      </Accordion>

      {/* Variant filters */}
      {Object.entries(filterOptions.variants).map(([varName, values]) => {
        const isColor = COLOR_VARIANT_NAMES.has(varName)
        const active = activeVariants[varName] ?? []

        return (
          <Accordion key={varName} title={varName}>
            {isColor ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label={`${varName} options`}>
                {values.map((val) => {
                  const hex = COLOR_MAP[val]
                  const checked = active.includes(val)
                  return (
                    <button
                      key={val}
                      onClick={() => toggleVariant(varName, val)}
                      aria-label={`${val}${checked ? ' (selected)' : ''}`}
                      aria-pressed={checked}
                      title={val}
                      className={cn(
                        // h-10 w-10 = 40px — above WCAG 2.2 SC 2.5.8 24px minimum
                        'h-10 w-10 rounded-full border-2 transition-all duration-150',
                        checked
                          ? 'border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)] ring-offset-1'
                          : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                      )}
                      style={{ backgroundColor: hex ?? '#ccc' }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2" role="group" aria-label={`${varName} options`}>
                {values.map((val) => {
                  const checked = active.includes(val)
                  return (
                    <label key={val} className="flex cursor-pointer items-center gap-2.5 py-0.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVariant(varName, val)}
                        className="h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--brand-accent)]"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">{val}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </Accordion>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile filter trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label={`Open filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
        aria-haspopup="dialog"
        className="mb-4 flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span
            aria-hidden="true"
            className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-accent)] text-[9px] font-700 text-white"
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <m.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[400] w-80 overflow-y-auto bg-[var(--bg-base)] p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-serif text-lg font-600">Filters</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-subtle)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {sidebarContent}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block" aria-label="Product filters">
        {sidebarContent}
      </aside>
    </>
  )
}
