'use client'

import { useState, useRef, useEffect } from 'react'
import { m } from 'motion/react'
import { Check, X, Loader2, ShoppingCart, Trash2, Tag, PackageX, RotateCcw, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { confirmCard } from '@/lib/motion'
import type { Transition } from 'motion/react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Proposal = {
  type: 'proposal'
  proposalId: string
  action: string
  label: string
  description: string
  priceImpact: string | null
  currentCartSubtotal: string | null
  newCartSubtotal: string | null
  imageUrl: string | null
  params: { action: string; params: Record<string, unknown> }
}

type ConfirmState = 'idle' | 'loading' | 'success' | 'error'

interface ConfirmationCardProps {
  proposal: Proposal
  reduced: boolean
  onConfirm: (params: Proposal['params']) => Promise<{ message: string }>
  onCancel: () => void
  /** Called immediately on confirm success; the parent schedules the dismiss timeout */
  onSuccess?: () => void
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ACTION_ICONS: Record<string, React.ReactNode> = {
  cart_add: <ShoppingCart className="h-4 w-4" />,
  cart_remove: <Trash2 className="h-4 w-4" />,
  cart_update: <ShoppingCart className="h-4 w-4" />,
  cart_clear: <Trash2 className="h-4 w-4" />,
  apply_coupon: <Tag className="h-4 w-4" />,
  order_cancel: <PackageX className="h-4 w-4" />,
  order_return: <RotateCcw className="h-4 w-4" />,
}

const ACTION_CONFIRM_LABEL: Record<string, string> = {
  cart_add: 'Add to cart',
  cart_remove: 'Remove',
  cart_update: 'Update',
  cart_clear: 'Clear cart',
  apply_coupon: 'Apply coupon',
  order_cancel: 'Cancel order',
  order_return: 'Submit return',
}

const INSTANT: Transition = { duration: 0 }

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmationCard({ proposal, reduced, onConfirm, onCancel, onSuccess }: ConfirmationCardProps) {
  const [state, setState] = useState<ConfirmState>('idle')
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const isDangerous = proposal.action === 'cart_clear' || proposal.action === 'order_cancel'
  const icon = ACTION_ICONS[proposal.action] ?? <ArrowRight className="h-4 w-4" />
  const confirmLabel = ACTION_CONFIRM_LABEL[proposal.action] ?? 'Confirm'

  // Move focus to result area so screen readers and keyboard users know what happened
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      resultRef.current?.focus()
    }
  }, [state])

  const handleConfirm = async () => {
    setState('loading')
    try {
      const result = await onConfirm(proposal.params)
      setResultMsg(result.message)
      setState('success')
      onSuccess?.()
    } catch (err) {
      setResultMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <m.div
      variants={confirmCard}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={reduced ? INSTANT : undefined}
      className="mx-4 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-[0_4px_16px_-4px_rgba(10,21,32,0.15),0_0_0_1px_rgba(29,170,188,0.06)]"
    >
      {/* Header strip */}
      <div
        className={[
          'flex items-center gap-2 px-3.5 py-2.5',
          isDangerous
            ? 'bg-[var(--error)]/8 text-[var(--error)]'
            : 'bg-[var(--brand-accent)]/8 text-[var(--brand-accent)]',
        ].join(' ')}
      >
        {icon}
        <span className="text-xs font-600">{proposal.label}</span>
      </div>

      {/* Body */}
      {state === 'idle' || state === 'loading' ? (
        <div className="px-3.5 py-3">
          {/* Product preview row */}
          <div className="flex items-center gap-3">
            {proposal.imageUrl && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
                <Image
                  src={proposal.imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-500 text-[var(--text-primary)]">
                {proposal.description}
              </p>
              {proposal.priceImpact && (
                <p
                  className={[
                    'mt-0.5 text-xs font-600',
                    proposal.priceImpact.startsWith('-')
                      ? 'text-[var(--success)]'
                      : 'text-[var(--text-secondary)]',
                  ].join(' ')}
                >
                  {proposal.priceImpact}
                </p>
              )}
            </div>
          </div>

          {/* Cart subtotal change */}
          {proposal.currentCartSubtotal && proposal.newCartSubtotal && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] px-3 py-2 text-xs">
              <span className="text-[var(--text-muted)]">Cart total:</span>
              <span className="font-500 text-[var(--text-secondary)] line-through">
                {proposal.currentCartSubtotal}
              </span>
              <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
              <span className="font-600 text-[var(--text-primary)]">{proposal.newCartSubtotal}</span>
            </div>
          )}

          {/* Actions — h-11 (44px) meets mobile touch target minimum */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onCancel}
              disabled={state === 'loading'}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-primary)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={state === 'loading'}
              className={[
                'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-600 transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                isDangerous
                  ? 'bg-[var(--error)] text-white hover:opacity-90 focus-visible:ring-[var(--error)]'
                  : 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] focus-visible:ring-[var(--brand-accent)]',
              ].join(' ')}
            >
              {state === 'loading' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                icon
              )}
              {state === 'loading' ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      ) : state === 'success' ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="flex items-center gap-2.5 px-3.5 py-3.5 focus:outline-none"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/12">
            <Check className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="text-xs text-[var(--text-primary)]">{resultMsg}</p>
        </div>
      ) : (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="flex items-center gap-2.5 px-3.5 py-3.5 focus:outline-none"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/12">
            <X className="h-4 w-4 text-[var(--error)]" />
          </div>
          {resultMsg === 'SIGN_IN_REQUIRED' ? (
            <p className="text-xs text-[var(--error)]">
              Please{' '}
              <a
                href="/auth/login"
                className="font-600 underline underline-offset-2 hover:opacity-80"
              >
                sign in
              </a>
              {' '}to perform this action.
            </p>
          ) : (
            <p className="text-xs text-[var(--error)]">{resultMsg}</p>
          )}
        </div>
      )}
    </m.div>
  )
}
