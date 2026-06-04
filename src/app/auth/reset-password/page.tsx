import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { ResetForm } from './_components/reset-form'

export const metadata: Metadata = { title: 'Reset password' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <AuthCard title="Invalid link" subtitle="This password reset link is missing or malformed.">
        <div className="py-4 text-center">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-[var(--brand-accent)] hover:underline">
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password for your account"
      footer={
        <Link href="/auth/login" className="font-medium text-[var(--brand-accent)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ResetForm token={token} />
    </AuthCard>
  )
}
