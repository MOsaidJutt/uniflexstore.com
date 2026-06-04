'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { m } from 'motion/react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { useTheme } from 'next-themes'
import { ArrowLeft, Lock, Loader2, AlertCircle } from 'lucide-react'
import type { LocalCartItem } from '@/types/cart'
import type { CheckoutAddress, ShippingMethod } from '@/types/checkout'
import { createCheckoutSession } from '@/server/actions/checkout'
import { easeSmooth, easeNormal } from '@/lib/motion'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Payment form (must be inside Elements) ───────────────────────────────────

function PaymentForm({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: submitErr } = await elements.submit()
    if (submitErr) {
      setError(submitErr.message ?? 'Please check your payment details.')
      setLoading(false)
      return
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order/${orderId}/confirmation` },
    })

    if (confirmErr) {
      setError(confirmErr.message ?? 'Payment failed. Please try again.')
      setLoading(false)
    }
    // On success Stripe redirects — no further client action needed
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{ layout: 'tabs', wallets: { applePay: 'auto', googlePay: 'auto' } }}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-3 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pay now
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-[var(--text-muted)]">
        Your payment is secured with 256-bit SSL encryption
      </p>
    </form>
  )
}

// ─── Outer wrapper — creates session and mounts Elements ──────────────────────

interface PaymentStepProps {
  cartItems: LocalCartItem[]
  address: CheckoutAddress
  shippingMethod: ShippingMethod
  couponCode: string
  couponDiscount: number
  userId: string | null
  onBack: () => void
  direction?: number
}

export function PaymentStep({
  cartItems,
  address,
  shippingMethod,
  couponCode,
  couponDiscount,
  userId,
  onBack,
  direction = 1,
}: PaymentStepProps) {
  const { resolvedTheme } = useTheme()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(true)
  const createdRef = useRef(false)

  useEffect(() => {
    if (createdRef.current) return
    createdRef.current = true

    createCheckoutSession({ cartItems, address, shippingMethod, couponCode, couponDiscount, userId })
      .then((result) => {
        if (result.success) {
          setClientSecret(result.data.clientSecret)
          setOrderId(result.data.orderId)
        } else {
          setError(result.error)
        }
        setCreating(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Memoize so Stripe Elements doesn't re-initialise on unrelated re-renders
  const appearance = useMemo<StripeElementsOptions['appearance']>(
    () => ({
      theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
      variables: {
        colorPrimary: resolvedTheme === 'dark' ? '#29c4d9' : '#1daabc',
        colorBackground: resolvedTheme === 'dark' ? '#0a1520' : '#f8fafb',
        colorText: resolvedTheme === 'dark' ? '#e8f4f8' : '#0d1f2d',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    }),
    [resolvedTheme]
  )

  return (
    <m.div
      initial={{ opacity: 0, x: direction * 32 }}
      animate={{ opacity: 1, x: 0, transition: easeSmooth }}
      exit={{ opacity: 0, x: direction * -16, transition: easeNormal }}
    >
      <h2 className="mb-6 font-serif text-xl font-600 text-[var(--text-primary)]">Payment</h2>

      {creating ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2
            className="h-8 w-8 animate-spin text-[var(--brand-accent)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--text-muted)]">Preparing your secure checkout…</p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 px-5 py-4 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
        >
          <p className="font-600">Unable to create checkout</p>
          <p className="mt-1">{error}</p>
          <button onClick={onBack} className="mt-3 font-500 underline underline-offset-2">
            Go back and try again
          </button>
        </div>
      ) : clientSecret && orderId ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <PaymentForm orderId={orderId} onBack={onBack} />
        </Elements>
      ) : null}
    </m.div>
  )
}
