import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Decorative — hidden from screen readers */}
      <p
        aria-hidden="true"
        className="font-serif text-[120px] font-700 leading-none text-[var(--bg-muted)] sm:text-[180px]"
      >
        404
      </p>

      <div className="-mt-4 space-y-3">
        <h1 className="font-serif text-3xl font-600 text-[var(--text-primary)]">
          Page not found
        </h1>
        <p className="mx-auto max-w-sm text-[var(--text-muted)]">
          The page you&apos;re looking for has moved, been removed, or never existed.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--brand-secondary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-md border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Browse products
        </Link>
      </div>

      <nav aria-label="Popular categories" className="mt-12">
        <p className="mb-4 text-sm font-600 text-[var(--text-secondary)]">
          Popular categories
        </p>
        <ul className="flex flex-wrap justify-center gap-2" role="list">
          {['Electronics', 'Fashion', 'Beauty', 'Toys'].map((cat) => (
            <li key={cat}>
              <Link
                href={`/categories/${cat.toLowerCase()}`}
                className="rounded-full border border-[var(--border-default)] px-4 py-1.5 text-sm text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
