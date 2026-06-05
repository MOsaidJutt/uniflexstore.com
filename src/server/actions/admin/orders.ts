'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'
import { stripe } from '@/lib/stripe'
import { sendShippingUpdateEmail, sendRefundEmail } from '@/lib/email'
import type { OrderStatus } from '@prisma/client'

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  trackingUrl?: string
) {
  await requireAdmin()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
      address: true,
    },
  })
  if (!order) return { error: 'Order not found' }

  await db.order.update({
    where: { id: orderId },
    data: { status, ...(trackingNumber ? { trackingNumber } : {}), ...(trackingUrl ? { trackingUrl } : {}) },
  })

  // Send email on status transitions
  const email = order.user?.email ?? order.guestEmail
  if (email && status === 'SHIPPED') {
    await sendShippingUpdateEmail({
      to: email,
      customerName: order.user?.name ?? undefined,
      order: {
        id: order.id,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        shippingMethod: order.shippingMethod,
        couponCode: order.couponCode,
        trackingNumber: trackingNumber ?? order.trackingNumber,
        trackingUrl: trackingUrl ?? order.trackingUrl,
        address: order.address,
        shippingAddress: order.shippingAddress,
        items: order.items.map((i) => ({
          product: { name: i.product.name, images: i.product.images },
          variant: i.variant,
          quantity: i.quantity,
          price: i.price,
        })),
      },
      trackingNumber: trackingNumber ?? order.trackingNumber ?? undefined,
      trackingUrl: trackingUrl ?? order.trackingUrl ?? undefined,
    })
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function issueStripeRefund(orderId: string, reason?: string) {
  await requireAdmin()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
      address: true,
    },
  })
  if (!order) return { error: 'Order not found' }
  if (!order.stripePaymentId) return { error: 'No payment ID on this order' }

  try {
    await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
      reason: 'requested_by_customer',
    })

    await db.order.update({ where: { id: orderId }, data: { status: 'REFUNDED' } })

    const email = order.user?.email ?? order.guestEmail
    if (email) {
      await sendRefundEmail({
        to: email,
        customerName: order.user?.name ?? undefined,
        order: {
          id: order.id,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          shippingMethod: order.shippingMethod,
          couponCode: order.couponCode,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          address: order.address,
          shippingAddress: order.shippingAddress,
          items: order.items.map((i) => ({
            product: { name: i.product.name, images: i.product.images },
            variant: i.variant,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      })
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Refund failed' }
  }
}

export async function updateReturnStatus(returnId: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') {
  await requireAdmin()
  await db.returnRequest.update({ where: { id: returnId }, data: { status } })
  revalidatePath('/admin/orders')
  return { success: true }
}
