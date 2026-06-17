'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import { cookieBannerSlide } from '@/lib/motion'

const CONSENT_KEY = '__cookie_consent'
const INSTANT: Transition = { duration: 0 }

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion() ?? false
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const decision = localStorage.getItem(CONSENT_KEY)
    if (!decision) setVisible(true)
  }, [])

  // Exposes the banner's real height as a CSS var so other fixed elements
  // (e.g. the chat widget FAB) can lift themselves above it instead of being covered.
  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty('--cookie-banner-h', '0px')
      return
    }
    const el = bannerRef.current
    if (!el) return
    const setHeight = () =>
      document.documentElement.style.setProperty('--cookie-banner-h', `${el.offsetHeight}px`)
    setHeight()
    const ro = new ResizeObserver(setHeight)
    ro.observe(el)
    window.addEventListener('resize', setHeight)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setHeight)
      document.documentElement.style.setProperty('--cookie-banner-h', '0px')
    }
  }, [visible])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    document.cookie = `${CONSENT_KEY}=accepted; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    document.cookie = `${CONSENT_KEY}=declined; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    setVisible(false)
  }

  // Dismiss records no preference — banner will reappear on next session.
  function dismiss() {
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          ref={bannerRef}
          key="cookie-banner"
          variants={cookieBannerSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={reducedMotion ? INSTANT : undefined}
          role="region"
          aria-label="Cookie preferences"
          className="fixed bottom-0 left-0 right-0 z-[var(--z-banner)] border-t border-[var(--border-default)] bg-[var(--bg-base)] shadow-[var(--shadow-xl)]"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <p className="flex-1 text-sm text-[var(--text-secondary)]">
              We use <strong className="text-[var(--text-primary)]">strictly necessary</strong> cookies
              to keep you signed in and your cart working, plus functional cookies for our AI
              assistant. We do not use advertising or tracking cookies.{' '}
              <Link
                href="/cookies"
                className="text-[var(--brand-link)] underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
              {' · '}
              <Link
                href="/privacy"
                className="text-[var(--brand-link)] underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={decline}
                className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                Decline optional
              </button>
              <button
                onClick={accept}
                className="rounded-xl bg-[var(--brand-accent)] px-4 py-2 text-sm font-600 text-white transition-colors hover:bg-[var(--brand-accent-hover)]"
              >
                Accept all
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss cookie banner"
                className="ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
