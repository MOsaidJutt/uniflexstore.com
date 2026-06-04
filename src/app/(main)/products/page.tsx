import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts } from '@/server/actions/catalog'
import { ProductGrid } from '@/components/catalog/product-grid'
import { ProductGridSkeleton } from '@/components/catalog/product-skeleton'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { SortSelect } from '@/components/catalog/sort-select'
import { Pagination } from '@/components/shared/pagination'
import type { SortOption } from '@/types/catalog'

export const metadata: Metadata = {
  title: 'All Products — UniFlex Global',
  description: 'Browse our full catalog of electronics, fashion, beauty, and toys.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseSearchParams(sp: Record<string, string | string[] | undefined>) {
  const q = sp.q as string | undefined
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

  return { q, sort, page, minPrice, maxPrice, inStock, variants }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const { q, sort, page, minPrice, maxPrice, inStock, variants } = parseSearchParams(sp)

  const { products, total, pageCount, filterOptions } = await getProducts({
    q,
    sort,
    page,
    minPrice,
    maxPrice,
    inStock,
    variants: Object.keys(variants).length > 0 ? variants : undefined,
  })

  // Clamp display query to prevent extreme-length headings
  const displayQ = q ? q.slice(0, 100) : null
  const heading = displayQ ? `Results for "${displayQ}"` : 'All Products'

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl"
          style={{ viewTransitionName: 'page-heading' }}
        >
          {heading}
        </h1>
        {displayQ && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {total} result{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <FilterSidebar filterOptions={filterOptions} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <SortSelect current={sort} total={total} className="mb-6" />

          <Suspense fallback={<ProductGridSkeleton />} key={JSON.stringify(sp)}>
            <ProductGrid products={products} />
          </Suspense>

          <Pagination page={page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  )
}
