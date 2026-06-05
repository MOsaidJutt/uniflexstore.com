'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RevenueChartProps {
  data: { month: string; revenue: number; orders: number }[]
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <figure aria-label="Area chart showing revenue by month">
          <figcaption className="sr-only">
            Monthly revenue: {data.map(d => `${d.month} $${d.revenue.toLocaleString()}`).join(', ')}
          </figcaption>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => Number(v) >= 1000 ? `$${(Number(v) / 1000).toFixed(0)}k` : `$${Number(v)}`}
              width={48}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--brand-accent)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--brand-accent)', stroke: 'var(--bg-base)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        </figure>
      </CardContent>
    </Card>
  )
}

interface OrdersChartProps {
  data: { month: string; orders: number }[]
}

export function OrdersBarChart({ data }: OrdersChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Per Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="orders" fill="var(--brand-accent)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PieDataItem {
  name: string
  value: number
}

interface StatusPieProps {
  data: PieDataItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  REFUNDED: '#6b7280',
}

export function StatusBreakdown({ data }: StatusPieProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] ?? '#6b7280' }} />
              <span className="flex-1 text-sm text-[var(--text-secondary)]">{item.name}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{item.value}</span>
              <span className="w-10 text-right text-xs text-[var(--text-muted)]">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
