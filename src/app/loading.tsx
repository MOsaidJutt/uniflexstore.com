// Route-level loading UI — sits within <main>, header and footer stay visible
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      {/* Animated logo mark */}
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-accent)] opacity-20"
          style={{ animationDuration: '1.2s' }}
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className="relative font-serif text-xl font-700 text-[var(--brand-accent)]"
        >
          U
        </span>
      </div>

      {/* Bouncing dots — animation defined in globals.css */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]"
            style={{
              animation: 'dots-bounce 1s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
