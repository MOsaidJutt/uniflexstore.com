import Link from 'next/link'
import Image from 'next/image'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { auth } from '@/auth'
import { logoutAction } from '@/server/actions/auth'

export async function UserButton() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/auth/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-accent-hover)]"
        >
          Register
        </Link>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {user.role === 'ADMIN' && (
        <Link
          href="/admin"
          aria-label="Admin panel"
          title="Admin panel"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--brand-accent)]"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}

      <Link
        href="/account"
        aria-label="My account"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent)]/20"
        title={user.name ?? user.email ?? 'Account'}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'avatar'}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold">
            {(user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
          </span>
        )}
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--error)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
