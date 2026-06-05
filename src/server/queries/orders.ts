import { db } from '@/server/db'

// Plain server-side read functions — NOT server actions.
// Do NOT add 'use server' here; these must not be callable from client code.

const ORDER_PAGE_SIZE = 20

export async function getOrders(userId: string, page = 1) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  const where = {
    OR: [
      { userId },
      ...(user?.email ? [{ guestEmail: user.email }] : []),
    ],
  }

  const [orders, total] = await db.$transaction([
    db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
            variant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: ORDER_PAGE_SIZE,
      skip: (page - 1) * ORDER_PAGE_SIZE,
    }),
    db.order.count({ where }),
  ])

  return { orders, total, page, pageSize: ORDER_PAGE_SIZE }
}

export async function getOrderById(orderId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  return db.order.findFirst({
    where: {
      id: orderId,
      OR: [
        { userId },
        ...(user?.email ? [{ guestEmail: user.email }] : []),
      ],
    },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
      returnRequest: true,
    },
  })
}
