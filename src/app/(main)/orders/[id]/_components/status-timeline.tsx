'use client'

import { useEffect, useRef } from 'react'
import { m, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Clock, Cog, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const STEPS = [
  { status: 'PENDING'    as const, label: 'Order placed',  sub: 'Payment confirmed',     Icon: Clock        },
  { status: 'PROCESSING' as const, label: 'Processing',    sub: 'Preparing your items',  Icon: Cog          },
  { status: 'SHIPPED'    as const, label: 'Shipped',       sub: 'On its way to you',     Icon: Truck        },
  { status: 'DELIVERED'  as const, label: 'Delivered',     sub: 'Package in your hands', Icon: CheckCircle2 },
]

function getActiveIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.status === status)
}

// ── Motion variants ───────────────────────────────────────────────────
// All variants share hidden/visible keys so parent stagger cascades correctly.

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const stepRow: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
}

// Shares hidden/visible keys with container — inherits stagger from stepRow parent.
const circleIn: Variants = {
  hidden:  { scale: 0.7, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.45, bounce: 0.15 } },
}

// Check icon appears 100ms after its containing circle.
const checkIn: Variants = {
  hidden:  { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', duration: 0.35, bounce: 0.2, delay: 0.1 },
  },
}

// Connector line draws downward — originY: 0 is critical.
const lineGrow: Variants = {
  empty:  { scaleY: 0 },
  filled: { scaleY: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

// Sonar pulse on active step — uses brand accent token, not hardcoded hex.
const pulse: Variants = {
  rest: { scale: 1, opacity: 0 },
  live: {
    scale:   [1, 1.8, 2.4],
    opacity: [0.55, 0.25, 0],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeOut',
      times: [0, 0.5, 1],
      repeatDelay: 0.3,
    },
  },
}

// ── Component ─────────────────────────────────────────────────────────

interface Props {
  status: OrderStatus
  updatedAt?: Date
}

export function StatusTimeline({ status, updatedAt }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const activeIdx = getActiveIndex(status)
  const isCancelled = status === 'CANCELLED'
  const isRefunded  = status === 'REFUNDED'
  const isTerminal  = isCancelled || isRefunded

  // Pause sonar when tab is hidden to avoid wasted animation frames.
  const pulseRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (shouldReduceMotion || isTerminal) return
    const onVis = () => {
      if (pulseRef.current) {
        pulseRef.current.style.animationPlayState = document.hidden ? 'paused' : 'running'
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [shouldReduceMotion, isTerminal])

  return (
    <div>
      {/* Terminal state banner */}
      {isTerminal && (
        <div
          className={[
            'mb-6 flex items-center gap-3 rounded-xl px-4 py-3.5',
            isCancelled
              ? 'bg-red-50 dark:bg-red-950/20'
              : 'bg-[var(--bg-subtle)]',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          {isCancelled ? (
            <XCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          ) : (
            <RotateCcw className="h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          )}
          <p className={[
            'text-sm font-600',
            isCancelled ? 'text-red-700 dark:text-red-400' : 'text-[var(--text-secondary)]',
          ].join(' ')}>
            {isCancelled ? 'This order was cancelled' : 'A refund has been issued for this order'}
          </p>
        </div>
      )}

      {!isTerminal && (
        <m.ol
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
          aria-label="Order progress"
        >
          {STEPS.map((step, i) => {
            const isCompleted = i < activeIdx
            const isActive    = i === activeIdx
            const isFuture    = i > activeIdx
            const isLast      = i === STEPS.length - 1

            const stepState = isCompleted ? 'Completed' : isActive ? 'In progress' : 'Pending'

            return (
              <m.li key={step.status} variants={stepRow} className="flex gap-4">
                {/* Left: circle + connector */}
                <div className="flex flex-col items-center" aria-hidden="true">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                    {/* Sonar pulse — brand accent token, disabled on reduced motion */}
                    {isActive && !shouldReduceMotion && (
                      <m.span
                        ref={pulseRef}
                        variants={pulse}
                        initial="rest"
                        animate="live"
                        className="absolute inset-0 rounded-full bg-[var(--brand-accent)]"
                        aria-hidden="true"
                      />
                    )}

                    {/* Circle — inherits stagger from stepRow via shared hidden/visible keys */}
                    <m.span
                      variants={circleIn}
                      className={[
                        'relative flex h-9 w-9 items-center justify-center rounded-full',
                        isCompleted ? 'bg-[var(--brand-accent)]'                                         : '',
                        isActive    ? 'bg-[var(--brand-accent)] ring-4 ring-[var(--brand-accent)]/20'    : '',
                        isFuture    ? 'bg-[var(--bg-muted)] ring-1 ring-[var(--border-subtle)]'          : '',
                      ].join(' ')}
                    >
                      {isCompleted ? (
                        <m.span variants={checkIn}>
                          <step.Icon className="h-4 w-4 text-white" />
                        </m.span>
                      ) : (
                        <step.Icon
                          className={[
                            'h-4 w-4',
                            isActive ? 'text-white'                : '',
                            isFuture ? 'text-[var(--text-muted)]' : '',
                          ].join(' ')}
                        />
                      )}
                    </m.span>
                  </div>

                  {/* Connector line — brand accent token */}
                  {!isLast && (
                    <div className="relative mt-1 h-12 w-0.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                      <m.span
                        variants={lineGrow}
                        initial="empty"
                        animate={i < activeIdx ? 'filled' : 'empty'}
                        style={{ originY: 0 }}
                        className="absolute inset-0 rounded-full bg-[var(--brand-accent)]"
                      />
                    </div>
                  )}
                </div>

                {/* Right: text — completion state readable by screen readers */}
                <div className={['pt-1', isLast ? '' : 'pb-10'].join(' ')}>
                  <p className={[
                    'text-sm font-600 leading-none',
                    isFuture ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]',
                  ].join(' ')}>
                    {step.label}
                    <span className="sr-only"> — {stepState}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{step.sub}</p>
                  {isActive && updatedAt && (
                    <time
                      dateTime={updatedAt.toISOString()}
                      className="mt-0.5 block font-mono text-[11px] text-[var(--text-muted)]"
                    >
                      {updatedAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  )}
                </div>
              </m.li>
            )
          })}
        </m.ol>
      )}
    </div>
  )
}
