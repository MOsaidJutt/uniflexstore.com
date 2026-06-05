'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { RotateCcw, CheckCircle2, Loader2 } from 'lucide-react'
import { submitReturnRequest } from '@/server/actions/orders'

const REASONS = [
  { value: 'damaged',          label: 'Item arrived damaged' },
  { value: 'wrong_item',       label: 'Wrong item was sent' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind',     label: 'Changed my mind' },
  { value: 'other',            label: 'Other' },
]

interface Props {
  orderId: string
  alreadySubmitted: boolean
}

export function ReturnRequestForm({ orderId, alreadySubmitted }: Props) {
  const [open, setOpen]       = useState(false)
  const [reason, setReason]   = useState('')
  const [details, setDetails] = useState('')
  const [done, setDone]       = useState(alreadySubmitted)
  const [error, setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef    = useRef<HTMLFormElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Move focus into the form when it opens; return focus when it closes.
  useEffect(() => {
    if (open) {
      formRef.current?.querySelector<HTMLElement>('select, textarea, button')?.focus()
    }
  }, [open])

  function handleOpen() {
    setOpen(true)
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    setError(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setError(null)
    startTransition(async () => {
      try {
        await submitReturnRequest(orderId, reason, details || undefined)
        setDone(true)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-3.5" role="status">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-600 text-[var(--text-primary)]">Return request submitted</p>
          <p className="text-xs text-[var(--text-muted)]">
            We'll review your request and reach out within 2–3 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <m.div key="trigger" exit={{ opacity: 0, transition: { duration: 0.1 } }}>
            <button
              ref={triggerRef}
              onClick={handleOpen}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-4 py-2.5 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Request return / refund
            </button>
          </m.div>
        ) : (
          <m.form
            key="form"
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5"
            onKeyDown={(e) => e.key === 'Escape' && !isPending && handleClose()}
            aria-label="Return request form"
          >
            <h3 className="mb-4 text-sm font-700 text-[var(--text-primary)]">
              Request a return or refund
            </h3>

            <div className="mb-4">
              <label
                htmlFor="return-reason"
                className="mb-1.5 block text-xs font-600 text-[var(--text-secondary)]"
              >
                Reason <span aria-hidden="true">*</span>
              </label>
              <select
                id="return-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              >
                <option value="" disabled>Select a reason…</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label
                htmlFor="return-details"
                className="mb-1.5 block text-xs font-600 text-[var(--text-secondary)]"
              >
                Additional details{' '}
                <span className="font-400 text-[var(--text-muted)]">(optional)</span>
              </label>
              <textarea
                id="return-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe the issue…"
                className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              />
              <p className="mt-1 text-right text-[11px] text-[var(--text-muted)]" aria-live="polite">
                {details.length}/500
              </p>
            </div>

            {error && (
              <p className="mb-4 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending || !reason}
                className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)] disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {isPending ? 'Submitting…' : 'Submit request'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  )
}
