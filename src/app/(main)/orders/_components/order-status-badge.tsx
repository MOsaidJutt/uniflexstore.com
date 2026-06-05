import { cn } from '@/lib/utils'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:    { label: 'Pending',    className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  SHIPPED:    { label: 'Shipped',    className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' },
  DELIVERED:  { label: 'Delivered',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  CANCELLED:  { label: 'Cancelled',  className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
  REFUNDED:   { label: 'Refunded',   className: 'bg-[var(--bg-muted)] text-[var(--text-muted)]' },
}

interface Props {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: Props) {
  const { label, className: colorClass } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}
