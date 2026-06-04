import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className={cn('w-full max-w-[420px]', className)}>
      {/* Logo */}
      <Link href="/" className="mb-8 inline-flex items-baseline gap-1" aria-label="UniFlex Store home">
        <span className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Uni<span className="text-[var(--brand-accent)]">Flex</span>
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Store
        </span>
      </Link>

      {/* Heading */}
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>
      )}

      {/* Card body */}
      <div className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 shadow-sm">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 text-center text-sm text-[var(--text-muted)]">{footer}</div>
      )}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="relative my-6 flex items-center" aria-hidden="true">
      <div className="flex-1 border-t border-[var(--border-subtle)]" />
      <span className="mx-3 text-xs text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 border-t border-[var(--border-subtle)]" />
    </div>
  )
}

// ─── Per-field error ──────────────────────────────────────────────────────────

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-[var(--error)]">
      {message}
    </p>
  )
}

// ─── Form-level alert — uses design tokens for both light and dark ─────────────

export function FormAlert({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null
  return (
    <div
      role="alert"
      className="rounded-md px-4 py-3 text-sm"
      style={
        error
          ? {
              background: 'color-mix(in srgb, var(--error) 10%, var(--bg-base))',
              color: 'var(--error)',
            }
          : {
              background: 'color-mix(in srgb, var(--success) 10%, var(--bg-base))',
              color: 'var(--success)',
            }
      }
    >
      {error ?? success}
    </div>
  )
}
