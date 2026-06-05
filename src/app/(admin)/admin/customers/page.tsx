import { AdminTopbar } from '@/components/admin/topbar'
import { getAdminCustomers } from '@/server/queries/admin/customers'
import { CustomersTable } from './_components/customers-table'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const { customers, total, pages } = await getAdminCustomers({ search: params.search, page })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Customers" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />

      <main className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Customers</h1>
          <p className="text-sm text-[var(--text-muted)]">{total} registered customers</p>
        </div>
        <CustomersTable customers={customers} total={total} page={page} pages={pages} search={params.search ?? ''} />
      </main>
    </div>
  )
}

