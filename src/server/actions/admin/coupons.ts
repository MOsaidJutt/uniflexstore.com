'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'

const CouponSchema = z.object({
  code: z.string().min(1, { error: 'Code required' }).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.coerce.number().positive({ error: 'Value must be positive' }),
  minOrderAmt: z.coerce.number().optional(),
  maxUses: z.coerce.number().int().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function createCoupon(data: z.infer<typeof CouponSchema>) {
  await requireAdmin()
  const parsed = CouponSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { expiresAt, ...rest } = parsed.data
  try {
    await db.coupon.create({
      data: {
        ...rest,
        minOrderAmt: rest.minOrderAmt ?? null,
        maxUses: rest.maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    revalidatePath('/admin/coupons')
    return { success: true }
  } catch {
    return { error: 'Coupon code already exists' }
  }
}

export async function updateCoupon(id: string, data: z.infer<typeof CouponSchema>) {
  await requireAdmin()
  const parsed = CouponSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { expiresAt, ...rest } = parsed.data
  await db.coupon.update({
    where: { id },
    data: {
      ...rest,
      minOrderAmt: rest.minOrderAmt ?? null,
      maxUses: rest.maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  await requireAdmin()
  await db.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function getCoupons() {
  return db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  })
}
