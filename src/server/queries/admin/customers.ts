import 'server-only'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'

export async function getAdminCustomers(filter: { search?: string; page?: number; pageSize?: number } = {}) {
  const { search, page = 1, pageSize = 20 } = filter

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }], role: 'CUSTOMER' as const }
    : { role: 'CUSTOMER' as const }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true, status: true }, where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } },
      },
    }),
    db.user.count({ where }),
  ])

  return {
    customers: users.map((u) => ({
      ...u,
      orderCount: u._count.orders,
      totalSpent: u.orders.reduce((sum, o) => sum + decimalToNumber(o.total), 0),
    })),
    total,
    pages: Math.ceil(total / pageSize),
  }
}

export async function getAdminCustomerById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true } } } } },
      },
      addresses: true,
    },
  })
  if (!user) return null
  return {
    ...user,
    orders: user.orders.map((o) => ({
      ...o,
      total: decimalToNumber(o.total),
      subtotal: decimalToNumber(o.subtotal),
      shippingCost: decimalToNumber(o.shippingCost),
      tax: decimalToNumber(o.tax),
      discount: decimalToNumber(o.discount),
      items: o.items.map((i) => ({ ...i, price: decimalToNumber(i.price) })),
    })),
  }
}
