import 'server-only'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'
import type { OrderStatus, Prisma } from '@prisma/client'

export type AdminOrdersFilter = {
  status?: OrderStatus
  search?: string
  page?: number
  pageSize?: number
}

export async function getAdminOrders(filter: AdminOrdersFilter = {}) {
  const { status, search, page = 1, pageSize = 20 } = filter

  const where: Prisma.OrderWhereInput = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { guestEmail: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
        returnRequest: { select: { status: true } },
      },
    }),
    db.order.count({ where }),
  ])

  return {
    orders: orders.map((o) => ({
      ...o,
      total: decimalToNumber(o.total),
      subtotal: decimalToNumber(o.subtotal),
      shippingCost: decimalToNumber(o.shippingCost),
      tax: decimalToNumber(o.tax),
      discount: decimalToNumber(o.discount),
    })),
    total,
    pages: Math.ceil(total / pageSize),
  }
}

export async function getAdminOrderById(id: string) {
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
          variant: true,
        },
      },
      address: true,
      returnRequest: true,
    },
  })
  if (!order) return null
  return {
    ...order,
    total: decimalToNumber(order.total),
    subtotal: decimalToNumber(order.subtotal),
    shippingCost: decimalToNumber(order.shippingCost),
    tax: decimalToNumber(order.tax),
    discount: decimalToNumber(order.discount),
    items: order.items.map((i) => ({ ...i, price: decimalToNumber(i.price) })),
  }
}
