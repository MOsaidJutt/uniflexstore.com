import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { CategoriesManager } from './_components/categories-manager'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true, children: true } } },
  })

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Categories" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="flex-1 overflow-auto p-6">
        <CategoriesManager categories={categories} />
      </main>
    </div>
  )
}
