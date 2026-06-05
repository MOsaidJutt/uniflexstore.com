import { notFound } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/topbar'
import { getAdminOrderById } from '@/server/queries/admin/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatUSD } from '@/lib/utils'
import { OrderActions } from './_components/order-actions'
import type { OrderStatus } from '@prisma/client'

interface PageProps { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default'> = {
  PENDING: 'warning', PROCESSING: 'info', SHIPPED: 'default', DELIVERED: 'success', CANCELLED: 'destructive', REFUNDED: 'secondary',
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await getAdminOrderById(id)
  if (!order) notFound()

  const addr = order.shippingAddress as { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string } | null

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders', href: '/admin/orders' }]}
      />

      <main className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_VARIANT[order.status]} className="text-sm px-3 py-1">
              {order.status}
            </Badge>
            <span className="text-sm text-[var(--text-muted)]">
              {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </span>
          </div>
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            stripePaymentId={order.stripePaymentId}
            trackingNumber={order.trackingNumber}
            trackingUrl={order.trackingUrl}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Order items */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product.images[0] && (
                    <img src={item.product.images[0].url} alt={item.product.name} className="h-12 w-12 rounded-lg border border-[var(--border-default)] object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-[var(--text-muted)]">{item.variant.name}: {item.variant.value}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatUSD(item.price)}</p>
                    <p className="text-xs text-[var(--text-muted)]">×{item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-[var(--border-default)] pt-3 space-y-1">
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Subtotal</span><span>{formatUSD(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span><span>-{formatUSD(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Shipping</span><span>{order.shippingCost > 0 ? formatUSD(order.shippingCost) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Tax</span><span>{formatUSD(order.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-[var(--border-default)] pt-2">
                  <span>Total</span><span>{formatUSD(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer + shipping */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {order.user ? (
                  <>
                    <p className="font-medium text-[var(--text-primary)]">{order.user.name ?? 'No name'}</p>
                    <p className="text-[var(--text-secondary)]">{order.user.email}</p>
                    {order.user.phone && <p className="text-[var(--text-muted)]">{order.user.phone}</p>}
                  </>
                ) : (
                  <p className="text-[var(--text-secondary)]">{order.guestEmail} (Guest)</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
              <CardContent className="text-sm text-[var(--text-secondary)] space-y-0.5">
                {order.address ? (
                  <>
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  </>
                ) : addr ? (
                  <>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                  </>
                ) : (
                  <p className="text-[var(--text-muted)]">No address on file</p>
                )}
              </CardContent>
            </Card>

            {order.trackingNumber && (
              <Card>
                <CardHeader><CardTitle>Tracking</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p className="font-mono font-medium text-[var(--text-primary)]">{order.trackingNumber}</p>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-accent)] hover:underline text-xs">
                      Track shipment →
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {order.returnRequest && (
              <Card>
                <CardHeader><CardTitle>Return Request</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <Badge variant={order.returnRequest.status === 'PENDING' ? 'warning' : order.returnRequest.status === 'APPROVED' ? 'success' : 'destructive'}>
                    {order.returnRequest.status}
                  </Badge>
                  <p className="text-[var(--text-secondary)]">{order.returnRequest.reason}</p>
                  {order.returnRequest.details && <p className="text-[var(--text-muted)]">{order.returnRequest.details}</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
