'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m, AnimatePresence } from 'motion/react'
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Zap,
  Shirt,
  Sparkles,
  Gamepad2,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { categories } from '@/config/site'
import { cn } from '@/lib/utils'
import { megaMenuPanel, mobileMenuDrawer, staggerContainer, staggerItem } from '@/lib/motion'
import { SearchModal } from '@/components/shared/search-modal'
import { useCart } from '@/hooks/use-cart'

const categoryIcons = {
  electronics: Zap,
  fashion: Shirt,
  beauty: Sparkles,
  toys: Gamepad2,
}

// ─── Theme Toggle ────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--bg-subtle)]"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'absolute h-4 w-4 transition-all duration-200',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute h-4 w-4 transition-all duration-200',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
      />
    </button>
  )
}

// ─── Focus Trap Hook ─────────────────────────────────────────────────────────

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
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

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header({ userButton }: { userButton?: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const { itemCount, openCart } = useCart()
  const cartCount = itemCount

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Body scroll lock for mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Clean up close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  // Keyboard: close mobile on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileOpen])

  useFocusTrap(mobileOpen, drawerRef)

  const handleCategoryEnter = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveCategory(slug)
  }, [])

  const handleCategoryLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveCategory(null), 120)
  }, [])

  const handleMenuEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const activeData = categories.find((c) => c.slug === activeCategory)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[200] w-full transition-all duration-500',
          scrolled
            ? 'border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 shadow-[0_1px_20px_-4px_rgba(29,170,188,0.08)] backdrop-blur-2xl'
            : 'bg-[var(--bg-base)]/0 backdrop-blur-none'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 transition-opacity duration-150 hover:opacity-80"
            aria-label="UniFlex Global — Home"
          >
            <Image
              src="/logo.png"
              alt="UniFlex Global"
              width={160}
              height={48}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center lg:flex" aria-label="Main navigation">
            <ul className="flex items-center gap-1" role="list">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.slug as keyof typeof categoryIcons]
                const isOpen = activeCategory === cat.slug
                return (
                  <li key={cat.slug}>
                    <button
                      onMouseEnter={() => handleCategoryEnter(cat.slug)}
                      onMouseLeave={handleCategoryLeave}
                      onFocus={() => handleCategoryEnter(cat.slug)}
                      onBlur={handleCategoryLeave}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      aria-controls={`mega-menu-${cat.slug}`}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-500 transition-colors duration-150',
                        isOpen
                          ? 'text-[var(--brand-accent)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                      {cat.name}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'h-3 w-3 transition-transform duration-200',
                          isOpen ? 'rotate-180' : ''
                        )}
                      />
                    </button>
                  </li>
                )
              })}
              <li>
                <Link
                  href="/deals"
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-600 text-[var(--brand-accent)] transition-colors duration-150 hover:text-[var(--brand-accent-hover)]"
                >
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Deals
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              aria-haspopup="dialog"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            <ThemeToggle />

            {userButton ?? (
              <Link
                href="/auth/login"
                aria-label="Sign in"
                className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--bg-subtle)] sm:flex"
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}

            <button
              onClick={openCart}
              aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : 'Open cart'}
              className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {cartCount > 0 && (
                <m.span
                  key={cartCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-accent)] text-[9px] font-600 text-white"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </m.span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--bg-subtle)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {activeCategory && activeData && (
            <m.div
              key={activeCategory}
              id={`mega-menu-${activeCategory}`}
              role="region"
              aria-label={`${activeData.name} subcategories`}
              variants={megaMenuPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleCategoryLeave}
              className="absolute left-0 right-0 top-full z-[100] border-b border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-xl"
            >
              <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
                  {/* Category intro */}
                  <div>
                    <h2 className="font-serif text-2xl font-600 text-[var(--text-primary)]">
                      {activeData.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {activeData.description}
                    </p>
                    <Link
                      href={`/categories/${activeData.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-500 text-[var(--brand-accent)] transition-colors duration-150 hover:text-[var(--brand-accent-hover)]"
                      onClick={() => setActiveCategory(null)}
                    >
                      Shop all {activeData.name}
                      <ChevronDown className="-rotate-90 h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>

                  {/* Subcategories */}
                  <m.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3"
                    role="list"
                  >
                    {activeData.subcategories.map((sub) => (
                      <m.li key={sub.slug} variants={staggerItem}>
                        <Link
                          href={`/categories/${sub.slug}`}
                          className="group flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
                          onClick={() => setActiveCategory(null)}
                        >
                          <span
                            aria-hidden="true"
                            className="h-px w-4 bg-[var(--border-strong)] transition-all duration-200 group-hover:w-6 group-hover:bg-[var(--brand-accent)]"
                          />
                          {sub.name}
                        </Link>
                      </m.li>
                    ))}
                  </m.ul>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <m.div
              ref={drawerRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              variants={mobileMenuDrawer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-[400] w-full max-w-sm overflow-y-auto bg-[var(--bg-base)] shadow-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Image
                  src="/logo.png"
                  alt="UniFlex Global"
                  width={110}
                  height={34}
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-subtle)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation">
                <ul role="list" className="px-5 pb-8 pt-2">
                  {categories.map((cat) => {
                    const Icon = categoryIcons[cat.slug as keyof typeof categoryIcons]
                    return (
                      <li key={cat.slug} className="border-b border-[var(--border-subtle)] py-4">
                        <Link
                          href={`/categories/${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 font-500 text-[var(--text-primary)]"
                        >
                          {Icon && (
                            <Icon
                              className="h-4 w-4 text-[var(--brand-accent)]"
                              aria-hidden="true"
                            />
                          )}
                          {cat.name}
                        </Link>
                        <ul className="mt-3 grid grid-cols-2 gap-y-2 pl-7" role="list">
                          {cat.subcategories.map((sub) => (
                            <li key={sub.slug}>
                              <Link
                                href={`/categories/${sub.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  })}

                  <li className="mt-6 flex flex-col gap-3">
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-sm font-500 text-[var(--text-secondary)]"
                    >
                      <User className="h-4 w-4" aria-hidden="true" /> My Account
                    </Link>
                    <Link
                      href="/deals"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-sm font-500 text-[var(--brand-accent)]"
                    >
                      <Zap className="h-4 w-4" aria-hidden="true" /> Deals
                    </Link>
                  </li>
                </ul>
              </nav>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
