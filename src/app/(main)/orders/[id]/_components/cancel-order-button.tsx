'use client'

import { useState, useTransition } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cancelOrder } from '@/server/actions/orders'

interface Props {
  orderId: string
}

export function CancelOrderButton({ orderId }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      try {
        await cancelOrder(orderId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setShowConfirm(false)
      }
    })
  }

  return (
    <div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-500 text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Cancel order
        </button>
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.97, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-600 text-red-800 dark:text-red-300">
                  Cancel this order?
                </p>
                <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
                  This cannot be undone. You will receive a confirmation email.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-600 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                {isPending ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-600 text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:bg-transparent dark:text-red-400"
              >
                Keep order
              </button>
            </div>
          </m.div>
        </AnimatePresence>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}
    </div>
  )
}
