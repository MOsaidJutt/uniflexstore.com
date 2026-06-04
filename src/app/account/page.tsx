import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { m } from 'motion/react'
import { LogOut, User, ShoppingBag, Heart, MapPin } from 'lucide-react'
import { requireAuth } from '@/lib/dal'
import { db } from '@/server/db'
import { logoutAction } from '@/server/actions/auth'
import { ProfileForm } from './_components/profile-form'
import { staggerContainer, staggerItem } from '@/lib/motion'

export const metadata: Metadata = { title: 'My account' }

export default async function AccountPage() {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
  })

  if (!user) redirect('/auth/login')

  const joinDate = user.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <m.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      className="grid gap-8 lg:grid-cols-[240px_1fr]"
    >
      {/* Sidebar */}
      <m.aside variants={staggerItem}>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5 shadow-sm">
          {/* Avatar */}
          <div className="mb-5 flex flex-col items-center gap-2 border-b border-[var(--border-subtle)] pb-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-accent)]/10 text-2xl font-semibold text-[var(--brand-accent)]">
              {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">{user.name ?? 'Customer'}</p>
              <p className="text-xs text-[var(--text-muted)]">Member since {joinDate}</p>
            </div>
          </div>

          {/* Nav — aria-label distinguishes from the main site header nav */}
          <nav aria-label="Account navigation">
            <ul className="space-y-1" role="list">
              {/* Active: Profile */}
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-[var(--brand-accent)]/10 font-medium text-[var(--brand-accent)]"
                  aria-current="page"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile
                </a>
              </li>

              {/* Not-yet-built items — rendered as non-interactive spans to avoid dead links */}
              {[
                { icon: ShoppingBag, label: 'Orders' },
                { icon: Heart, label: 'Wishlist' },
                { icon: MapPin, label: 'Addresses' },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <span
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-[var(--text-muted)] opacity-50 cursor-not-allowed select-none"
                    aria-disabled="true"
                    title="Coming soon"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </span>
                    <span className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      Soon
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign out */}
          <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--error)]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </m.aside>

      {/* Main content */}
      <m.div variants={staggerItem}>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 shadow-sm">
          {/* h1 uses Inter (product register bans display fonts in task UI) */}
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Profile</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your personal information
          </p>
          <div className="mt-6">
            <ProfileForm
              userId={user.id}
              name={user.name}
              email={user.email}
              phone={user.phone}
            />
          </div>
        </div>
      </m.div>
    </m.div>
  )
}
