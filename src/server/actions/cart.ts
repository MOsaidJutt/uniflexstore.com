'use server'

import { db } from '@/server/db'
import type { LocalCartItem } from '@/types/cart'
import type { Prisma } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type CartItemFull = Prisma.CartItemGetPayload<{
  include: {
    product: { include: { images: true } }
    variant: true
  }
}>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalItem(item: CartItemFull): LocalCartItem {
  const { product, variant, quantity } = item
  const price = variant?.price != null ? Number(variant.price) : Number(product.price)
  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    quantity,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.url ?? '',
    price,
    compareAt: product.compareAt != null ? Number(product.compareAt) : null,
    variantName: variant?.name ?? null,
    variantValue: variant?.value ?? null,
    stock: variant?.stock ?? product.stock,
  }
}

const cartInclude = {
  product: { include: { images: { orderBy: { sortOrder: 'asc' as const }, take: 1 } } },
  variant: true,
} satisfies Prisma.CartItemInclude

// ─── Upsert helper ────────────────────────────────────────────────────────────
// Prisma compound-unique `@@unique([userId, productId, variantId])` behaves
// differently when variantId is null: Postgres treats NULL as distinct, so we
// can't use the compound selector for null-variant items. Use findFirst+update
// for that path to guarantee correct identity.

async function upsertCartItem(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  mode: 'increment' | 'set' = 'increment'
): Promise<void> {
  if (variantId !== null) {
    await db.cartItem.upsert({
      where: { userId_productId_variantId: { userId, productId, variantId } },
      update: { quantity: mode === 'increment' ? { increment: quantity } : quantity },
      create: { userId, productId, variantId, quantity },
    })
    return
  }

  const existing = await db.cartItem.findFirst({ where: { userId, productId, variantId: null } })
  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: mode === 'increment' ? { increment: quantity } : quantity },
    })
  } else {
    await db.cartItem.create({ data: { userId, productId, variantId: null, quantity } })
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getCartDB(userId: string): Promise<LocalCartItem[]> {
  const items = await db.cartItem.findMany({
    where: { userId },
    include: cartInclude,
    orderBy: { createdAt: 'asc' },
  })
  return items.map(toLocalItem)
}

export async function addToCartDB(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  await upsertCartItem(userId, productId, variantId, quantity, 'increment')
}

export async function updateCartItemDB(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { userId, productId, variantId } })
    return
  }
  await upsertCartItem(userId, productId, variantId, quantity, 'set')
}

export async function removeFromCartDB(
  userId: string,
  productId: string,
  variantId: string | null
): Promise<void> {
  await db.cartItem.deleteMany({ where: { userId, productId, variantId } })
}

export async function clearCartDB(userId: string): Promise<void> {
  await db.cartItem.deleteMany({ where: { userId } })
}

export async function mergeCartDB(
  userId: string,
  guestItems: LocalCartItem[]
): Promise<void> {
  await Promise.all(
    guestItems.map((item) =>
      upsertCartItem(userId, item.productId, item.variantId, item.quantity, 'increment')
    )
  )
}
