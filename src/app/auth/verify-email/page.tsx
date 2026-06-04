import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyEmailAction } from '@/server/actions/auth'
import { AuthCard } from '@/components/auth/auth-card'

export const metadata: Metadata = { title: 'Verify email' }

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <AuthCard title="Invalid link" subtitle="This verification link is missing or malformed.">
        <div className="py-4 text-center text-sm text-[var(--text-muted)]">
          <Link href="/auth/register" className="font-medium text-[var(--brand-accent)] hover:underline">
            Create a new account
          </Link>
        </div>
      </AuthCard>
    )
  }

  const result = await verifyEmailAction(token)
  const hasError = !result || !!result.error
  const message = result?.error ?? result?.success ?? 'Something went wrong'

  return (
    <AuthCard title={hasError ? 'Verification failed' : 'Email verified!'}>
      <div className="space-y-4 py-4 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            hasError
              ? 'bg-red-100 dark:bg-red-950/30'
              : 'bg-emerald-100 dark:bg-emerald-900/30'
          }`}
        >
          {hasError ? (
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <p className="text-sm text-[var(--text-muted)]">{message}</p>

        <Link
          href={hasError ? '/auth/register' : '/auth/login'}
          className="inline-block text-sm font-medium text-[var(--brand-accent)] hover:underline"
        >
          {hasError ? 'Back to register' : 'Sign in now'}
        </Link>
      </div>
    </AuthCard>
  )
}
