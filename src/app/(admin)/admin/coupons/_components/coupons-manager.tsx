'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createCoupon, updateCoupon, deleteCoupon } from '@/server/actions/admin/coupons'
import { formatUSD } from '@/lib/utils'

type Coupon = {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  minOrderAmt: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  isActive: boolean
  _count: { usages: number }
}

interface FormValues {
  code: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number | string
  minOrderAmt: number | string
  maxUses: number | string
  expiresAt: string
  isActive: boolean
}

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { code: '', discountType: 'PERCENTAGE', value: '', minOrderAmt: '', maxUses: '', expiresAt: '', isActive: true },
  })
  const isActive = watch('isActive')
  const discountType = watch('discountType')

  function openNew() { reset({ code: '', discountType: 'PERCENTAGE', value: '', minOrderAmt: '', maxUses: '', expiresAt: '', isActive: true }); setEditTarget(null); setShowForm(true) }
  function openEdit(c: Coupon) {
    reset({
      code: c.code,
      discountType: c.discountType,
      value: c.value,
      minOrderAmt: c.minOrderAmt ?? '',
      maxUses: c.maxUses ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.toISOString().split('T')[0] : '',
      isActive: c.isActive,
    })
    setEditTarget(c); setShowForm(true)
  }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const payload = { ...data, value: Number(data.value), minOrderAmt: data.minOrderAmt ? Number(data.minOrderAmt) : undefined, maxUses: data.maxUses ? Number(data.maxUses) : undefined }
      const result = editTarget ? await updateCoupon(editTarget.id, payload) : await createCoupon(payload)
      if (result.error) toast.error(result.error)
      else { toast.success(editTarget ? 'Coupon updated' : 'Coupon created'); setShowForm(false) }
    })
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Coupons</h1>
          <p className="text-sm text-[var(--text-muted)]">{coupons.length} coupons</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden bg-[var(--bg-base)]">
        {coupons.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">No coupons yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < now
              const exhausted = c.maxUses && c.usedCount >= c.maxUses
              const val = c.value
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-teal-light)]">
                      <Tag className="h-4 w-4 text-[var(--brand-accent)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-[var(--text-primary)]">{c.code}</span>
                        {!c.isActive && <Badge variant="secondary">Inactive</Badge>}
                        {expired && <Badge variant="destructive">Expired</Badge>}
                        {exhausted && <Badge variant="warning">Exhausted</Badge>}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {c.discountType === 'PERCENTAGE' ? `${val}% off` : `${formatUSD(val)} off`}
                        {c.minOrderAmt ? ` · min order ${formatUSD(c.minOrderAmt)}` : ''}
                        {c.maxUses ? ` · ${c.usedCount}/${c.maxUses} uses` : ` · ${c.usedCount} uses`}
                        {c.expiresAt ? ` · expires ${c.expiresAt.toLocaleDateString('en-US', { dateStyle: 'medium' })}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--error)]" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">Code *</Label>
              <Input id="coupon-code" {...register('code', { required: true })} placeholder="SUMMER20" className="uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-type">Type *</Label>
                <select id="coupon-type" {...register('discountType')} className="flex h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-value">Value * {discountType === 'PERCENTAGE' ? '(%)' : '($)'}</Label>
                <Input id="coupon-value" type="number" step="0.01" {...register('value', { required: true })} placeholder={discountType === 'PERCENTAGE' ? '20' : '10.00'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-min">Min Order ($)</Label>
                <Input id="coupon-min" type="number" step="0.01" {...register('minOrderAmt')} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-max-uses">Max Uses</Label>
                <Input id="coupon-max-uses" type="number" {...register('maxUses')} placeholder="Unlimited" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-expires">Expires At</Label>
              <Input id="coupon-expires" type="date" {...register('expiresAt')} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="coupon-active" checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
              <Label htmlFor="coupon-active">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={pending}>{editTarget ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon "{deleteTarget?.code}"?</AlertDialogTitle>
            <AlertDialogDescription>All usage records will also be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return
              startTransition(async () => {
                await deleteCoupon(deleteTarget.id)
                toast.success('Coupon deleted')
                setDeleteTarget(null)
              })
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
