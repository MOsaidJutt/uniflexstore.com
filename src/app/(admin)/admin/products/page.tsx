import Link from 'next/link'
import { Plus, Download, Upload } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAdminProducts } from '@/server/queries/admin/products'
import { formatUSD } from '@/lib/utils'
import { ProductsTable } from './_components/products-table'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; lowStock?: string; isActive?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const { products, total, pages } = await getAdminProducts({
    search: params.search,
    page,
    lowStock: params.lowStock === 'true',
    isActive: params.isActive === 'false' ? false : params.isActive === 'true' ? true : undefined,
  })

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Products" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />

      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Products</h1>
            <p className="text-sm text-[var(--text-muted)]">{total} total products</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/admin/products/export">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </a>
            <Link href="/admin/products/import">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>
            <Link href="/admin/products/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        <ProductsTable
          products={products}
          total={total}
          page={page}
          pages={pages}
          search={params.search ?? ''}
        />
      </main>
    </div>
  )
}
