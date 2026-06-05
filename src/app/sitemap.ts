import type { MetadataRoute } from 'next'
import { db } from '@/server/db'
import { siteConfig, categories } from '@/config/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '')

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                             changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/products`,               changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/authorized-reseller`,    changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/search`,                 changeFrequency: 'daily',   priority: 0.6 },
    { url: `${base}/shipping`,               changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`,                changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`,                  changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/cookies`,                changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/accessibility`,          changeFrequency: 'monthly', priority: 0.3 },
  ]

  // ── Category pages ────────────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${base}/categories/${cat.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    ...cat.subcategories.map((sub) => ({
      url: `${base}/categories/${sub.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ])

  // ── Dynamic product pages ─────────────────────────────────────────────────
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
