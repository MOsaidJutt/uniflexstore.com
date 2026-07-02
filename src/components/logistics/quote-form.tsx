'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, Clock, Phone } from 'lucide-react'
import { logisticsConfig } from '@/config/logistics'

const TRUCK_TYPES = ['Dry Van', 'Reefer', 'Flatbed', 'Box Truck', 'Other'] as const

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function QuoteForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    // Honeypot — bots fill every field, humans never see this one
    if (data.company) {
      setStatus('success')
      return
    }

    try {
      const res = await fetch('/api/logistics/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.status === 429) {
        setErrorMessage('Too many requests. Please try again in a few minutes, or call us directly.')
        setStatus('error')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setErrorMessage(body?.error ?? 'Something went wrong. Please try again or call dispatch.')
        setStatus('error')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="bg-[#0a1520] py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:px-8">
        <div>
          <p className="text-xs font-700 uppercase tracking-[0.12em] text-[#29c4d9]">Get started</p>
          <h2 className="mt-3 max-w-md font-sans text-3xl font-800 tracking-tight text-white sm:text-4xl">
            Tell us about your truck. We&apos;ll call you back today.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
            No contracts to sign to get a rate quote. One conversation, and you&apos;ll know
            exactly what dispatch looks like with us.
          </p>

          <ul className="mt-9 space-y-4">
            <li className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
              {logisticsConfig.serviceArea}
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <Clock className="h-4.5 w-4.5 shrink-0 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
              {logisticsConfig.hours}
            </li>
            <li className="flex items-center gap-3 text-sm text-white/70">
              <Phone className="h-4.5 w-4.5 shrink-0 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
              <a href={`tel:${logisticsConfig.phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">
                Or call {logisticsConfig.phoneDisplay} directly
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d1f2d] p-6 sm:p-8">
          {status === 'success' ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-10 w-10 text-[#4ade80]" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-4 text-xl font-700 text-white">Request received</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
                A dispatcher will call you back shortly. Need it faster? Call{' '}
                {logisticsConfig.phoneDisplay} now.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot field — hidden from real users, visible to bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" name="name" required autoComplete="name" />
                <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
              </div>

              <Field label="Email" name="email" type="email" required autoComplete="email" />

              <div>
                <label htmlFor="truckType" className="mb-2 block text-sm font-600 text-white/80">
                  Truck type
                </label>
                <select
                  id="truckType"
                  name="truckType"
                  defaultValue=""
                  required
                  className="w-full rounded-xl border border-white/15 bg-[#0a1520] px-4 py-3 text-sm text-white outline-none focus:border-[#29c4d9]"
                >
                  <option value="" disabled>
                    Select your equipment
                  </option>
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Home base / preferred lanes"
                name="route"
                placeholder="e.g. Based in Dallas, TX — runs TX/OK/LA"
              />

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-600 text-white/80">
                  Anything else we should know?
                  <span className="ml-1 font-400 text-white/40">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/15 bg-[#0a1520] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#29c4d9]"
                  placeholder="Trailer length, current authority status, when you're available to start..."
                />
              </div>

              {status === 'error' && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1daabc] px-6 py-3.5 text-base font-700 text-[#0a1520] transition-transform hover:-translate-y-0.5 hover:bg-[#29c4d9] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {status === 'submitting' ? 'Sending...' : 'Get a Quote'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-600 text-white/80">
        {label}
        {!required && <span className="ml-1 font-400 text-white/40">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-[#0a1520] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#29c4d9]"
      />
    </div>
  )
}
