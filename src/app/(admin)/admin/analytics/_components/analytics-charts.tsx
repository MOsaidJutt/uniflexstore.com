'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
}

interface AnalyticsChartsProps {
  topProducts: { product: string; sold: number }[]
  topCategories: { category: string; count: number }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
}

export function AnalyticsCharts({ topProducts, topCategories, dailyRevenue }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Daily revenue line */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Daily Revenue (30 days)</CardTitle></CardHeader>
        <CardContent>
          <figure aria-label="Line chart showing daily revenue over 30 days">
            <figcaption className="sr-only">
              Daily revenue data: {dailyRevenue.slice(-7).map(d => `${d.date} $${d.revenue}`).join(', ')} (last 7 shown)
            </figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="var(--brand-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          </figure>
        </CardContent>
      </Card>

      {/* Top categories */}
      <Card>
        <CardHeader><CardTitle>Top Categories</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {topCategories.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-4 text-right text-xs font-semibold text-[var(--text-muted)]">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-[var(--text-primary)]">{c.category}</span>
                  <span className="text-xs text-[var(--text-muted)]">{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-accent)]"
                    style={{ width: `${Math.round((c.count / (topCategories[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top products chart */}
      <Card className="lg:col-span-3">
        <CardHeader><CardTitle>Top Products by Units Sold (30 days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="product" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="sold" fill="var(--brand-accent)" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
