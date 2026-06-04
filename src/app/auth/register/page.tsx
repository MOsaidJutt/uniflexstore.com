import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { RegisterForm } from './_components/register-form'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Join UniFlex Store — free, no credit card needed"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-[var(--brand-accent)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  )
}
