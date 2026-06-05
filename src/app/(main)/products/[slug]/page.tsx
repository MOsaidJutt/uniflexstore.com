import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react'
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from '@/server/actions/catalog'
import { BrandAuthBadge } from '@/components/catalog/brand-auth-badge'
import { ProductGallery } from '@/components/catalog/product-gallery'
import { ReviewSection } from '@/components/catalog/review-section'
import { ProductGrid } from '@/components/catalog/product-grid'
import { StarRating } from '@/components/catalog/star-rating'
import { Reveal } from '@/components/shared/reveal'
import { JsonLd } from '@/components/shared/json-ld'
import { siteConfig } from '@/config/site'
import { PDPActions } from './_components/pdp-actions'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const primaryCategory = product.categories[0]?.category
  const canonicalUrl = `${siteConfig.url}/products/${slug}`
  const ogImage = product.images[0]?.url

  return {
    title: `${product.name} — UniFlex Global`,
    description: product.description
      ? product.description.slice(0, 160)
      : `Buy ${product.name} from UniFlex Global — authorized US retailer with free shipping and 30-day returns.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: product.name,
      description: product.description?.slice(0, 200) ?? undefined,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }]
        : undefined,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 200) ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:category': primaryCategory?.name ?? '',
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const primaryCategory = product.categories[0]?.category
  const parentSlug = primaryCategory?.parent?.slug ?? primaryCategory?.slug ?? ''

  const related = await getRelatedProducts(product.id, parentSlug, 4)

  // ── Structured data ──────────────────────────────────────────────────────
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: primaryCategory?.parent?.name
      ? { '@type': 'Brand', name: primaryCategory.parent.name }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: String(product.price),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.avgRating.toFixed(1)),
            reviewCount: String(product.reviewCount),
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      ...(primaryCategory?.parent
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: primaryCategory.parent.name,
              item: `${siteConfig.url}/categories/${primaryCategory.parent.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: primaryCategory.name,
              item: `${siteConfig.url}/categories/${primaryCategory.slug}`,
            },
            { '@type': 'ListItem', position: 4, name: product.name },
          ]
        : primaryCategory
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: primaryCategory.name,
                item: `${siteConfig.url}/categories/${primaryCategory.slug}`,
              },
              { '@type': 'ListItem', position: 3, name: product.name },
            ]
          : [{ '@type': 'ListItem', position: 2, name: product.name }]),
    ],
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <li>
            <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          {primaryCategory?.parent && (
            <>
              <li>
                <Link
                  href={`/categories/${primaryCategory.parent.slug}`}
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {primaryCategory.parent.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </>
          )}
          {primaryCategory && (
            <>
              <li>
                <Link
                  href={`/categories/${primaryCategory.slug}`}
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {primaryCategory.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </>
          )}
          <li aria-current="page" className="text-[var(--text-primary)]">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main layout */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery — client component */}
        <ProductGallery images={product.images} productName={product.name} slug={product.slug} />

        {/* Info pane */}
        <div className="flex flex-col gap-6">
          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs font-500 text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Name */}
          <div>
            <h1
              className="font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-[2.5rem]"
              style={{ viewTransitionName: `product-title-${product.slug}`, textWrap: 'balance' } as React.CSSProperties}
            >
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-[var(--text-muted)]">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.avgRating} size="sm" showValue />
              <Link
                href="#reviews"
                className="text-sm text-[var(--text-muted)] underline-offset-2 hover:underline"
              >
                {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
              </Link>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="leading-relaxed text-[var(--text-secondary)]">{product.description}</p>
          )}

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <dl className="grid grid-cols-2 gap-2">
              {Object.entries(product.attributes)
                .slice(0, 6)
                .map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-[var(--bg-subtle)] px-3 py-2">
                    <dt className="text-[11px] font-600 text-[var(--text-muted)]">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="mt-0.5 text-sm font-500 text-[var(--text-primary)]">
                      {String(val)}
                    </dd>
                  </div>
                ))}
            </dl>
          )}

          {/* Client interactive section: variants + price + cart */}
          <PDPActions
            productId={product.id}
            slug={product.slug}
            name={product.name}
            image={product.images[0]?.url ?? ''}
            basePrice={product.price}
            compareAt={product.compareAt}
            stock={product.stock}
            variants={product.variants}
          />

          {/* Brand authorization badge — streams independently, doesn't block PDP render */}
          <Suspense fallback={null}>
            <BrandAuthBadge productName={product.name} />
          </Suspense>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--border-subtle)] pt-6">
            {[
              { icon: Truck, label: 'Free shipping', sub: 'Orders $49+' },
              { icon: Shield, label: 'Secure checkout', sub: 'SSL encrypted' },
              { icon: RotateCcw, label: 'Free returns', sub: '30-day policy' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
                <div>
                  <span className="block text-xs font-600 text-[var(--text-primary)]">{label}</span>
                  <span className="block text-[11px] text-[var(--text-muted)]">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <Reveal as="div" id="reviews" className="mt-16">
        <ReviewSection
          reviews={product.reviews}
          avgRating={product.avgRating}
          reviewCount={product.reviewCount}
        />
      </Reveal>

      {/* Related products */}
      {related.length > 0 && (
        <Reveal as="section" className="mt-16 border-t border-[var(--border-subtle)] pt-12">
          <h2 className="mb-8 font-serif text-2xl font-600 leading-tight text-[var(--text-primary)]">
            You might also like
          </h2>
          <ProductGrid products={related} columns={4} />
        </Reveal>
      )}
    </div>
  )
}
