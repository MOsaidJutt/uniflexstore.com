'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'

const BannerSchema = z.object({
  title: z.string().min(1, { error: 'Title required' }),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, { error: 'Image required' }),
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

export async function createBanner(data: z.infer<typeof BannerSchema>) {
  await requireAdmin()
  const parsed = BannerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { startsAt, endsAt, ...rest } = parsed.data
  await db.banner.create({
    data: {
      ...rest,
      subtitle: rest.subtitle ?? null,
      linkUrl: rest.linkUrl ?? null,
      linkLabel: rest.linkLabel ?? null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  })
  revalidatePath('/admin/banners')
  revalidatePath('/')
  updateTag('homepage-banners')
  return { success: true }
}

export async function updateBanner(id: string, data: z.infer<typeof BannerSchema>) {
  await requireAdmin()
  const parsed = BannerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { startsAt, endsAt, ...rest } = parsed.data
  await db.banner.update({
    where: { id },
    data: {
      ...rest,
      subtitle: rest.subtitle ?? null,
      linkUrl: rest.linkUrl ?? null,
      linkLabel: rest.linkLabel ?? null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  })
  revalidatePath('/admin/banners')
  revalidatePath('/')
  updateTag('homepage-banners')
  return { success: true }
}

export async function deleteBanner(id: string) {
  await requireAdmin()
  await db.banner.delete({ where: { id } })
  revalidatePath('/admin/banners')
  revalidatePath('/')
  updateTag('homepage-banners')
  return { success: true }
}

export async function getBanners() {
  return db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
}
