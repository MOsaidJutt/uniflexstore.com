'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { requireAuth } from '@/lib/dal'
import { sendCancellationEmail } from '@/lib/email'

// ─── Read ─────────────────────────────────────────────────────────────

export async function getOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderById(orderId: string, userId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
      returnRequest: true,
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────

export async function cancelOrder(orderId: string) {
  const session = await requireAuth()

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: { include: { product: true, variant: true } },
      address: true,
    },
  })

  if (!order) throw new Error('Order not found')
  if (!['PENDING', 'PROCESSING'].includes(order.status)) {
    throw new Error('This order can no longer be cancelled')
  }

  const cancelled = await db.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
    },
  })

  const email = session.user.email
  if (email) {
    await sendCancellationEmail({
      to: email,
      customerName: session.user.name ?? undefined,
      order: cancelled,
    }).catch(() => {})
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
}

export async function submitReturnRequest(
  orderId: string,
  reason: string,
  details?: string,
) {
  const session = await requireAuth()

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  })

  if (!order) throw new Error('Order not found')
  if (order.status !== 'DELIVERED') {
    throw new Error('Returns are only available for delivered orders')
  }

  await db.returnRequest.upsert({
    where: { orderId },
    update: { reason, details: details ?? null, status: 'PENDING', updatedAt: new Date() },
    create: { orderId, userId: session.user.id, reason, details: details ?? null },
  })

  revalidatePath(`/orders/${orderId}`)
}
