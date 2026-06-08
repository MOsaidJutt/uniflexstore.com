'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'motion/react'
import { X, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Props {
  open: boolean
  onClose: () => void
  brandName: string
  certificateAssetUrl: string
  verificationUrl: string | null
  /** Ref to the element that triggered the lightbox — focus returns here on close */
  triggerRef?: React.RefObject<HTMLElement | null>
}

const isPdf = (url: string) => url.toLowerCase().includes('.pdf')

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function CertificateLightbox({
  open,
  onClose,
  brandName,
  certificateAssetUrl,
  verificationUrl,
  triggerRef,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Move focus into the dialog when it opens; return it to the trigger when it
  // closes. Returning focus lives in the cleanup (not an `else` branch) so it
  // only fires on the open→closed transition — never on mount, which would
  // otherwise steal focus onto the trigger button (and scroll it into view).
  useEffect(() => {
    if (!open) return
    // Defer one frame so the panel has rendered
    const id = requestAnimationFrame(() => closeButtonRef.current?.focus())
    return () => {
      cancelAnimationFrame(id)
      triggerRef?.current?.focus()
    }
  }, [open, triggerRef])

  // Trap focus inside the panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (typeof window === 'undefined') return null

  const footerId = `cert-desc-${brandName.toLowerCase().replace(/\s+/g, '-')}`

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[--z-modal] overflow-y-auto p-4 sm:p-8"
          style={{ background: 'rgba(10, 21, 32, 0.78)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
          aria-hidden="true"
        >
          {/* Inner flex wrapper so the panel stays centered when shorter than viewport */}
          <div className="flex min-h-full items-center justify-center">
          <m.div
            ref={panelRef}
            key="lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${brandName} authorization certificate`}
            aria-describedby={footerId}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[var(--bg-base)] shadow-[var(--shadow-2xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
              <div>
                <p className="text-[11px] font-600 uppercase tracking-wider text-[var(--text-muted)]">
                  Authorization Certificate
                </p>
                <h2 className="mt-0.5 font-serif text-lg font-600 text-[var(--text-primary)]">
                  {brandName}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {verificationUrl && (
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3.5 py-2.5 text-xs font-600 text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                  >
                    Verify on {brandName}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label={`Close ${brandName} certificate`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Certificate content — only loaded when lightbox is open */}
            <div className="relative min-h-[420px] bg-[var(--bg-subtle)]">
              {isPdf(certificateAssetUrl) ? (
                <iframe
                  src={certificateAssetUrl}
                  title={`${brandName} authorization certificate document`}
                  className="h-[60vh] w-full border-0"
                />
              ) : (
                <div className="relative flex min-h-[420px] items-center justify-center p-4">
                  <Image
                    src={certificateAssetUrl}
                    alt={`${brandName} authorized reseller certificate`}
                    width={1200}
                    height={900}
                    className="max-h-[60vh] w-full rounded-lg object-contain shadow-[var(--shadow-md)]"
                    sizes="(max-width: 768px) 100vw, 768px"
                    quality={85}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border-subtle)] px-6 py-3" id={footerId}>
              <p className="text-xs text-[var(--text-muted)]">
                This certificate is issued to UniFlex Global and verifies our authorization to sell
                genuine {brandName} products.
              </p>
            </div>
          </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
