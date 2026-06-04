'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { m } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useId, cloneElement, isValidElement } from 'react'
import type { CheckoutAddress } from '@/types/checkout'
import { easeSmooth, easeNormal } from '@/lib/motion'
import { US_STATES } from '@/lib/us-states'

const schema = z.object({
  firstName: z.string().min(1, { error: 'Required' }),
  lastName: z.string().min(1, { error: 'Required' }),
  email: z.email({ error: 'Enter a valid email' }),
  phone: z
    .string()
    .min(10, { error: 'Enter a valid phone number' })
    .regex(/^[0-9()\-\s+.]+$/, { error: 'Enter a valid phone number' }),
  line1: z.string().min(1, { error: 'Required' }),
  line2: z.string(),
  city: z.string().min(1, { error: 'Required' }),
  state: z.string().length(2, { error: 'Select a state' }),
  postalCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, { error: 'Enter a valid ZIP (e.g. 90210)' }),
})

interface AddressStepProps {
  defaultValues?: Partial<CheckoutAddress>
  onNext: (data: CheckoutAddress) => void
  direction?: number
}

export function AddressStep({ defaultValues, onNext, direction = 1 }: AddressStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutAddress>({
    resolver: zodResolver(schema) as never,
    defaultValues: { line2: '', ...defaultValues },
  })

  return (
    <m.div
      initial={{ opacity: 0, x: direction * 32 }}
      animate={{ opacity: 1, x: 0, transition: easeSmooth }}
      exit={{ opacity: 0, x: direction * -16, transition: easeNormal }}
    >
      <h2 className="mb-6 font-serif text-xl font-600 text-[var(--text-primary)]">
        Shipping address
      </h2>

      <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" error={errors.firstName?.message}>
            <input
              {...register('firstName')}
              placeholder="Jane"
              autoComplete="given-name"
              className={inputClass}
            />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <input
              {...register('lastName')}
              placeholder="Smith"
              autoComplete="family-name"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            placeholder="(555) 000-0000"
            autoComplete="tel"
            className={inputClass}
          />
        </Field>

        <Field label="Address line 1" error={errors.line1?.message}>
          <input
            {...register('line1')}
            placeholder="123 Main Street"
            autoComplete="address-line1"
            className={inputClass}
          />
        </Field>
        <Field label="Address line 2 (optional)" error={errors.line2?.message}>
          <input
            {...register('line2')}
            placeholder="Apt, suite, unit…"
            autoComplete="address-line2"
            className={inputClass}
          />
        </Field>

        {/* City / State / ZIP — responsive: stacked on mobile, inline on sm+ */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <div className="col-span-2 sm:col-span-3">
            <Field label="City" error={errors.city?.message}>
              <input
                {...register('city')}
                placeholder="Los Angeles"
                autoComplete="address-level2"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <Field label="State" error={errors.state?.message}>
              <select
                {...register('state')}
                autoComplete="address-level1"
                className={inputClass}
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-1 sm:col-span-1">
            <Field label="ZIP" error={errors.postalCode?.message}>
              <input
                {...register('postalCode')}
                placeholder="90210"
                autoComplete="postal-code"
                maxLength={10}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 font-600 text-white transition-colors hover:bg-[var(--brand-secondary)] disabled:opacity-60"
        >
          Continue to shipping
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </m.div>
  )
}

// ─── Field component — label is programmatically associated with its input ────

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  const id = useId()
  const errorId = error ? `${id}-err` : undefined

  const input = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        {
          id,
          ...(errorId && { 'aria-describedby': errorId, 'aria-invalid': 'true' }),
        }
      )
    : children

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-500 text-[var(--text-secondary)]">
        {label}
      </label>
      {input}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-[var(--error)]">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  'h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-accent)] focus:outline-none transition-colors'
