import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { m } from 'motion/react'
import { LogOut, User, ShoppingBag, Heart, MapPin } from 'lucide-react'
import { requireAuth } from '@/lib/dal'
import { db } from '@/server/db'
import { logoutAction } from '@/server/actions/auth'
import { ProfileForm } from './_components/profile-form'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'

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

  const initials = (user.name ?? user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <m.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-6 lg:grid-cols-[256px_1fr]"
    >
      {/* ── Sidebar ───────────────────────────────────────── */}
      <m.aside variants={staggerItem}>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-sm">

          {/* Avatar band */}
          <div className="relative bg-gradient-to-br from-[var(--brand-accent)]/10 via-[var(--brand-accent)]/5 to-transparent px-5 pb-5 pt-6">
            {/* Ring */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-primary)] text-xl font-700 text-white shadow-lg shadow-[var(--brand-accent)]/25">
              {initials}
            </div>
            <div className="mt-3 text-center">
              <p className="font-600 text-[var(--text-primary)]">{user.name ?? 'Customer'}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>
            <p className="mt-1.5 text-center text-[10px] font-500 uppercase tracking-widest text-[var(--text-muted)]">
              Member since {joinDate}
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Account navigation" className="px-2 py-3">
            <ul className="space-y-0.5" role="list">
              <li>
                <a
                  href="#"
                  aria-current="page"
                  className="flex items-center gap-3 rounded-xl bg-[var(--brand-accent)]/10 px-3 py-2.5 text-sm font-600 text-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)]/20"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Profile
                </a>
              </li>

              {[
                { icon: ShoppingBag, label: 'Orders' },
                { icon: Heart, label: 'Wishlist' },
                { icon: MapPin, label: 'Addresses' },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <span
                    aria-disabled="true"
                    title="Coming soon"
                    className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] opacity-50 select-none"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {label}
                    </span>
                    <span className="rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[9px] font-700 uppercase tracking-wider text-[var(--text-muted)]">
                      Soon
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign out */}
          <div className="px-2 pb-3">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--error)]/8 hover:text-[var(--error)]"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </m.aside>

      {/* ── Main content ──────────────────────────────────── */}
      <m.div variants={fadeInUp}>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-sm">
          <div className="border-b border-[var(--border-subtle)] px-6 py-5">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Profile</h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="p-6">
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
