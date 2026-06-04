import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { ForgotForm } from './_components/forgot-form'

export const metadata: Metadata = { title: 'Forgot password' }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link href="/auth/login" className="font-medium text-[var(--brand-accent)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  )
}
