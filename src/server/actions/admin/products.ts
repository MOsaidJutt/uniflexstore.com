'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'
import { slugify } from '@/lib/utils'

const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
})

const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().optional(),
  sku: z.string().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), sortOrder: z.number().default(0) })).default([]),
  variants: z.array(VariantSchema).default([]),
  attributes: z.any().optional(),
})

export async function createProduct(data: z.infer<typeof ProductSchema>) {
  await requireAdmin()
  const parsed = ProductSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { categoryIds, images, variants, ...rest } = parsed.data
  const slug = rest.slug || slugify(rest.name)

  try {
    const product = await db.product.create({
      data: {
        ...rest,
        slug,
        compareAt: rest.compareAt ?? null,
        images: { create: images },
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        variants: { create: variants.map(({ id: _id, ...v }) => ({ ...v, price: v.price ?? null })) },
      },
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
  updateTag('homepage-orbit')
    return { success: true, id: product.id }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create product'
    if (msg.includes('Unique constraint') && msg.includes('sku')) return { error: 'SKU already in use' }
    if (msg.includes('Unique constraint') && msg.includes('slug')) return { error: 'Slug already in use' }
    return { error: msg }
  }
}

export async function updateProduct(id: string, data: z.infer<typeof ProductSchema>) {
  await requireAdmin()
  const parsed = ProductSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { categoryIds, images, variants, ...rest } = parsed.data
  const slug = rest.slug || slugify(rest.name)

  try {
    await db.$transaction([
      db.productImage.deleteMany({ where: { productId: id } }),
      db.productCategory.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: {
          ...rest,
          slug,
          compareAt: rest.compareAt ?? null,
          images: { create: images },
          categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        },
      }),
    ])

    // Upsert variants
    const existingVariantIds = variants.filter((v) => v.id).map((v) => v.id!)
    await db.productVariant.deleteMany({ where: { productId: id, id: { notIn: existingVariantIds } } })
    for (const v of variants) {
      const { id: variantId, ...variantData } = v
      if (variantId) {
        await db.productVariant.update({ where: { id: variantId }, data: { ...variantData, price: variantData.price ?? null } })
      } else {
        await db.productVariant.create({ data: { ...variantData, productId: id, price: variantData.price ?? null } })
      }
    }

    revalidatePath('/admin/products')
    revalidatePath(`/products/${slug}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  try {
    await db.product.delete({ where: { id } })
    revalidatePath('/admin/products')
    revalidatePath('/products')
  updateTag('homepage-orbit')
    return { success: true }
  } catch {
    return { error: 'Cannot delete product with existing orders' }
  }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin()
  await db.product.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/products')
  return { success: true }
}

export async function importProductsFromCSV(csv: string) {
  await requireAdmin()
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return { error: 'Empty CSV' }

  const headers = lines[0].split(',').map((h) => h.trim())
  const results = { created: 0, errors: [] as string[] }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row = Object.fromEntries(headers.map((h, j) => [h, values[j] ?? '']))

    try {
      await db.product.create({
        data: {
          name: row.name,
          slug: row.slug || slugify(row.name),
          description: row.description || null,
          price: parseFloat(row.price),
          sku: row.sku,
          stock: parseInt(row.stock || '0'),
          isActive: row.isActive !== 'false',
          isFeatured: row.isFeatured === 'true',
        },
      })
      results.created++
    } catch {
      results.errors.push(`Row ${i + 1}: ${row.name || '(unnamed)'}`)
    }
  }

  revalidatePath('/admin/products')
  return { success: true, ...results }
}
