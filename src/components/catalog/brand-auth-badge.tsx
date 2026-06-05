import Link from 'next/link'
import { ShieldCheck, ExternalLink } from 'lucide-react'
import { getAuthorizationForProduct } from '@/server/queries/brand-authorizations'

interface Props {
  productName: string
}

export async function BrandAuthBadge({ productName }: Props) {
  const auth = await getAuthorizationForProduct(productName)
  if (!auth) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--brand-accent)]/25 bg-[var(--brand-accent)]/6 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/15">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-700 text-[var(--text-primary)]">
          Authorized {auth.authorizationType === 'Authorized Reseller' ? 'Reseller' : 'Seller'} of {auth.brandName}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
          {auth.verificationUrl
            ? `Verified ${auth.authorizationType.toLowerCase()} — genuine, brand-new, with full manufacturer warranty.`
            : `${auth.authorizationType} — certificate on file. Genuine, brand-new, with full manufacturer warranty.`}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/authorized-reseller"
            className="inline-flex items-center gap-1 text-[11px] font-600 text-[var(--brand-accent)] underline-offset-2 hover:underline"
          >
            View certificate
          </Link>
          {auth.verificationUrl && (
            <>
              <span className="text-[var(--text-muted)]" aria-hidden="true">·</span>
              <a
                href={auth.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-600 text-[var(--brand-accent)] underline-offset-2 hover:underline"
              >
                Verify on {auth.brandName}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
