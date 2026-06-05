'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { requireAuth, requireAdmin } from '@/lib/dal'
import {
  sendCancellationEmail,
  sendShippingUpdateEmail,
  sendRefundEmail,
} from '@/lib/email'

const VALID_REASONS = ['damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'other'] as const

// ─── Customer actions ─────────────────────────────────────────────────

export async function cancelOrder(orderId: string) {
  const session = await requireAuth()

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
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
    }).catch((err) => console.error('[cancelOrder] email failed:', err))
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

  if (!VALID_REASONS.includes(reason as typeof VALID_REASONS[number])) {
    throw new Error('Invalid reason')
  }
  if (details && details.length > 500) {
    throw new Error('Details must be 500 characters or fewer')
  }

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  })

  if (!order) throw new Error('Order not found')
  if (order.status !== 'DELIVERED') {
    throw new Error('Returns are only available for delivered orders')
  }

  await db.returnRequest.upsert({
    where: { orderId },
    update: { reason, details: details ?? null, status: 'PENDING' },
    create: { orderId, userId: session.user.id, reason, details: details ?? null },
  })

  revalidatePath(`/orders/${orderId}`)
}

// ─── Admin actions ────────────────────────────────────────────────────

type ShippableStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export async function updateOrderStatus(
  orderId: string,
  newStatus: ShippableStatus,
  opts: { trackingNumber?: string; trackingUrl?: string } = {},
) {
  await requireAdmin()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!order) throw new Error('Order not found')

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      ...(opts.trackingNumber ? { trackingNumber: opts.trackingNumber } : {}),
      ...(opts.trackingUrl    ? { trackingUrl: opts.trackingUrl }       : {}),
    },
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

  const recipientEmail = order.user?.email ?? order.guestEmail
  const customerName   = order.user?.name ?? undefined

  if (recipientEmail) {
    if (newStatus === 'SHIPPED') {
      await sendShippingUpdateEmail({
        to: recipientEmail,
        customerName,
        order: updated,
        trackingNumber: opts.trackingNumber,
        trackingUrl: opts.trackingUrl,
      }).catch((err) => console.error('[updateOrderStatus] shipping email failed:', err))
    } else if (newStatus === 'REFUNDED') {
      await sendRefundEmail({
        to: recipientEmail,
        customerName,
        order: updated,
      }).catch((err) => console.error('[updateOrderStatus] refund email failed:', err))
    } else if (newStatus === 'CANCELLED') {
      await sendCancellationEmail({
        to: recipientEmail,
        customerName,
        order: updated,
      }).catch((err) => console.error('[updateOrderStatus] cancellation email failed:', err))
    }
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
}
