'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string
  label: string
  className?: string
  render?: (row: T) => React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  keyField?: string
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  searchValue?: string
  toolbar?: React.ReactNode
  emptyMessage?: string
  loading?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T = any>({
  columns,
  data,
  keyField = 'id',
  total = data.length,
  page = 1,
  pageSize = 20,
  onPageChange,
  searchPlaceholder,
  onSearch,
  searchValue = '',
  toolbar,
  emptyMessage = 'No results found.',
  loading = false,
}: DataTableProps<T>) {
  const pages = Math.ceil(total / pageSize)
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debouncedSearch = useDebounce(localSearch, 300)
  const prevDebounced = useRef(debouncedSearch)

  useEffect(() => {
    if (debouncedSearch !== prevDebounced.current) {
      prevDebounced.current = debouncedSearch
      onSearch?.(debouncedSearch)
    }
  }, [debouncedSearch, onSearch])

  // Sync external searchValue into local state when it changes externally
  useEffect(() => { setLocalSearch(searchValue) }, [searchValue])

  return (
    <div className="space-y-3">
      {(onSearch || toolbar) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onSearch && (
            <Input
              placeholder={searchPlaceholder ?? 'Search…'}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-9 max-w-xs"
            />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={String(col.key)} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <div className="h-4 motion-safe:animate-pulse rounded bg-[var(--bg-muted)]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-[var(--text-muted)]">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.map((row: any, rowIdx) => (
                <TableRow key={String(row[keyField] ?? rowIdx)}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn('py-3', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && onPageChange && (
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>
            {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <nav aria-label="Table pagination" className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={page === 1} className="h-8 w-8" aria-label="First page">
              <ChevronsLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="h-8 w-8" aria-label="Previous page">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <span className="px-2 font-medium text-[var(--text-primary)]" aria-live="polite">{page} / {pages}</span>
            <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page === pages} className="h-8 w-8" aria-label="Next page">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange(pages)} disabled={page === pages} className="h-8 w-8" aria-label="Last page">
              <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}
