import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const getSession = cache(async () => {
  return auth()
})

export const requireAuth = cache(async () => {
  const session = await getSession()
  const expired = session?.user?.sessionEnd && session.user.sessionEnd < Date.now()

  if (!session?.user || expired) {
    redirect('/auth/login')
  }

  return session
})

export const requireAdmin = cache(async () => {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  return session
})
