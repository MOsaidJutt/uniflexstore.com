'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { m } from 'motion/react'
import { ShieldCheck, ExternalLink, Award } from 'lucide-react'
import type { BrandAuthRecord } from '@/server/queries/brand-authorizations'
import { CertificateLightbox } from './certificate-lightbox'

interface Props {
  auth: BrandAuthRecord
}

export function BrandAuthCard({ auth }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <m.article
        whileHover={{
          y: -4,
          boxShadow: '0 16px 40px -8px rgba(29, 170, 188, 0.18), 0 4px 12px -4px rgba(10, 21, 32, 0.12)',
        }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6"
      >
        {/* Auth type badge */}
        <div className="mb-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-accent)]/10 px-3 py-1 text-[11px] font-700 uppercase tracking-wider text-[var(--brand-accent)]">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            {auth.authorizationType}
          </span>
          <Award
            className="h-5 w-5 text-[var(--text-muted)] opacity-40 transition-opacity duration-200 group-hover:opacity-70"
            aria-hidden="true"
          />
        </div>

        {/* Logo */}
        <div className="mb-5 flex h-16 items-center justify-center rounded-xl bg-white px-4 ring-1 ring-[var(--border-subtle)] dark:bg-white/95">
          <div className="relative h-full w-full">
            <Image
              src={auth.brandLogoUrl}
              alt={`${auth.brandName} logo`}
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
        </div>

        {/* Brand name */}
        <h3 className="mb-1.5 font-serif text-xl font-700 text-[var(--text-primary)]">
          {auth.brandName}
        </h3>

        {/* Display blurb */}
        {auth.displayBlurb && (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            {auth.displayBlurb}
          </p>
        )}

        {/* Actions — min 44px touch target via py-3 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            ref={triggerRef}
            onClick={() => setLightboxOpen(true)}
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
            <span className="text-xs text-[var(--text-muted)]">Certificate on file</span>
          )}
        </div>
      </m.article>

      <CertificateLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        brandName={auth.brandName}
        certificateAssetUrl={auth.certificateAssetUrl}
        verificationUrl={auth.verificationUrl}
        triggerRef={triggerRef}
      />
    </>
  )
}
