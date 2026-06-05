import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/dal'
import { db } from '@/server/db'
import { AccountShell } from './_components/account-shell'

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

  return <AccountShell user={user} initials={initials} joinDate={joinDate} />
}
