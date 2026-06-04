import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

// The outer card surface is rendered by the auth layout.
// AuthCard owns only the content structure: heading, body, footer.
export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className={cn('w-full p-7', className)}>
      {/* Heading */}
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
      )}

      {/* Content */}
      <div className="mt-7">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 border-t border-[var(--border-subtle)] pt-5 text-center text-sm text-[var(--text-muted)]">
          {footer}
        </div>
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

// ─── Form-level alert ─────────────────────────────────────────────────────────

export function FormAlert({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null
  return (
    <div
      role="alert"
      className="mb-5 rounded-xl px-4 py-3 text-sm"
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
