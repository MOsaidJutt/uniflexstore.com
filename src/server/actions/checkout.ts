'use server'

import { db } from '@/server/db'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { checkCouponRate } from '@/lib/rate-limit'
import type { LocalCartItem } from '@/types/cart'
import type { CheckoutAddress, ShippingMethod } from '@/types/checkout'
import type { CouponValidation } from '@/types/checkout'
import { Prisma } from '@prisma/client'

// ─── Coupon Validation ────────────────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId: string | null
): Promise<CouponValidation> {
  if (!code.trim()) {
    return { valid: false, discountAmount: 0, discountType: null, message: '' }
  }

  const allowed = await checkCouponRate()
  if (!allowed) {
    return { valid: false, discountAmount: 0, discountType: null, message: 'Too many attempts. Please wait a moment.' }
  }

  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  })

  if (!coupon || !coupon.isActive) {
    return { valid: false, discountAmount: 0, discountType: null, message: 'Invalid coupon code.' }
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, discountAmount: 0, discountType: null, message: 'This coupon has expired.' }
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discountAmount: 0, discountType: null, message: 'This coupon has reached its usage limit.' }
  }

  if (coupon.minOrderAmt != null && subtotal < Number(coupon.minOrderAmt)) {
    return {
      valid: false,
      discountAmount: 0,
      discountType: null,
      message: `Minimum order of $${Number(coupon.minOrderAmt).toFixed(2)} required.`,
    }
  }

  if (userId) {
    const used = await db.couponUsage.count({ where: { couponId: coupon.id, userId } })
    if (used > 0) {
      return { valid: false, discountAmount: 0, discountType: null, message: 'You have already used this coupon.' }
    }
  }

  const discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.min(subtotal * (Number(coupon.value) / 100), subtotal)
      : Math.min(Number(coupon.value), subtotal)

  return {
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountType: coupon.discountType,
    message: `${coupon.discountType === 'PERCENTAGE' ? `${Number(coupon.value)}%` : `$${Number(coupon.value).toFixed(2)}`} discount applied!`,
  }
}

// ─── Create PaymentIntent + Order ─────────────────────────────────────────────

export interface CreateCheckoutResult {
  clientSecret: string
  orderId: string
}

export async function createCheckoutSession(params: {
  cartItems: LocalCartItem[]
  address: CheckoutAddress
  shippingMethod: ShippingMethod
  couponCode: string
  couponDiscount: number
  userId: string | null
}): Promise<{ success: true; data: CreateCheckoutResult } | { success: false; error: string }> {
  const { cartItems, address, shippingMethod, couponCode, couponDiscount, userId } = params

  if (cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty.' }
  }

  // Verify stock and lock in server-side prices
  const productIds = cartItems.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  })

  const lineItems: Array<{
    productId: string
    variantId: string | null
    quantity: number
    price: number
    name: string
  }> = []

  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.productId)
    if (!product || !product.isActive) {
      return { success: false, error: `"${item.name}" is no longer available.` }
    }

    let price = Number(product.price)
    let stock = product.stock

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return { success: false, error: `Selected variant for "${item.name}" is no longer available.` }
      }
      if (variant.price != null) price = Number(variant.price)
      stock = variant.stock
    }

    if (stock < item.quantity) {
      return { success: false, error: `"${item.name}" only has ${stock} units available.` }
    }

    lineItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      name: item.name,
    })
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = shippingMethod.price
  const discount = couponDiscount
  // Flat 8% on discounted subtotal. TODO: replace with stripe.tax.calculations.create()
  // once Stripe Tax is enabled in the dashboard.
  const taxableAmount = Math.max(subtotal - discount, 0)
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100
  const total = Math.round((taxableAmount + shipping + tax) * 100) / 100

  // Persist shipping address
  let addressId: string | undefined
  let shippingAddressSnapshot: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull

  if (userId) {
    const saved = await db.address.create({
      data: {
        userId,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        isDefault: false,
      },
    })
    addressId = saved.id
  } else {
    shippingAddressSnapshot = {
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    } as Prisma.InputJsonValue
  }

  // Create order in PENDING state BEFORE calling Stripe so we have an ID
  const order = await db.order.create({
    data: {
      userId: userId ?? null,
      guestEmail: userId ? null : address.email,
      status: 'PENDING',
      subtotal,
      shippingCost: shipping,
      shippingMethod: shippingMethod.id,
      tax,
      discount,
      total,
      couponCode: couponCode || null,
      addressId: addressId ?? null,
      shippingAddress: shippingAddressSnapshot,
      items: {
        create: lineItems.map((li) => ({
          productId: li.productId,
          variantId: li.variantId,
          quantity: li.quantity,
          price: li.price,
        })),
      },
    },
  })

  // Create Stripe PaymentIntent — if this fails we delete the order so no orphans
  let paymentIntent: Awaited<ReturnType<typeof stripe.paymentIntents.create>>
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total),
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: userId ?? 'guest',
        guestEmail: address.email,
      },
      receipt_email: address.email,
      description: `UniFlex Store order ${order.id}`,
      shipping: {
        name: `${address.firstName} ${address.lastName}`,
        phone: address.phone || undefined,
        address: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state,
          postal_code: address.postalCode,
          country: 'US',
        },
      },
    })
  } catch (err) {
    // Roll back the order so it doesn't become an orphaned PENDING record
    await db.order.delete({ where: { id: order.id } }).catch(() => {})
    const msg = err instanceof Error ? err.message : 'Payment initialization failed.'
    console.error('[checkout] Stripe PaymentIntent creation failed:', msg)
    return { success: false, error: 'Unable to initialize payment. Please try again.' }
  }

  await db.order.update({
    where: { id: order.id },
    data: { stripePaymentId: paymentIntent.id },
  })

  return {
    success: true,
    data: { clientSecret: paymentIntent.client_secret!, orderId: order.id },
  }
}
