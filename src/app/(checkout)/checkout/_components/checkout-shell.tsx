'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { AddressStep } from './address-step'
import { ShippingStep } from './shipping-step'
import { PaymentStep } from './payment-step'
import { OrderSummary } from './order-summary'
import type { CheckoutAddress, CheckoutStep, ShippingMethod, CouponValidation } from '@/types/checkout'
import { SHIPPING_METHODS } from '@/types/checkout'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'address', label: 'Address' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
]

interface CheckoutShellProps {
  userId: string | null
  initialCouponCode?: string
}

export function CheckoutShell({ userId, initialCouponCode = '' }: CheckoutShellProps) {
  const { state, subtotal } = useCart()
  const { items } = state

  const [step, setStep] = useState<CheckoutStep>('address')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [address, setAddress] = useState<CheckoutAddress | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(
    SHIPPING_METHODS[0] ?? null
  )
  const [couponCode, setCouponCode] = useState(initialCouponCode)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const tax =
    step === 'payment' && shippingMethod
      ? Math.round(Math.max(subtotal - couponDiscount, 0) * 0.08 * 100) / 100
      : 0

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const goTo = (next: CheckoutStep) => {
    const nextIdx = STEPS.findIndex((s) => s.id === next)
    setDirection(nextIdx > stepIndex ? 1 : -1)
    setStep(next)
  }

  const handleAddressNext = (data: CheckoutAddress) => {
    setAddress(data)
    goTo('shipping')
  }

  const handleShippingNext = (method: ShippingMethod) => {
    setShippingMethod(method)
    goTo('payment')
  }

  const handleCoupon = (result: CouponValidation, code: string) => {
    setCouponCode(code)
    setCouponDiscount(result.valid ? result.discountAmount : 0)
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-500 text-[var(--text-primary)]">Your cart is empty</p>
        <p className="text-sm text-[var(--text-muted)]">Add items before proceeding to checkout.</p>
        <Link
          href="/products"
          className="mt-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)]"
        >
          Shop now
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <nav aria-label="Checkout progress" className="mb-10">
        <ol className="flex items-start" role="list">
          {STEPS.map((s, i) => {
            const done = stepIndex > i
            const active = stepIndex === i
            return (
              <li key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-600 shadow-sm transition-all duration-300',
                      done
                        ? 'bg-[var(--brand-accent)] text-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-accent)_18%,transparent)]'
                        : active
                          ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]'
                          : 'border-2 border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-muted)]'
                    )}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-xs font-500 transition-colors duration-200 sm:block',
                      active
                        ? 'font-600 text-[var(--text-primary)]'
                        : done
                          ? 'text-[var(--brand-accent)]'
                          : 'text-[var(--text-muted)]'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="relative mx-3 mb-5 h-px flex-1 bg-[var(--border-default)] overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-[var(--brand-accent)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: stepIndex > i ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Main layout: form + summary */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Step form — direction-aware slide */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 'address' && (
              <AddressStep
                key="address"
                direction={direction}
                defaultValues={address ?? undefined}
                onNext={handleAddressNext}
              />
            )}
            {step === 'shipping' && address && (
              <ShippingStep
                key="shipping"
                direction={direction}
                address={address}
                subtotal={subtotal}
                userId={userId}
                defaultMethodId={shippingMethod?.id ?? null}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                onCouponApply={handleCoupon}
                onBack={() => goTo('address')}
                onNext={handleShippingNext}
              />
            )}
            {step === 'payment' && address && shippingMethod && (
              <PaymentStep
                key="payment"
                direction={direction}
                cartItems={items}
                address={address}
                shippingMethod={shippingMethod}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                userId={userId}
                onBack={() => goTo('shipping')}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingMethod={step !== 'address' ? shippingMethod : null}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            tax={tax}
          />
        </aside>
      </div>
    </div>
  )
}
