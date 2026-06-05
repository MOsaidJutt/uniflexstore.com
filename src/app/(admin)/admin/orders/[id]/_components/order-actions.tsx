'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { updateOrderStatus, issueStripeRefund } from '@/server/actions/admin/orders'
import type { OrderStatus } from '@prisma/client'

const STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

interface OrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
  stripePaymentId: string | null
  trackingNumber: string | null
  trackingUrl: string | null
}

export function OrderActions({ orderId, currentStatus, stripePaymentId, trackingNumber, trackingUrl }: OrderActionsProps) {
  const [pending, startTransition] = useTransition()
  const [showShipDialog, setShowShipDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [tracking, setTracking] = useState({ number: trackingNumber ?? '', url: trackingUrl ?? '' })

  function handleStatusChange(status: OrderStatus) {
    if (status === 'SHIPPED') { setShowShipDialog(true); return }
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.error) toast.error(result.error)
      else toast.success(`Status updated to ${status}`)
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {stripePaymentId && currentStatus !== 'REFUNDED' && currentStatus !== 'CANCELLED' && (
          <Button variant="destructive" size="sm" onClick={() => setShowRefundDialog(true)}>
            Issue Refund
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" loading={pending}>
              Update Status <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUSES.filter((s) => s !== currentStatus).map((s) => (
              <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Ship dialog */}
      <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tracking Number</Label>
              <Input placeholder="1Z999AA10123456784" value={tracking.number} onChange={(e) => setTracking((t) => ({ ...t, number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tracking URL</Label>
              <Input placeholder="https://ups.com/track?..." value={tracking.url} onChange={(e) => setTracking((t) => ({ ...t, url: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipDialog(false)}>Cancel</Button>
            <Button
              loading={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await updateOrderStatus(orderId, 'SHIPPED', tracking.number || undefined, tracking.url || undefined)
                  if (result.error) toast.error(result.error)
                  else { toast.success('Order marked as shipped — email sent'); setShowShipDialog(false) }
                })
              }}
            >
              Confirm Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Issue Stripe Refund?</AlertDialogTitle>
            <AlertDialogDescription>
              This will refund the full payment via Stripe and mark the order as REFUNDED. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  const result = await issueStripeRefund(orderId)
                  if (result.error) toast.error(result.error)
                  else { toast.success('Refund issued — customer notified'); setShowRefundDialog(false) }
                })
              }}
            >
              Issue Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
