import 'server-only'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'

export async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    pendingOrders,
    totalCustomers,
    monthCustomers,
  ] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } }),
    db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth }, status: { notIn: ['CANCELLED', 'REFUNDED'] } } }),
    db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { notIn: ['CANCELLED', 'REFUNDED'] } } }),
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
  ])

  const monthRev = decimalToNumber(monthRevenue._sum.total ?? 0)
  const lastMonthRev = decimalToNumber(lastMonthRevenue._sum.total ?? 0)
  const revenueChange = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0

  return {
    totalRevenue: decimalToNumber(totalRevenue._sum.total ?? 0),
    monthRevenue: monthRev,
    revenueChange,
    totalOrders,
    monthOrders,
    pendingOrders,
    totalCustomers,
    monthCustomers,
  }
}

export async function getRecentOrders(limit = 10) {
  const orders = await db.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })
  return orders.map((o) => ({
    ...o,
    total: decimalToNumber(o.total),
    subtotal: decimalToNumber(o.subtotal),
    shippingCost: decimalToNumber(o.shippingCost),
    tax: decimalToNumber(o.tax),
    discount: decimalToNumber(o.discount),
  }))
}

export async function getLowStockProducts(threshold = 5) {
  return db.product.findMany({
    where: { stock: { lte: threshold }, isActive: true },
    orderBy: { stock: 'asc' },
    take: 10,
    include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
  })
}

export async function getTopProducts(limit = 5) {
  const items = await db.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    _count: { orderId: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  })
  const ids = items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
  })
  return items.map((item) => ({
    product: products.find((p) => p.id === item.productId)!,
    totalSold: item._sum.quantity ?? 0,
    orderCount: item._count.orderId,
  }))
}

export async function getExpiringCerts(daysAhead = 30) {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + daysAhead)
  // Only certs that have an actual validUntil date AND that date is within the alert window
  return db.brandAuthorization.findMany({
    where: {
      validUntil: { not: null, lte: cutoff },
    },
    orderBy: { validUntil: 'asc' },
  })
}

export async function getRevenueByMonth(months = 6) {
  const ranges = Array.from({ length: months }, (_, idx) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (months - 1 - idx))
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end, label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }
  })

  const rows = await Promise.all(
    ranges.map(async ({ start, end, label }) => {
      const [agg, count] = await Promise.all([
        db.order.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: start, lte: end }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        }),
        db.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      ])
      return { month: label, revenue: decimalToNumber(agg._sum.total ?? 0), orders: count }
    })
  )
  return rows
}
