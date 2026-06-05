export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading order">
      {/* Back link skeleton */}
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-[var(--bg-muted)]" />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded-lg bg-[var(--bg-muted)]" />
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--bg-muted)]" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-[var(--bg-muted)]" />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_296px]">
        {/* Left */}
        <div className="space-y-6">
          {/* Timeline skeleton */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6">
            <div className="mb-5 h-4 w-24 animate-pulse rounded bg-[var(--bg-muted)]" />
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--bg-muted)]" />
                    {i < 3 && <div className="mt-1 h-12 w-0.5 animate-pulse bg-[var(--bg-muted)]" />}
                  </div>
                  <div className={['pt-1 space-y-1.5', i < 3 ? 'pb-10' : ''].join(' ')}>
                    <div className="h-4 w-28 animate-pulse rounded bg-[var(--bg-muted)]" />
                    <div className="h-3 w-36 animate-pulse rounded bg-[var(--bg-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Items skeleton */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border-subtle)] last:border-0">
                <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-[var(--bg-muted)]" />
                  <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg-muted)]" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-[var(--bg-muted)]" />
              </div>
            ))}
          </div>
        </div>
        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--bg-subtle)] p-5 space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[var(--bg-muted)]" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-[var(--bg-muted)]" />
                <div className="h-3 w-12 animate-pulse rounded bg-[var(--bg-muted)]" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[var(--bg-subtle)] p-5 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-[var(--bg-muted)]" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 w-40 animate-pulse rounded bg-[var(--bg-muted)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
