'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { m } from 'motion/react'
import { registerAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { AuthDivider, FieldError, FormAlert } from '@/components/auth/auth-card'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, undefined)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (state?.success) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--success) 12%, var(--bg-base))' }}>
          <svg className="h-7 w-7" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-medium text-[var(--text-primary)]">Check your inbox</p>
        <p className="text-sm text-[var(--text-muted)]">{state.success}</p>
      </div>
    )
  }

  const fe = state?.fieldErrors

  return (
    <m.div variants={staggerContainer} initial={false} animate="visible" className="space-y-5">
      <FormAlert error={state?.error ?? fe?._form} />

      <m.div variants={staggerItem}>
        <OAuthButtons />
      </m.div>

      <AuthDivider label="or sign up with email" />

      <form action={action} className="space-y-4">
        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Alex Johnson"
            autoComplete="name"
            autoFocus
            required
            error={fe?.name}
            aria-describedby={fe?.name ? 'reg-name-error' : undefined}
          />
          <FieldError id="reg-name-error" message={fe?.name} />
        </m.div>

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            error={fe?.email}
            aria-describedby={fe?.email ? 'reg-email-error' : undefined}
          />
          <FieldError id="reg-email-error" message={fe?.email} />
        </m.div>

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 letter, 1 number"
              autoComplete="new-password"
              required
              className="pr-10"
              error={fe?.password}
              aria-describedby={fe?.password ? 'reg-pw-error' : undefined}
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
          <FieldError id="reg-pw-error" message={fe?.password} />
        </m.div>

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="pr-10"
              error={fe?.confirmPassword}
              aria-describedby={fe?.confirmPassword ? 'reg-confirm-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError id="reg-confirm-error" message={fe?.confirmPassword} />
        </m.div>

        <m.div variants={staggerItem}>
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={isPending}>
            Create account
          </Button>
        </m.div>

        <m.p variants={staggerItem} className="text-center text-xs text-[var(--text-muted)]">
          By creating an account you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">Terms</a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">Privacy Policy</a>.
        </m.p>
      </form>
    </m.div>
  )
}
