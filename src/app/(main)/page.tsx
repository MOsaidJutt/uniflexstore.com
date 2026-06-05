import { unstable_cache } from 'next/cache'
import { db } from '@/server/db'
import { Truck, RotateCcw, Lock, Star } from 'lucide-react'
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

      {/* Trust strip — 2-col grid on mobile, single flex row with dividers on lg+ */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <ul
          role="list"
          className="mx-auto grid max-w-[1440px] grid-cols-2 px-4 sm:px-6 lg:flex lg:items-center lg:justify-center lg:divide-x lg:divide-[var(--border-subtle)] lg:px-8"
        >
          {[
            { icon: Truck,     text: 'Free shipping on orders $49+' },
            { icon: RotateCcw, text: '30-day free returns' },
            { icon: Lock,      text: 'Secure checkout' },
            { icon: Star,      text: '4.9 average rating' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-500 text-[var(--text-secondary)]">
              <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <CategoryGrid />
    </div>
  )
}
