import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, PackageCheck, FileCheck } from 'lucide-react'
import { getActiveAuthorizations } from '@/server/queries/brand-authorizations'
import { Reveal } from '@/components/shared/reveal'
import { BrandAuthGrid } from './_components/brand-auth-grid'

export const metadata: Metadata = {
  title: 'Authorized Reseller — UniFlex Global',
  description:
    "UniFlex Global is an authorized reseller for every brand we carry — each product arrives brand-new and 100% genuine, backed by the manufacturer's warranty.",
}

export default async function AuthorizedResellerPage() {
  const authorizations = await getActiveAuthorizations()
  const hasVerification = authorizations.some((a) => a.verificationUrl)

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">

      {/* Back link */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--brand-accent)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to home
      </Link>

      {/* Page header */}
      <div className="mb-6 max-w-2xl">
        <h1
          className="font-serif text-4xl font-700 leading-tight text-[var(--text-primary)] sm:text-5xl"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          Authorized.{' '}
          <em className="not-italic text-[var(--brand-accent)]">Genuine.</em>{' '}
          Warrantied.
        </h1>
      </div>

      <div className="mb-14 max-w-2xl">
        <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
          We&apos;re an authorized reseller for every brand we carry — each product arrives
          brand-new and 100% genuine, backed by the manufacturer&apos;s warranty. No gray-market
          stock, no counterfeits.{' '}
          {hasVerification
            ? 'For brands that offer it, you can verify our authorization on their official site.'
            : 'Certificates on file are available for your review below.'}
        </p>
      </div>

      {/* Guarantee strip — horizontal with icons */}
      <Reveal
        as="div"
        className="mb-14 grid grid-cols-1 gap-4 border-y border-[var(--border-subtle)] py-8 sm:grid-cols-3"
        threshold={0.2}
      >
        {[
          {
            icon: PackageCheck,
            label: 'Brand-new only',
            detail: 'Zero refurbished or gray-market stock.',
          },
          {
            icon: ShieldCheck,
            label: "Manufacturer's warranty",
            detail: 'Full factory coverage on every item.',
          },
          {
            icon: FileCheck,
            label: 'Certificates on file',
            detail: 'Current authorization documents, available on request.',
          },
        ].map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-accent)]/10">
              <Icon className="h-[18px] w-[18px] text-[var(--brand-accent)]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-700 text-[var(--text-primary)]">{label}</p>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">{detail}</p>
            </div>
          </div>
        ))}
      </Reveal>

      {/* Authorization grid */}
      {authorizations.length > 0 ? (
        <BrandAuthGrid authorizations={authorizations} />
      ) : (
        <Reveal as="div" className="rounded-2xl border border-dashed border-[var(--border-default)] py-20 text-center">
          <p className="text-[var(--text-muted)]">No active authorizations found.</p>
        </Reveal>
      )}
    </div>
  )
}
