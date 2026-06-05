export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading orders">
      <div className="mb-8">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-[var(--bg-muted)]" />
        <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[var(--bg-muted)]" />
      </div>
      <ul role="list" className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-4 w-48 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--bg-muted)]" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-4 w-16 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--bg-muted)]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
