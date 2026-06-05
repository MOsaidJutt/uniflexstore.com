'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Ban, UserCheck, ExternalLink } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { setCustomerBanned } from '@/server/actions/admin/customers'
import { formatUSD } from '@/lib/utils'

type CustomerRow = {
  id: string
  name: string | null
  email: string
  isBanned: boolean
  createdAt: Date
  orderCount: number
  totalSpent: number
}

interface CustomersTableProps {
  customers: CustomerRow[]
  total: number
  page: number
  pages: number
  search: string
}

export function CustomersTable({ customers, total, page, pages, search }: CustomersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`/admin/customers?${params.toString()}`)
  }, [searchParams, router])

  const columns: Column<CustomerRow>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-[var(--text-primary)]">{row.name ?? 'No name'}</p>
            {row.isBanned && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Banned</Badge>}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{new Date(row.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>,
    },
    {
      key: 'orderCount',
      label: 'Orders',
      render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.orderCount}</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (row) => <span className="font-medium text-sm">{formatUSD(row.totalSpent)}</span>,
    },
    {
      key: 'actions',
      label: '',
      className: 'w-20',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/customers/${row.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`View ${row.name ?? row.email}`}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={row.isBanned ? `Unban ${row.name ?? row.email}` : `Ban ${row.name ?? row.email}`}
            className={`h-7 w-7 ${row.isBanned ? 'text-emerald-600' : 'text-[var(--error)]'}`}
            onClick={() => {
              startTransition(async () => {
                await setCustomerBanned(row.id, !row.isBanned)
                toast.success(row.isBanned ? 'Customer unbanned' : 'Customer banned')
              })
            }}
          >
            {row.isBanned ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={customers}
      total={total}
      page={page}
      pageSize={20}
      onPageChange={(p) => setParam('page', String(p))}
      searchPlaceholder="Search by name or email…"
      onSearch={(q) => setParam('search', q)}
      searchValue={search}
      emptyMessage="No customers found."
    />
  )
}
