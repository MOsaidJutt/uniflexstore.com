import type { Metadata } from 'next'
import { getProducts } from '@/server/actions/catalog'
import { ProductGrid } from '@/components/catalog/product-grid'
import { SortSelect } from '@/components/catalog/sort-select'
import { Pagination } from '@/components/shared/pagination'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import type { SortOption } from '@/types/catalog'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = sp.q as string | undefined
  return {
    title: q
      ? `"${q.slice(0, 60)}" — Search — UniFlex Global`
      : 'Search — UniFlex Global',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const rawQ = sp.q as string | undefined
  const q = rawQ?.slice(0, 100) // clamp
  const sort = (sp.sort as SortOption) || 'newest'
  const page = Number(sp.page) || 1

  const { products, total, pageCount, filterOptions } = await getProducts({
    q: q || undefined,
    sort,
    page,
  })

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        {q ? (
          <>
            <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
              &ldquo;{q}&rdquo;
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {total} result{total !== 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
              Search
            </h1>
            <p className="mt-2 text-[var(--text-muted)]">
              Type a query in the search bar above to find products.
            </p>
          </>
        )}
      </div>

      {q && (
        <div className="flex gap-8">
          <FilterSidebar filterOptions={filterOptions} />
          <div className="min-w-0 flex-1">
            <SortSelect current={sort} total={total} className="mb-6" />
            <ProductGrid products={products} />
            <Pagination page={page} pageCount={pageCount} />
          </div>
        </div>
      )}
    </div>
  )
}
