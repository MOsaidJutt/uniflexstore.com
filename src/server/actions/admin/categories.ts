'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'
import { slugify } from '@/lib/utils'

const CategorySchema = z.object({
  name: z.string().min(1, { error: 'Name required' }),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export async function createCategory(data: z.infer<typeof CategorySchema>) {
  await requireAdmin()
  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { slug: rawSlug, ...rest } = parsed.data
  const slug = rawSlug || slugify(rest.name)
  try {
    const cat = await db.category.create({ data: { ...rest, slug, parentId: rest.parentId ?? null, description: rest.description ?? null, image: rest.image ?? null } })
    revalidatePath('/admin/categories')
    return { success: true, id: cat.id }
  } catch {
    return { error: 'Slug already in use' }
  }
}

export async function updateCategory(id: string, data: z.infer<typeof CategorySchema>) {
  await requireAdmin()
  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { slug: rawSlug, ...rest } = parsed.data
  const slug = rawSlug || slugify(rest.name)
  try {
    await db.category.update({ where: { id }, data: { ...rest, slug, parentId: rest.parentId ?? null, description: rest.description ?? null, image: rest.image ?? null } })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch {
    return { error: 'Slug already in use' }
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  try {
    await db.category.delete({ where: { id } })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch {
    return { error: 'Cannot delete category with products or sub-categories' }
  }
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { children: { select: { id: true, name: true } } },
  })
}
