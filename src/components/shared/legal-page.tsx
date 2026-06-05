import Link from 'next/link'

interface LegalPageProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[var(--border-subtle)] pb-8">
        <p className="mb-2 text-sm text-[var(--text-muted)]">
          <Link href="/" className="text-[var(--brand-link)] transition-colors hover:underline">Home</Link>
          {' / '}
          <span className="text-[var(--text-secondary)]">{title}</span>
        </p>
        <h1 className="font-serif text-4xl font-700 leading-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Last updated: {lastUpdated}</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-400">
            <strong>Placeholder document.</strong> This policy must be reviewed and approved by a
            licensed attorney before the site launches publicly. Contact{' '}
            <a href="mailto:legal@uniflexstore.com" className="underline">legal@uniflexstore.com</a>.
          </p>
        </div>
      </header>
      <div className="prose-legal">{children}</div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-serif text-xl font-700 text-[var(--text-primary)]">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </section>
  )
}
