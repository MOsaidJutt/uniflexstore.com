import Link from 'next/link'
import { ArrowRight, Zap, Shirt, Sparkles, Gamepad2 } from 'lucide-react'

// CSS-variable-based category colors — respond to dark mode via .dark class
const heroCats = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: Zap,
    // Deep blue tint in light, cooler dark in dark
    style: {
      light: { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6' },
      dark: { bg: '#1e2a3a', border: '#1d4ed8', icon: '#60a5fa' },
    },
    twBg: 'bg-blue-50 dark:bg-[#1e2a3a] border border-blue-100 dark:border-blue-900',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: Shirt,
    twBg: 'bg-rose-50 dark:bg-[#2a1a1e] border border-rose-100 dark:border-rose-900',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    icon: Sparkles,
    twBg: 'bg-amber-50 dark:bg-[#2a2012] border border-amber-100 dark:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Toys',
    slug: 'toys',
    icon: Gamepad2,
    twBg: 'bg-emerald-50 dark:bg-[#0f2a1e] border border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
]

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              New Season — Summer 2025
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              Shop the <em className="not-italic text-[var(--brand-accent)]">best</em> of everything
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[var(--text-muted)]">
              Electronics, fashion, beauty, toys and more — selected for quality,
              shipped fast across the US.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--brand-secondary)]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--bg-muted)]"
              >
                <Zap className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
                Today&apos;s Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)]"
          >
            All categories
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4" role="list">
          {heroCats.map(({ name, slug, icon: Icon, twBg, iconColor }) => (
            <li key={slug}>
              <Link
                href={`/categories/${slug}`}
                className={`group flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center transition-all duration-200 hover:shadow-md ${twBg}`}
              >
                <Icon
                  className={`h-8 w-8 transition-transform duration-200 group-hover:scale-110 ${iconColor}`}
                  aria-hidden="true"
                />
                <span className="font-medium text-[var(--text-primary)]">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Phase 0 completion notice — remove when Phase 1 ships */}
      <div className="mx-auto mb-16 max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-8 text-center">
          <p className="font-serif text-xl font-semibold text-[var(--text-primary)]">
            Phase 0 — Foundation
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Design system · Header + mega-menu · Footer · Theme toggle · Motion layer ·
            Prisma schema · Loading state · 404
          </p>
        </div>
      </div>
    </div>
  )
}
