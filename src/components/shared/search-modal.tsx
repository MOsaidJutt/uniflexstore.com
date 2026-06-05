'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { m, AnimatePresence } from 'motion/react'
import { Search, X, ArrowRight, Zap, Shirt, Sparkles, Gamepad2, Tag } from 'lucide-react'
import type { SearchSuggestion } from '@/types/catalog'

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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60)
    } else {
      setQuery('')
      setSuggestions([])
    }
  }, [open])

  // Keyboard: Escape closes; ArrowDown/Up move through suggestions; Enter selects
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault()
        router.push(suggestions[selectedIndex].href)
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, suggestions, selectedIndex, router])

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
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [open, suggestions])

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`)
        const data: SearchSuggestion[] = await res.json()
        setSuggestions(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Reset keyboard selection when the suggestions list is replaced
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!query.trim()) return
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
    },
    [query, router, onClose]
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
              {/* Input */}
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
                    aria-autocomplete="list"
                    aria-controls="search-suggestions"
                    aria-activedescendant={selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined}
                    className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                  {loading && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--brand-accent)]" />
                  )}
                  {query && !loading && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setSuggestions([]) }}
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

              {/* Quick links — no query */}
              {!query && (
                <div className="p-4">
                  <p className="mb-3 text-xs font-600 text-[var(--text-secondary)]">
                    Browse categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map(({ label, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                      >
                        <Icon className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {query && suggestions.length > 0 && (
                <ul id="search-suggestions" role="listbox" className="py-2">
                  {suggestions.map((s, i) => (
                    <li
                      key={s.href}
                      id={`search-option-${i}`}
                      role="option"
                      aria-selected={i === selectedIndex}
                    >
                      <a
                        href={s.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${i === selectedIndex ? 'bg-[var(--bg-subtle)]' : 'hover:bg-[var(--bg-subtle)]'}`}
                      >
                        {s.type === 'product' && s.image ? (
                          <Image
                            src={s.image}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                            <Tag className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                          </span>
                        )}
                        <span className="flex-1 text-[var(--text-primary)]">{s.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)] capitalize">{s.type}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Full search prompt */}
              {query && (
                <div className="border-t border-[var(--border-subtle)] px-4 py-3">
                  <button
                    onClick={() => handleSubmit()}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-subtle)]"
                  >
                    <span className="text-[var(--text-secondary)]">
                      Search all results for{' '}
                      <strong className="text-[var(--text-primary)]">&ldquo;{query}&rdquo;</strong>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  </button>
                </div>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
