import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { getCategoryBySlug, getProducts } from '@/server/actions/catalog'
import { ProductGrid } from '@/components/catalog/product-grid'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { SortSelect } from '@/components/catalog/sort-select'
import { Pagination } from '@/components/shared/pagination'
import { Reveal } from '@/components/shared/reveal'
import type { SortOption } from '@/types/catalog'

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) return {}
  return {
    title: `${cat.name} — UniFlex Store`,
    description: cat.description ?? `Shop ${cat.name} at UniFlex Store.`,
  }
}

interface PageProps {
  params: Promise<Params>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const sort = (sp.sort as SortOption) || 'newest'
  const page = Number(sp.page) || 1
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const inStock = sp.inStock === 'true'

  const variants: Record<string, string[]> = {}
  for (const [key, val] of Object.entries(sp)) {
    if (key.startsWith('v_') && val) {
      variants[key.slice(2)] = Array.isArray(val) ? val : [val]
    }
  }

  const { products, total, pageCount, filterOptions } = await getProducts({
    categorySlug: slug,
    sort,
    page,
    minPrice,
    maxPrice,
    inStock,
    variants: Object.keys(variants).length > 0 ? variants : undefined,
  })

  const isSubcategory = category.parent != null

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <li>
            <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          {category.parent && (
            <>
              <li>
                <Link
                  href={`/categories/${category.parent.slug}`}
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {category.parent.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            </>
          )}
          <li aria-current="page" className="text-[var(--text-primary)]">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category header */}
      <Reveal className="mb-8">
        <h1
          className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl"
          style={{ viewTransitionName: `category-heading-${slug}` }}
        >
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-[var(--text-muted)]">{category.description}</p>
        )}

        {/* Sub-category chips (only for top-level categories) */}
        {!isSubcategory && category.children.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.slug}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-[var(--border-default)] px-4 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <div className="flex gap-8">
        <FilterSidebar filterOptions={filterOptions} />

        <div className="min-w-0 flex-1">
          <SortSelect current={sort} total={total} className="mb-6" />

          <ProductGrid products={products} />

          <Pagination page={page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  )
}
