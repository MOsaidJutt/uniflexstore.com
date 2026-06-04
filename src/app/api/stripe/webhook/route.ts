import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/server/db'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[webhook] signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
    }
  } catch (err) {
    console.error('[webhook] handler error:', err)
    return NextResponse.json({ error: 'Internal handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.warn('[webhook] payment_intent.succeeded missing orderId metadata')
    return
  }

  // Idempotency: only process once
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order || order.status !== 'PENDING') {
    console.log(`[webhook] order ${orderId} already processed (status: ${order?.status})`)
    return
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
  })

  // Clear DB cart for registered users
  const userId = paymentIntent.metadata?.userId
  if (userId && userId !== 'guest') {
    await db.cartItem.deleteMany({ where: { userId } })
  }

  // Record coupon usage so limits are enforced correctly
  if (order.couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: order.couponCode } })
    if (coupon) {
      await db.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      })
      if (order.userId) {
        await db.couponUsage
          .create({ data: { couponId: coupon.id, userId: order.userId, orderId: order.id } })
          .catch(() => {}) // Ignore duplicate on retry
      }
    }
  }

  // Phase 4 hook: sendOrderConfirmationEmail(order)

  console.log(`[webhook] order ${orderId} → PROCESSING`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) return

  await db.order
    .update({ where: { id: orderId }, data: { status: 'CANCELLED' } })
    .catch(() => {})

  console.log(`[webhook] order ${orderId} → CANCELLED (payment failed)`)
}
