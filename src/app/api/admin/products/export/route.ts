import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await db.product.findMany({
    include: { categories: { include: { category: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['id', 'name', 'slug', 'sku', 'price', 'compareAt', 'stock', 'isActive', 'isFeatured', 'categories', 'description']
  const rows = products.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    p.slug,
    p.sku,
    decimalToNumber(p.price),
    p.compareAt ? decimalToNumber(p.compareAt) : '',
    p.stock,
    p.isActive,
    p.isFeatured,
    p.categories.map((c) => c.category.name).join('|'),
    `"${(p.description ?? '').replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
