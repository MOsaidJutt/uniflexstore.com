'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'motion/react'
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'
import { revealStagger, revealStaggerItem, revealUp } from '@/lib/motion'
import type { BrandAuthRecord } from '@/server/queries/brand-authorizations'
import { CertificateLightbox } from '../authorized-reseller/_components/certificate-lightbox'

interface Props {
  authorizations: BrandAuthRecord[]
}

// Inline card for homepage — shares CertificateLightbox, triggerRef for focus return
function HomeAuthCard({ auth }: { auth: BrandAuthRecord }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <m.article
        variants={revealStaggerItem}
        whileHover={{
          y: -6,
          boxShadow: '0 20px 48px -8px rgba(29, 170, 188, 0.2), 0 4px 16px -4px rgba(10, 21, 32, 0.1)',
        }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="group flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8"
      >
        {/* Auth type label */}
        <span className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--brand-accent)]/10 px-3 py-1 text-[11px] font-700 uppercase tracking-wider text-[var(--brand-accent)]">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          {auth.authorizationType}
        </span>

        {/* Logo */}
        <div className="mb-6 flex h-20 items-center justify-center rounded-xl bg-white px-6 ring-1 ring-[var(--border-subtle)] dark:bg-white/95">
          <div className="relative h-14 w-full">
            <Image
              src={auth.brandLogoUrl}
              alt={`${auth.brandName} logo`}
              fill
              className="object-contain"
              sizes="200px"
            />
          </div>
        </div>

        {/* Brand name */}
        <h3 className="mb-2 font-serif text-2xl font-700 text-[var(--text-primary)]">
          {auth.brandName}
        </h3>

        {auth.displayBlurb && (
          <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            {auth.displayBlurb}
          </p>
        )}

        {/* Actions — 44px touch targets */}
        <div className="flex flex-wrap gap-2">
          <button
            ref={triggerRef}
            onClick={() => setOpen(true)}
            aria-label={`View ${auth.brandName} certificate`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-4 py-3 text-xs font-600 text-white transition-all duration-150 hover:bg-[var(--brand-secondary)] active:scale-[0.97]"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            View certificate
          </button>
          {auth.verificationUrl ? (
            <a
              href={auth.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Verify ${auth.brandName} authorization on their official site`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-4 py-3 text-xs font-600 text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] active:scale-[0.97]"
            >
              Verify on {auth.brandName}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            <span className="self-center text-xs text-[var(--text-muted)]">
              Certificate on file
            </span>
          )}
        </div>
      </m.article>

      <CertificateLightbox
        open={open}
        onClose={() => setOpen(false)}
        brandName={auth.brandName}
        certificateAssetUrl={auth.certificateAssetUrl}
        verificationUrl={auth.verificationUrl}
        triggerRef={triggerRef}
      />
    </>
  )
}

export function AuthorizedSection({ authorizations }: Props) {
  if (authorizations.length === 0) return null

  const hasVerification = authorizations.some((a) => a.verificationUrl)

  return (
    <section
      aria-labelledby="authorized-heading"
      className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] py-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* Header — scroll-reveal appropriate here (below the hero fold) */}
        <m.div
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: '-64px' }}
          className="mb-14 text-center"
        >
          <h2
            id="authorized-heading"
            className="font-serif text-4xl font-700 leading-tight text-[var(--text-primary)] sm:text-5xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Authorized.{' '}
            <em className="not-italic text-[var(--brand-accent)]">Genuine.</em>{' '}
            Warrantied.
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-lg leading-relaxed text-[var(--text-secondary)]">
            We&apos;re an authorized reseller for every brand we carry — each product arrives
            brand-new and 100% genuine, backed by the manufacturer&apos;s warranty. No gray-market
            stock, no counterfeits.{' '}
            {hasVerification
              ? 'For brands that offer it, you can verify our authorization on their official site.'
              : 'Certificates on file are available for your review.'}
          </p>
        </m.div>

        {/* Brand grid */}
        <m.div
          variants={revealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: '-64px' }}
          className={[
            'mx-auto grid gap-6',
            authorizations.length === 1
              ? 'max-w-sm'
              : authorizations.length === 2
                ? 'max-w-2xl sm:grid-cols-2'
                : 'max-w-5xl sm:grid-cols-2 lg:grid-cols-3',
          ].join(' ')}
        >
          {authorizations.map((auth) => (
            <HomeAuthCard key={auth.id} auth={auth} />
          ))}
        </m.div>

        {/* CTA */}
        <m.div
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3, margin: '-32px' }}
          className="mt-12 text-center"
        >
          <Link
            href="/authorized-reseller"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-[var(--border-default)] px-6 py-3.5 text-sm font-600 text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
          >
            View our authorizations
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </m.div>
      </div>
    </section>
  )
}
