'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatUSD } from '@/lib/utils'
import type { OrderStatus } from '@prisma/client'

type OrderRow = {
  id: string
  status: OrderStatus
  total: number
  createdAt: Date
  user: { name: string | null; email: string } | null
  guestEmail: string | null
  items: { quantity: number }[]
}

const STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
}

interface OrdersTableProps {
  orders: OrderRow[]
  total: number
  page: number
  pages: number
  search: string
  currentStatus?: OrderStatus
}

export function OrdersTable({ orders, total, page, pages, search, currentStatus }: OrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`/admin/orders?${params.toString()}`)
  }, [searchParams, router])

  const columns: Column<OrderRow>[] = [
    {
      key: 'id',
      label: 'Order',
      render: (row) => (
        <div>
          <p className="font-mono text-sm font-medium text-[var(--text-primary)]">#{row.id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-[var(--text-muted)]">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">{row.user?.name ?? 'Guest'}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.user?.email ?? row.guestEmail}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.items.reduce((s, i) => s + i.quantity, 0)}</span>,
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => <span className="font-semibold text-sm">{formatUSD(row.total)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      total={total}
      page={page}
      pageSize={20}
      onPageChange={(p) => setParam('page', String(p))}
      searchPlaceholder="Search by order ID or email…"
      onSearch={(q) => setParam('search', q)}
      searchValue={search}
      emptyMessage="No orders found."
    />
  )
}
