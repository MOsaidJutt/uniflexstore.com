import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'text-[var(--brand-accent)]' }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
            {change !== undefined && (
              <div className="mt-1.5 flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                  {isPositive ? '+' : ''}
                  {typeof change === 'number' ? change.toFixed(1) : change}%
                </span>
                {changeLabel && <span className="text-xs text-[var(--text-muted)]">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-subtle)]', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
