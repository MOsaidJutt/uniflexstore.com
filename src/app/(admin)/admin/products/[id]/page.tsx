import { notFound } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/topbar'
import { ProductForm } from '../_components/product-form'
import { getAdminProductById } from '@/server/queries/admin/products'
import { db } from '@/server/db'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  const initial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    price: product.price,
    compareAt: product.compareAt ?? null,
    sku: product.sku,
    stock: product.stock,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    categoryIds: product.categories.map((c) => c.category.id),
    images: product.images.map((i) => ({ url: i.url, alt: i.alt, sortOrder: i.sortOrder })),
    variants: product.variants.map((v) => ({ id: v.id, name: v.name, value: v.value, price: v.price != null ? Number(v.price) : null, stock: v.stock, sku: v.sku })),
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar
        title={product.name}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products', href: '/admin/products' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <ProductForm categories={categories} initial={initial} />
      </main>
    </div>
  )
}
