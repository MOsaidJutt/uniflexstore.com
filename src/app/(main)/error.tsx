'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CatalogError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--error)]/10">
        <AlertTriangle className="h-6 w-6 text-[var(--error)]" aria-hidden="true" />
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          We couldn&apos;t load this page. This is usually a temporary issue.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-2.5 text-sm font-600 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
