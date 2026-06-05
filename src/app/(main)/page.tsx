import { unstable_cache } from 'next/cache'
import { db } from '@/server/db'
import { HeroSection } from './_components/hero-section'
import { BannerStrip } from './_components/banner-strip'
import { CategoryGrid } from './_components/category-grid'
import { AuthorizedSection } from './_components/authorized-section'
import { getActiveAuthorizations } from '@/server/queries/brand-authorizations'

const getOrbitImages = unstable_cache(
  async () => {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    })
    return products
      .flatMap((p) => p.images.map((img) => ({ src: img.url, alt: img.alt ?? '' })))
      .filter((img) => img.src.length > 0)
  },
  ['homepage-orbit'],
  { tags: ['homepage-orbit'], revalidate: 3600 },
)

const getActiveBanners = unstable_cache(
  async () => {
    const now = new Date()
    return db.banner.findMany({
      where: {
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
      },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true, linkLabel: true },
    })
  },
  ['homepage-banners'],
  { tags: ['homepage-banners'], revalidate: 600 },
)

export default async function HomePage() {
  const [orbitImages, authorizations, banners] = await Promise.all([
    getOrbitImages(),
    getActiveAuthorizations(),
    getActiveBanners(),
  ])

  return (
    <div className="flex-1">
      <HeroSection orbitImages={orbitImages} />
      {banners.length > 0 && <BannerStrip banners={banners} />}

      {/* Authorized reseller section — immediately below hero */}
      <AuthorizedSection authorizations={authorizations} />

      {/* Trust strip */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <ul
          role="list"
          className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 sm:px-6 lg:px-8"
        >
          {[
            '🚚  Free shipping on orders $49+',
            '↩  30-day free returns',
            '🔒  Secure checkout',
            '⭐  4.9 average rating',
          ].map((item) => (
            <li key={item} className="text-xs font-500 text-[var(--text-muted)]">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <CategoryGrid />
    </div>
  )
}
