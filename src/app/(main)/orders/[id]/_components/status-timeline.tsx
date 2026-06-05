'use client'

import { m, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Clock, Cog, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

type ActiveStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
type OrderStatus = ActiveStatus | 'CANCELLED' | 'REFUNDED'

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

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const stepRow: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
}

const circleIn: Variants = {
  inactive: { scale: 0.7, opacity: 0 },
  active:   { scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.45, bounce: 0.15 } },
}

const checkIn: Variants = {
  hidden:  { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', duration: 0.35, bounce: 0.2, delay: 0.1 },
  },
}

// Connector line draws downward — transformOrigin MUST be 'top'
const lineGrow: Variants = {
  empty:  { scaleY: 0 },
  filled: { scaleY: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

// Sonar pulse on active step
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
          role="list"
          className="flex flex-col"
        >
          {STEPS.map((step, i) => {
            const isCompleted = i < activeIdx
            const isActive    = i === activeIdx
            const isFuture    = i > activeIdx
            const isLast      = i === STEPS.length - 1

            return (
              <m.li key={step.status} variants={stepRow} className="flex gap-4">
                {/* Left: circle + connector */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                    {/* Sonar pulse */}
                    {isActive && !shouldReduceMotion && (
                      <m.span
                        variants={pulse}
                        initial="rest"
                        animate="live"
                        className="absolute inset-0 rounded-full bg-[#1daabc]"
                        aria-hidden="true"
                      />
                    )}

                    {/* Circle */}
                    <m.span
                      variants={circleIn}
                      initial="inactive"
                      animate="active"
                      className={[
                        'relative flex h-9 w-9 items-center justify-center rounded-full',
                        isCompleted ? 'bg-[#1daabc]'                                              : '',
                        isActive    ? 'bg-[#1daabc] ring-4 ring-[#1daabc]/20'                     : '',
                        isFuture    ? 'bg-[var(--bg-muted)] ring-1 ring-[var(--border-subtle)]'   : '',
                      ].join(' ')}
                    >
                      {isCompleted ? (
                        <m.span variants={checkIn} initial="hidden" animate="visible">
                          <step.Icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </m.span>
                      ) : (
                        <step.Icon
                          className={[
                            'h-4 w-4',
                            isActive ? 'text-white'                : '',
                            isFuture ? 'text-[var(--text-muted)]' : '',
                          ].join(' ')}
                          aria-hidden="true"
                        />
                      )}
                    </m.span>
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className="relative mt-1 h-12 w-0.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                      <m.span
                        variants={lineGrow}
                        initial="empty"
                        animate={i < activeIdx ? 'filled' : 'empty'}
                        style={{ originY: 0 }}
                        className="absolute inset-0 rounded-full bg-[#1daabc]"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>

                {/* Right: text */}
                <div className={['pt-1', isLast ? '' : 'pb-10'].join(' ')}>
                  <p className={[
                    'text-sm font-600 leading-none',
                    isFuture ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]',
                  ].join(' ')}>
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{step.sub}</p>
                  {isActive && updatedAt && (
                    <time
                      dateTime={updatedAt.toISOString()}
                      className="mt-0.5 block font-mono text-[10px] text-[var(--text-muted)]"
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
