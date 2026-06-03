'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Search, X, ArrowRight, Zap, Shirt, Sparkles, Gamepad2 } from 'lucide-react'

const quickLinks = [
  { label: 'Electronics', href: '/categories/electronics', icon: Zap },
  { label: 'Fashion', href: '/categories/fashion', icon: Shirt },
  { label: 'Beauty', href: '/categories/beauty', icon: Sparkles },
  { label: 'Toys', href: '/categories/toys', icon: Gamepad2 },
]

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open || !modalRef.current) return
    const el = modalRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleTab(e: KeyboardEvent) {
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
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [open])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!query.trim()) return
      // Phase 2 will wire real search; for now navigate to products with query param
      window.location.href = `/products?q=${encodeURIComponent(query.trim())}`
      onClose()
    },
    [query, onClose]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[350] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <m.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[72px] z-[400] w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-base)] shadow-2xl">
              {/* Search input */}
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
                  <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, brands, categories…"
                    aria-label="Search"
                    className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close search"
                    className="ml-1 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <kbd className="rounded border border-[var(--border-default)] px-1.5 py-0.5 font-mono text-[10px]">
                      ESC
                    </kbd>
                  </button>
                </div>
              </form>

              {/* Quick links — shown when no query */}
              {!query && (
                <div className="p-4">
                  <p className="mb-3 text-[11px] font-600 uppercase tracking-widest text-[var(--text-muted)]">
                    Browse categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map(({ label, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                      >
                        <Icon className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Search prompt — shown when query present */}
              {query && (
                <div className="p-4">
                  <button
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--bg-subtle)]"
                  >
                    <span className="text-[var(--text-secondary)]">
                      Search for <strong className="text-[var(--text-primary)]">"{query}"</strong>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  </button>
                  <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                    Full search available in Phase 2
                  </p>
                </div>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
