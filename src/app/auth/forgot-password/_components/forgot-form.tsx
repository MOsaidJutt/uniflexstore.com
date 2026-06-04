'use client'

import { useActionState } from 'react'
import { m } from 'motion/react'
import { forgotPasswordAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError, FormAlert } from '@/components/auth/auth-card'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function ForgotForm() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, undefined)

  if (state?.success) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--brand-accent) 12%, var(--bg-base))' }}
        >
          <svg className="h-7 w-7 text-[var(--brand-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-medium text-[var(--text-primary)]">Reset link sent</p>
        <p className="text-sm text-[var(--text-muted)]">{state.success}</p>
      </div>
    )
  }

  const fe = state?.fieldErrors

  return (
    <m.div variants={staggerContainer} initial={false} animate="visible">
      <FormAlert error={state?.error} />
      <form action={action} className="mt-4 space-y-4">
        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            error={fe?.email}
            aria-describedby={fe?.email ? 'forgot-email-error' : undefined}
          />
          <FieldError id="forgot-email-error" message={fe?.email} />
        </m.div>
        <m.div variants={staggerItem}>
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={isPending}>
            Send reset link
          </Button>
        </m.div>
      </form>
    </m.div>
  )
}
