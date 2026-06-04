'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { m } from 'motion/react'
import { loginAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { AuthDivider, FieldError, FormAlert } from '@/components/auth/auth-card'
import { staggerContainer, staggerItem } from '@/lib/motion'

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, isPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    // initial={false} — skips hidden state on SSR, prevents blank-flash on first paint
    <m.div variants={staggerContainer} initial={false} animate="visible" className="space-y-5">
      <FormAlert error={state?.error} success={state?.success} />

      <m.div variants={staggerItem}>
        <OAuthButtons />
      </m.div>

      <AuthDivider label="or sign in with email" />

      <form action={action} className="space-y-4">
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

        <m.div variants={staggerItem} className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            error={state?.fieldErrors?.email}
            aria-describedby={state?.fieldErrors?.email ? 'login-email-error' : undefined}
          />
          <FieldError id="login-email-error" message={state?.fieldErrors?.email} />
        </m.div>

        <m.div variants={staggerItem} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[var(--brand-accent)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="pr-10"
            />
            {/* p-2 extends hit area to 32×32px — meets WCAG 2.2 SC 2.5.8 (24px minimum) */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </m.div>

        <m.div variants={staggerItem} className="flex items-center gap-2">
          <Checkbox id="rememberMe" name="rememberMe" value="true" />
          <Label htmlFor="rememberMe" className="cursor-pointer font-normal text-[var(--text-muted)]">
            Keep me signed in for 30 days
          </Label>
        </m.div>

        <m.div variants={staggerItem}>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            loading={isPending}
          >
            Sign in
          </Button>
        </m.div>
      </form>
    </m.div>
  )
}
