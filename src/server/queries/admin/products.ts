import 'server-only'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

export type AdminProductsFilter = {
  search?: string
  categoryId?: string
  isActive?: boolean
  lowStock?: boolean
  page?: number
  pageSize?: number
}

export async function getAdminProducts(filter: AdminProductsFilter = {}) {
  const { search, categoryId, isActive, lowStock, page = 1, pageSize = 20 } = filter

  const where: Prisma.ProductWhereInput = {}
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }]
  if (categoryId) where.categories = { some: { categoryId } }
  if (isActive !== undefined) where.isActive = isActive
  if (lowStock) where.stock = { lte: 5 }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: { select: { name: true } } } },
        variants: true,
      },
    }),
    db.product.count({ where }),
  ])

  return {
    products: products.map((p) => ({
      ...p,
      price: decimalToNumber(p.price),
      compareAt: p.compareAt ? decimalToNumber(p.compareAt) : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: v.price ? decimalToNumber(v.price) : null,
      })),
    })),
    total,
    pages: Math.ceil(total / pageSize),
  }
}

export async function getAdminProductById(id: string) {
  const p = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      categories: { include: { category: true } },
      variants: true,
      tags: { include: { tag: true } },
    },
  })
  if (!p) return null
  return {
    ...p,
    price: decimalToNumber(p.price),
    compareAt: p.compareAt ? decimalToNumber(p.compareAt) : null,
  }
}
