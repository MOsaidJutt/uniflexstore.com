import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/server/db'
import {
  addToCartDB,
  removeFromCartDB,
  updateCartItemDB,
  clearCartDB,
  getCartDB,
} from '@/server/actions/cart'
import { cancelOrder, submitReturnRequest } from '@/server/actions/orders'
import { validateCoupon } from '@/server/actions/checkout'

// ─── Sanity limits ─────────────────────────────────────────────────────────────

const MAX_SINGLE_QTY = 10
const MAX_CART_TOTAL = 5000 // USD — extra confirm prompt above this

// ─── Types ─────────────────────────────────────────────────────────────────────

type ActionRequest =
  | { action: 'cart_add'; params: { productId: string; quantity: number; variantId?: string | null } }
  | { action: 'cart_remove'; params: { productId: string; variantId?: string | null } }
  | { action: 'cart_update'; params: { productId: string; quantity: number; variantId?: string | null } }
  | { action: 'cart_clear'; params: Record<string, never> }
  | { action: 'apply_coupon'; params: { code: string } }
  | { action: 'order_cancel'; params: { orderId: string } }
  | { action: 'order_return'; params: { orderId: string; reason: string; details?: string } }

// ─── Logging ───────────────────────────────────────────────────────────────────

function logAction(userId: string | null, action: string, params: unknown, result: unknown) {
  console.log('[chat:action]', {
    ts: new Date().toISOString(),
    userId: userId ?? 'guest',
    action,
    params,
    ok: result,
  })
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.id ?? null

  if (!userId) {
    return NextResponse.json(
      { error: 'You must be signed in to perform this action.' },
      { status: 401 }
    )
  }

  let body: ActionRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action, params } = body

  try {
    switch (action) {
      // ── Cart: add ─────────────────────────────────────────────────────────────
      case 'cart_add': {
        const { productId, quantity, variantId = null } = params as { productId: string; quantity: number; variantId?: string | null }

        if (!productId || typeof quantity !== 'number' || quantity < 1) {
          return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 })
        }
        if (quantity > MAX_SINGLE_QTY) {
          return NextResponse.json(
            { error: `Maximum ${MAX_SINGLE_QTY} units per action.` },
            { status: 400 }
          )
        }

        // Re-validate product server-side (never trust client params)
        const product = await db.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, price: true, stock: true, isActive: true },
        })
        if (!product || !product.isActive) {
          return NextResponse.json({ error: 'Product is no longer available.' }, { status: 400 })
        }
        if (product.stock < quantity) {
          return NextResponse.json(
            { error: `Only ${product.stock} unit(s) in stock.` },
            { status: 400 }
          )
        }

        await addToCartDB(userId, productId, variantId ?? null, quantity)
        const cart = await getCartDB(userId)
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

        if (subtotal > MAX_CART_TOTAL) {
          logAction(userId, action, params, { warning: 'cart over limit', subtotal })
          return NextResponse.json({
            success: true,
            message: `Added to cart. Note: your cart total ($${subtotal.toFixed(2)}) is unusually high — please review before checkout.`,
            cartSubtotal: `$${subtotal.toFixed(2)}`,
            cartItemCount: cart.reduce((s, i) => s + i.quantity, 0),
          })
        }

        logAction(userId, action, params, { subtotal })
        return NextResponse.json({
          success: true,
          message: `Added ${quantity}× ${product.name} to your cart.`,
          cartSubtotal: `$${subtotal.toFixed(2)}`,
          cartItemCount: cart.reduce((s, i) => s + i.quantity, 0),
        })
      }

      // ── Cart: remove ──────────────────────────────────────────────────────────
      case 'cart_remove': {
        const { productId, variantId = null } = params as { productId: string; variantId?: string | null }
        if (!productId) return NextResponse.json({ error: 'Missing productId.' }, { status: 400 })

        await removeFromCartDB(userId, productId, variantId ?? null)
        const cart = await getCartDB(userId)
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

        logAction(userId, action, params, { subtotal })
        return NextResponse.json({
          success: true,
          message: 'Item removed from your cart.',
          cartSubtotal: `$${subtotal.toFixed(2)}`,
          cartItemCount: cart.reduce((s, i) => s + i.quantity, 0),
        })
      }

      // ── Cart: update quantity ─────────────────────────────────────────────────
      case 'cart_update': {
        const { productId, quantity, variantId = null } = params as { productId: string; quantity: number; variantId?: string | null }
        if (!productId || typeof quantity !== 'number' || quantity < 0) {
          return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 })
        }
        if (quantity > MAX_SINGLE_QTY) {
          return NextResponse.json(
            { error: `Maximum ${MAX_SINGLE_QTY} units.` },
            { status: 400 }
          )
        }

        await updateCartItemDB(userId, productId, variantId ?? null, quantity)
        const cart = await getCartDB(userId)
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

        logAction(userId, action, params, { subtotal })
        return NextResponse.json({
          success: true,
          message: quantity === 0 ? 'Item removed from cart.' : `Quantity updated to ${quantity}.`,
          cartSubtotal: `$${subtotal.toFixed(2)}`,
          cartItemCount: cart.reduce((s, i) => s + i.quantity, 0),
        })
      }

      // ── Cart: clear ───────────────────────────────────────────────────────────
      case 'cart_clear': {
        await clearCartDB(userId)
        logAction(userId, action, {}, { ok: true })
        return NextResponse.json({
          success: true,
          message: 'Your cart has been cleared.',
          cartSubtotal: '$0.00',
          cartItemCount: 0,
        })
      }

      // ── Apply coupon ──────────────────────────────────────────────────────────
      case 'apply_coupon': {
        const { code } = params as { code: string }
        if (!code) return NextResponse.json({ error: 'Missing coupon code.' }, { status: 400 })

        const cart = await getCartDB(userId)
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
        const result = await validateCoupon(code, subtotal, userId)

        logAction(userId, action, { code }, result)
        if (!result.valid) {
          return NextResponse.json({ error: result.message }, { status: 400 })
        }

        const res = NextResponse.json({
          success: true,
          message: result.message,
          discountAmount: `$${result.discountAmount.toFixed(2)}`,
          newSubtotal: `$${(subtotal - result.discountAmount).toFixed(2)}`,
          couponCode: code.toUpperCase(),
        })
        // Persist the code so the checkout page can pre-populate the coupon field
        res.cookies.set('__chat_coupon', code.toUpperCase(), {
          path: '/',
          maxAge: 60 * 60 * 24, // 24h
          sameSite: 'lax',
          httpOnly: true,
        })
        return res
      }

      // ── Order: cancel ─────────────────────────────────────────────────────────
      case 'order_cancel': {
        const { orderId } = params as { orderId: string }
        if (!orderId) return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 })

        await cancelOrder(orderId)
        logAction(userId, action, { orderId }, { ok: true })
        return NextResponse.json({
          success: true,
          message: `Order ${orderId.slice(-8)} has been cancelled. A confirmation email has been sent.`,
        })
      }

      // ── Order: return ─────────────────────────────────────────────────────────
      case 'order_return': {
        const { orderId, reason, details } = params as { orderId: string; reason: string; details?: string }
        if (!orderId || !reason) {
          return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        await submitReturnRequest(orderId, reason, details)
        logAction(userId, action, { orderId, reason }, { ok: true })
        return NextResponse.json({
          success: true,
          message: 'Return request submitted. Our team will review it within 1–2 business days.',
        })
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Action failed.'
    console.error('[chat:action] error', { action, userId, msg })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
