'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useCallback } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Package, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, type Column } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deleteProduct, toggleProductActive } from '@/server/actions/admin/products'
import { formatUSD } from '@/lib/utils'

type ProductRow = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  isActive: boolean
  images: { url: string; alt?: string | null }[]
  categories: { category: { name: string } }[]
}

interface ProductsTableProps {
  products: ProductRow[]
  total: number
  page: number
  pages: number
  search: string
}

export function ProductsTable({ products, total, page, pages, search }: ProductsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`/admin/products?${params.toString()}`)
  }, [searchParams, router])

  const columns: Column<ProductRow>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images[0] ? (
            <img src={row.images[0].url} alt={row.name} className="h-10 w-10 rounded-lg border border-[var(--border-default)] object-cover shrink-0" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-subtle)] shrink-0">
              <Package className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
          )}
          <div>
            <p className="font-medium text-[var(--text-primary)] text-sm">{row.name}</p>
            <p className="text-xs text-[var(--text-muted)]">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categories',
      label: 'Category',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.categories.map((c) => c.category.name).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="font-medium text-sm">{formatUSD(row.price)}</span>,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => (
        <Badge variant={row.stock === 0 ? 'destructive' : row.stock <= 5 ? 'warning' : 'success'}>
          {row.stock === 0 ? 'Out of stock' : `${row.stock} units`}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Active' : 'Draft'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.id}`} className="flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                startTransition(async () => {
                  await toggleProductActive(row.id, !row.isActive)
                  toast.success(row.isActive ? 'Product set to draft' : 'Product activated')
                })
              }}
              className="flex items-center gap-2"
            >
              {row.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {row.isActive ? 'Set Draft' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteTarget(row.id)}
              className="flex items-center gap-2 text-[var(--error)] focus:text-[var(--error)]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setParam('page', String(p))}
        searchPlaceholder="Search by name or SKU…"
        onSearch={(q) => setParam('search', q)}
        searchValue={search}
        emptyMessage="No products found."
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product and all its images and variants. Orders containing this product will retain their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return
                startTransition(async () => {
                  const result = await deleteProduct(deleteTarget)
                  if (result.error) toast.error(result.error)
                  else toast.success('Product deleted')
                  setDeleteTarget(null)
                })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
