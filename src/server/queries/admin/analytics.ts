import 'server-only'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'

export async function getAnalyticsData(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [ordersByStatus, topCategories, topProducts, revenueDaily, newVsReturning] = await Promise.all([
    db.order.groupBy({
      by: ['status'],
      _count: true,
      where: { createdAt: { gte: since } },
    }),
    db.productCategory.groupBy({
      by: ['categoryId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
    db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
      where: { order: { createdAt: { gte: since } } },
    }),
    // Daily revenue for last N days
    db.order.findMany({
      where: { createdAt: { gte: since }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      select: { createdAt: true, total: true },
    }),
    // Conversion proxy: orders vs unique visitors proxy (orders with vs without userId)
    Promise.all([
      db.order.count({ where: { createdAt: { gte: since }, userId: { not: null } } }),
      db.order.count({ where: { createdAt: { gte: since }, userId: null } }),
    ]),
  ])

  // Aggregate daily revenue
  const dailyMap = new Map<string, { revenue: number; orders: number }>()
  for (const order of revenueDaily) {
    const day = order.createdAt.toISOString().split('T')[0]
    const existing = dailyMap.get(day) ?? { revenue: 0, orders: 0 }
    existing.revenue += decimalToNumber(order.total)
    existing.orders += 1
    dailyMap.set(day, existing)
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  const catIds = topCategories.map((c) => c.categoryId)
  const categories = await db.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } })

  const productIds = topProducts.map((p) => p.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })

  return {
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
    topCategories: topCategories.map((c) => ({
      category: categories.find((cat) => cat.id === c.categoryId)?.name ?? 'Unknown',
      count: c._count.productId,
    })),
    topProducts: topProducts.map((p) => ({
      product: products.find((prod) => prod.id === p.productId)?.name ?? 'Unknown',
      sold: p._sum.quantity ?? 0,
    })),
    dailyRevenue,
    registeredOrders: newVsReturning[0],
    guestOrders: newVsReturning[1],
  }
}
