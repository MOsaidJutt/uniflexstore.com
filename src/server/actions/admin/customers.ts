'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'

export async function setCustomerBanned(userId: string, banned: boolean) {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { isBanned: banned } })
  revalidatePath('/admin/customers')
  return { success: true }
}
