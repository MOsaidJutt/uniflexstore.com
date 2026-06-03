'use client'

import { useState } from 'react'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      // Phase 1 will wire a real /api/newsletter endpoint.
      // Simulate network delay for now so the UI state is exercised.
      await new Promise((r) => setTimeout(r, 600))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white"
      >
        <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
        You&apos;re on the list — check your inbox for the discount code.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
          disabled={status === 'loading'}
          className="h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 disabled:opacity-60"
        />
        {status === 'error' && (
          <p
            id="newsletter-error"
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-red-300"
          >
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            Something went wrong — please try again.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-[var(--brand-accent)] px-5 text-sm font-500 text-white transition-colors duration-150 hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' ? (
          <span aria-live="polite">Subscribing…</span>
        ) : (
          <>
            Subscribe
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
