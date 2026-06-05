'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'

const BrandAuthSchema = z.object({
  brandName: z.string().min(1, { error: 'Brand name required' }),
  brandLogoUrl: z.string().min(1, { error: 'Logo required' }),
  authorizationType: z.string().min(1, { error: 'Authorization type required' }),
  certificateAssetUrl: z.string().min(1, { error: 'Certificate required' }),
  verificationUrl: z.string().optional(),
  verificationNote: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  displayBlurb: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
})

export async function createBrandAuth(data: z.infer<typeof BrandAuthSchema>) {
  await requireAdmin()
  const parsed = BrandAuthSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { validFrom, validUntil, ...rest } = parsed.data
  await db.brandAuthorization.create({
    data: {
      ...rest,
      verificationUrl: rest.verificationUrl ?? null,
      verificationNote: rest.verificationNote ?? null,
      displayBlurb: rest.displayBlurb ?? null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  })
  revalidatePath('/admin/brand-authorizations')
  revalidatePath('/authorized-reseller')
  return { success: true }
}

export async function updateBrandAuth(id: string, data: z.infer<typeof BrandAuthSchema>) {
  await requireAdmin()
  const parsed = BrandAuthSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { validFrom, validUntil, ...rest } = parsed.data
  await db.brandAuthorization.update({
    where: { id },
    data: {
      ...rest,
      verificationUrl: rest.verificationUrl ?? null,
      verificationNote: rest.verificationNote ?? null,
      displayBlurb: rest.displayBlurb ?? null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  })
  revalidatePath('/admin/brand-authorizations')
  revalidatePath('/authorized-reseller')
  return { success: true }
}

export async function deleteBrandAuth(id: string) {
  await requireAdmin()
  await db.brandAuthorization.delete({ where: { id } })
  revalidatePath('/admin/brand-authorizations')
  revalidatePath('/authorized-reseller')
  return { success: true }
}

export async function reorderBrandAuths(ids: string[]) {
  await requireAdmin()
  await Promise.all(ids.map((id, index) => db.brandAuthorization.update({ where: { id }, data: { sortOrder: index } })))
  revalidatePath('/admin/brand-authorizations')
  revalidatePath('/authorized-reseller')
  return { success: true }
}

export async function getBrandAuths() {
  return db.brandAuthorization.findMany({ orderBy: { sortOrder: 'asc' } })
}
