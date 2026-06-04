import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'

export const metadata: Metadata = { title: 'Authentication error' }

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from an OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth provider user.',
  EmailCreateAccount: 'Could not create email provider user.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'An account with this email already exists using a different sign-in method.',
  EmailSignin: 'Sending the e-mail with the verification token failed.',
  CredentialsSignin: 'Invalid credentials. Check the details you provided.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected authentication error occurred.',
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : ERROR_MESSAGES.Default

  return (
    <AuthCard
      title="Sign-in error"
      subtitle={message}
      footer={
        <Link href="/auth/login" className="font-medium text-[var(--brand-accent)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="py-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        {error && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">Error code: {error}</p>
        )}
      </div>
    </AuthCard>
  )
}
