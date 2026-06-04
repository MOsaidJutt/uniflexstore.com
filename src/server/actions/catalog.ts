import { cache } from 'react'
import { db } from '@/server/db'
import type { Prisma } from '@prisma/client'
import type {
  ProductCard,
  ProductDetail,
  ProductQuery,
  ProductListResult,
  CategoryTree,
  FilterOptions,
  SearchSuggestion,
} from '@/types/catalog'

const PAGE_SIZE = 12

// ─── Typed includes ────────────────────────────────────────────────────────────

const cardInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 2 },
  reviews: { select: { rating: true } },
  variants: { select: { id: true } },
  tags: { include: { tag: { select: { name: true } } } },
} satisfies Prisma.ProductInclude

type CardPayload = Prisma.ProductGetPayload<{ include: typeof cardInclude }>

function toCard(p: CardPayload): ProductCard {
  const ratings = p.reviews.map((r) => r.rating)
  const avg =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    compareAt: p.compareAt != null ? Number(p.compareAt) : null,
    stock: p.stock,
    images: p.images,
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: ratings.length,
    tags: p.tags.map((t) => t.tag.name),
    variantCount: p.variants.length,
  }
}

// Builds where clause that matches products in a top-level OR sub-category
function categoryWhere(slug: string): Prisma.ProductWhereInput {
  return {
    categories: {
      some: {
        category: {
          OR: [
            { slug },
            { parent: { slug } },
          ],
        },
      },
    },
  }
}

// ─── Filter options ────────────────────────────────────────────────────────────

async function buildFilterOptions(categorySlug?: string): Promise<FilterOptions> {
  const productWhere: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categorySlug ? categoryWhere(categorySlug) : {}),
  }

  const [priceAgg, variantsRaw] = await Promise.all([
    db.product.aggregate({
      where: productWhere,
      _min: { price: true },
      _max: { price: true },
    }),
    db.productVariant.findMany({
      where: { product: productWhere },
      select: { name: true, value: true },
      distinct: ['name', 'value'],
      orderBy: [{ name: 'asc' }, { value: 'asc' }],
    }),
  ])

  const variants: Record<string, string[]> = {}
  for (const v of variantsRaw) {
    if (!variants[v.name]) variants[v.name] = []
    variants[v.name].push(v.value)
  }

  return {
    priceRange: {
      min: Math.floor(Number(priceAgg._min.price ?? 0)),
      max: Math.ceil(Number(priceAgg._max.price ?? 9999)),
    },
    variants,
  }
}

// ─── Public actions ────────────────────────────────────────────────────────────

export async function getProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const {
    q,
    categorySlug,
    sort = 'newest',
    page = 1,
    limit = PAGE_SIZE,
    minPrice,
    maxPrice,
    variants,
    inStock,
  } = query

  const skip = (page - 1) * limit

  // Build where clause
  const baseWhere: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categorySlug ? categoryWhere(categorySlug) : {}),
  }

  // Full-text search via Postgres tsvector
  let whereWithSearch: Prisma.ProductWhereInput = baseWhere
  if (q?.trim()) {
    // Use ILIKE for broad matching; OR ensures partial name/description hits
    whereWithSearch = {
      ...baseWhere,
      OR: [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
      ],
    }
  }

  // Price filter
  const priceFilter: Prisma.DecimalFilter | undefined =
    minPrice !== undefined || maxPrice !== undefined
      ? {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        }
      : undefined

  // Variant filters — each selected value adds an AND condition
  const variantConditions: Prisma.ProductWhereInput[] =
    variants && Object.keys(variants).length > 0
      ? Object.entries(variants).flatMap(([name, values]) =>
          values
            .filter(Boolean)
            .map<Prisma.ProductWhereInput>((value) => ({
              variants: { some: { name, value } },
            }))
        )
      : []

  const where: Prisma.ProductWhereInput = {
    ...whereWithSearch,
    ...(priceFilter ? { price: priceFilter } : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
    ...(variantConditions.length > 0 ? { AND: variantConditions } : {}),
  }

  // Sort
  type OrderBy = Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = [{ createdAt: 'desc' }] as OrderBy
  if (sort === 'price-asc') orderBy = [{ price: 'asc' }]
  else if (sort === 'price-desc') orderBy = [{ price: 'desc' }]
  else if (sort === 'popular') orderBy = [{ reviews: { _count: 'desc' } }]
  else if (sort === 'rating') orderBy = [{ reviews: { _avg: { rating: 'desc' } } }]

  const [rawProducts, total, filterOptions] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: limit, include: cardInclude }),
    db.product.count({ where }),
    buildFilterOptions(categorySlug),
  ])

  return {
    products: rawProducts.map(toCard),
    total,
    page,
    pageCount: Math.ceil(total / limit),
    filterOptions,
  }
}

// Cached to avoid double-fetching in generateMetadata + page render
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const p = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: [{ name: 'asc' }, { value: 'asc' }] },
      categories: {
        include: {
          category: {
            include: { parent: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
      tags: { include: { tag: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  if (!p) return null

  const ratings = p.reviews.map((r) => r.rating)
  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAt: p.compareAt != null ? Number(p.compareAt) : null,
    sku: p.sku,
    stock: p.stock,
    isFeatured: p.isFeatured,
    attributes: p.attributes as Record<string, unknown> | null,
    images: p.images,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      price: v.price != null ? Number(v.price) : null,
      stock: v.stock,
      sku: v.sku,
    })),
    categories: p.categories.map((pc) => ({
      category: {
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
        parent: pc.category.parent,
      },
    })),
    tags: p.tags.map((t) => t.tag.name),
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: ratings.length,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      verified: r.verified,
      createdAt: r.createdAt,
      user: r.user,
    })),
  }
})

export const getRelatedProducts = cache(async (
  productId: string,
  categorySlug: string,
  limit = 4,
): Promise<ProductCard[]> => {
  if (!categorySlug) return []

  const products = await db.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...categoryWhere(categorySlug),
    },
    take: limit,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: {
      ...cardInclude,
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
    },
  })
  return products.map(toCard)
})

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryTree | null> => {
  const cat = await db.category.findUnique({
    where: { slug, isActive: true },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true, sortOrder: true },
      },
    },
  })
  return cat as CategoryTree | null
})

export async function getAllCategories() {
  return db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true, sortOrder: true },
      },
    },
  })
}

export async function getSearchSuggestions(q: string): Promise<SearchSuggestion[]> {
  if (!q || q.trim().length < 2) return []
  const trimmed = q.trim().slice(0, 100) // clamp to prevent abuse

  const [products, cats] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, name: { contains: trimmed, mode: 'insensitive' } },
      take: 5,
      select: { name: true, slug: true, images: { take: 1, select: { url: true } } },
      orderBy: { isFeatured: 'desc' },
    }),
    db.category.findMany({
      where: { isActive: true, name: { contains: trimmed, mode: 'insensitive' } },
      take: 3,
      select: { name: true, slug: true, parentId: true },
    }),
  ])

  return [
    ...products.map((p) => ({
      name: p.name,
      href: `/products/${p.slug}`,
      type: 'product' as const,
      image: p.images[0]?.url,
    })),
    ...cats.map((c) => ({
      name: c.name,
      href: `/categories/${c.slug}`,
      type: 'category' as const,
    })),
  ]
}

// Used by generateStaticParams on the PDP
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return products.map((p) => p.slug)
}
