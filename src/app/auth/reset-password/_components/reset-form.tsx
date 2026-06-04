'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { m } from 'motion/react'
import { resetPasswordAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError, FormAlert } from '@/components/auth/auth-card'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function ResetForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(resetPasswordAction, undefined)
  const [showPw, setShowPw] = useState(false)

  const fe = state?.fieldErrors

  if (state?.success) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--success) 12%, var(--bg-base))' }}
        >
          <svg className="h-7 w-7" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-medium text-[var(--text-primary)]">Password updated!</p>
        <p className="text-sm text-[var(--text-muted)]">{state.success}</p>
        <Link
          href="/auth/login"
          className="mt-2 inline-block text-sm font-medium text-[var(--brand-accent)] hover:underline"
        >
          Sign in now
        </Link>
      </div>
    )
  }

  return (
    <m.div variants={staggerContainer} initial={false} animate="visible">
      <FormAlert error={state?.error ?? fe?._form} />
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="token" value={token} />

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 letter, 1 number"
              autoComplete="new-password"
              autoFocus
              required
              className="pr-10"
              error={fe?.password}
              aria-describedby={fe?.password ? 'reset-pw-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError id="reset-pw-error" message={fe?.password} />
        </m.div>

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            error={fe?.confirmPassword}
            aria-describedby={fe?.confirmPassword ? 'reset-confirm-error' : undefined}
          />
          <FieldError id="reset-confirm-error" message={fe?.confirmPassword} />
        </m.div>

        <m.div variants={staggerItem}>
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={isPending}>
            Update password
          </Button>
        </m.div>
      </form>
    </m.div>
  )
}
