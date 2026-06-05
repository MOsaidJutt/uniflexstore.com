import { AdminTopbar } from '@/components/admin/topbar'
import { ProductForm } from '../_components/product-form'
import { db } from '@/server/db'

export default async function NewProductPage() {
  const categories = await db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar
        title="New Product"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products', href: '/admin/products' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <ProductForm categories={categories} />
      </main>
    </div>
  )
}
