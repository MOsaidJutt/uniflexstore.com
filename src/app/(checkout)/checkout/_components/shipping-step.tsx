'use client'

import { useState } from 'react'
import { m } from 'motion/react'
import { ArrowRight, ArrowLeft, Truck, Zap, Clock } from 'lucide-react'
import type { CheckoutAddress, ShippingMethod, CouponValidation } from '@/types/checkout'
import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from '@/types/checkout'
import { CouponInput } from './coupon-input'
import { easeSmooth, easeNormal } from '@/lib/motion'
import { cn } from '@/lib/utils'

const methodIcons = { standard: Truck, expedited: Zap, overnight: Clock }

interface ShippingStepProps {
  address: CheckoutAddress
  subtotal: number
  userId: string | null
  defaultMethodId: string | null
  couponCode: string
  couponDiscount: number
  onCouponApply: (result: CouponValidation, code: string) => void
  onBack: () => void
  onNext: (method: ShippingMethod) => void
  direction?: number
}

export function ShippingStep({
  address,
  subtotal,
  userId,
  defaultMethodId,
  couponCode,
  couponDiscount,
  onCouponApply,
  onBack,
  onNext,
  direction = 1,
}: ShippingStepProps) {
  const [selectedId, setSelectedId] = useState(defaultMethodId ?? 'standard')
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  const handleNext = () => {
    const method = SHIPPING_METHODS.find((m) => m.id === selectedId)!
    onNext(freeShipping && method.id === 'standard' ? { ...method, price: 0 } : method)
  }

  return (
    <m.div
      initial={{ opacity: 0, x: direction * 32 }}
      animate={{ opacity: 1, x: 0, transition: easeSmooth }}
      exit={{ opacity: 0, x: direction * -16, transition: easeNormal }}
    >
      <h2 className="mb-1 font-serif text-xl font-600 text-[var(--text-primary)]">
        Shipping method
      </h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Shipping to {address.city}, {address.state} {address.postalCode}
      </p>

      <fieldset className="mb-6 space-y-3">
        <legend className="sr-only">Choose a shipping method</legend>
        {SHIPPING_METHODS.map((method) => {
          const Icon = methodIcons[method.id as keyof typeof methodIcons] ?? Truck
          const isFree = freeShipping && method.id === 'standard'
          const isSelected = selectedId === method.id

          return (
            <label
              key={method.id}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-150',
                isSelected
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-teal-light)]'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
              )}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={isSelected}
                onChange={() => setSelectedId(method.id)}
                className="sr-only"
              />
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]'
                    : 'border-[var(--border-strong)]'
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isSelected ? 'text-[var(--brand-accent)]' : 'text-[var(--text-muted)]'
                )}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-600 text-[var(--text-primary)]">{method.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {method.description} · {method.estimatedDays}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {isFree ? (
                  <div>
                    <span className="text-sm font-700 text-emerald-600 dark:text-emerald-400">
                      Free
                    </span>
                    <span className="ml-1 text-xs text-[var(--text-muted)] line-through">
                      ${method.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-600 text-[var(--text-primary)]">
                    ${method.price.toFixed(2)}
                  </span>
                )}
              </div>
            </label>
          )
        })}
      </fieldset>

      <div className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
        <h3 className="mb-3 text-sm font-600 text-[var(--text-primary)]">Have a coupon?</h3>
        <CouponInput
          subtotal={subtotal - couponDiscount}
          userId={userId}
          onApply={onCouponApply}
          appliedCode={couponCode}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-3 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-secondary)]"
        >
          Continue to payment
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </m.div>
  )
}
