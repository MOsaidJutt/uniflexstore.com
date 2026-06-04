import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from './_components/login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your UniFlex Store account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-[var(--brand-accent)] hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthCard>
  )
}
