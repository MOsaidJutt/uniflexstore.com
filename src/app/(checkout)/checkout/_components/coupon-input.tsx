'use client'

import { useState } from 'react'
import { Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { validateCoupon } from '@/server/actions/checkout'
import type { CouponValidation } from '@/types/checkout'

interface CouponInputProps {
  subtotal: number
  userId: string | null
  onApply: (result: CouponValidation, code: string) => void
  appliedCode: string
}

export function CouponInput({ subtotal, userId, onApply, appliedCode }: CouponInputProps) {
  const [code, setCode] = useState(appliedCode)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CouponValidation | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const validation = await validateCoupon(code, subtotal, userId)
      setResult(validation)
      onApply(validation, code.toUpperCase().trim())
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setResult(null)
    onApply({ valid: false, discountAmount: 0, discountType: null, message: '' }, '')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Coupon code"
            disabled={result?.valid}
            aria-label="Coupon code"
            className="h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        {result?.valid ? (
          <button
            onClick={handleRemove}
            className="h-10 rounded-lg border border-[var(--border-default)] px-4 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={!code.trim() || loading}
            className="h-10 rounded-lg bg-[var(--bg-subtle)] px-4 text-sm font-500 text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Apply'}
          </button>
        )}
      </div>

      {result && result.message && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-500 ${
            result.valid
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
          }`}
        >
          {result.valid ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {result.message}
        </div>
      )}
    </div>
  )
}
