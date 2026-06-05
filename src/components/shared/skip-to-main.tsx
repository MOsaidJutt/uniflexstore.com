export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-skip)] focus:rounded-xl focus:bg-[var(--brand-primary)] focus:px-5 focus:py-3 focus:text-sm focus:font-600 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}
