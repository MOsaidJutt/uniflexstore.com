'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, GripVertical, AlertTriangle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createBrandAuth, updateBrandAuth, deleteBrandAuth, reorderBrandAuths } from '@/server/actions/admin/brand-authorizations'
import { CloudinaryUpload } from '@/components/admin/cloudinary-upload'

type Brand = {
  id: string
  brandName: string
  brandLogoUrl: string
  authorizationType: string
  certificateAssetUrl: string
  verificationUrl: string | null
  verificationNote: string | null
  validFrom: Date | null
  validUntil: Date | null
  displayBlurb: string | null
  sortOrder: number
  isPublished: boolean
}

interface FormValues {
  brandName: string
  brandLogoUrl: string
  authorizationType: string
  certificateAssetUrl: string
  verificationUrl: string
  verificationNote: string
  validFrom: string
  validUntil: string
  displayBlurb: string
  sortOrder: number | string
  isPublished: boolean
}

export function BrandAuthsManager({ brands: initialBrands, alerts }: { brands: Brand[]; alerts: string[] }) {
  const [brands, setBrands] = useState(initialBrands)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [pending, startTransition] = useTransition()
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { brandName: '', brandLogoUrl: '', authorizationType: '', certificateAssetUrl: '', verificationUrl: '', verificationNote: '', validFrom: '', validUntil: '', displayBlurb: '', sortOrder: 0, isPublished: true },
  })
  const isPublished = watch('isPublished')
  const logoUrl = watch('brandLogoUrl')
  const certUrl = watch('certificateAssetUrl')

  function openNew() {
    reset({ brandName: '', brandLogoUrl: '', authorizationType: 'Authorized Reseller', certificateAssetUrl: '', verificationUrl: '', verificationNote: '', validFrom: '', validUntil: '', displayBlurb: '', sortOrder: brands.length, isPublished: true })
    setEditTarget(null); setShowForm(true)
  }

  function openEdit(b: Brand) {
    reset({
      brandName: b.brandName, brandLogoUrl: b.brandLogoUrl, authorizationType: b.authorizationType, certificateAssetUrl: b.certificateAssetUrl, verificationUrl: b.verificationUrl ?? '', verificationNote: b.verificationNote ?? '', validFrom: b.validFrom ? b.validFrom.toISOString().split('T')[0] : '', validUntil: b.validUntil ? b.validUntil.toISOString().split('T')[0] : '', displayBlurb: b.displayBlurb ?? '', sortOrder: b.sortOrder, isPublished: b.isPublished,
    })
    setEditTarget(b); setShowForm(true)
  }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const payload = { ...data, sortOrder: Number(data.sortOrder) }
      const result = editTarget ? await updateBrandAuth(editTarget.id, payload) : await createBrandAuth(payload)
      if (result.error) toast.error(result.error)
      else { toast.success(editTarget ? 'Updated' : 'Created'); setShowForm(false) }
    })
  }

  // Drag reorder (simplified keyboard-free DnD)
  function handleDragStart(i: number) { setDragIdx(i) }
  function handleDrop(i: number) {
    if (dragIdx === null || dragIdx === i) return
    const newOrder = [...brands]
    const [moved] = newOrder.splice(dragIdx, 1)
    newOrder.splice(i, 0, moved)
    setBrands(newOrder)
    setDragIdx(null)
    startTransition(async () => {
      await reorderBrandAuths(newOrder.map((b) => b.id))
      toast.success('Order saved')
    })
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Brand Authorizations</h1>
          <p className="text-sm text-[var(--text-muted)]">{brands.length} brands · drag to reorder</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>

      <div className="space-y-2">
        {brands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-default)] py-16 text-center text-sm text-[var(--text-muted)]">No brands yet.</div>
        ) : (
          brands.map((b, i) => {
            const expired = b.validUntil && b.validUntil < now
            const expiring = alerts.includes(b.id)
            return (
              <div
                key={b.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={`flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-3 cursor-grab active:cursor-grabbing transition-opacity ${dragIdx === i ? 'opacity-50' : ''}`}
              >
                <GripVertical className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <img src={b.brandLogoUrl} alt={b.brandName} className="h-10 w-10 rounded-lg border border-[var(--border-default)] object-contain bg-white p-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{b.brandName}</span>
                    <Badge variant="outline" className="text-[10px]">{b.authorizationType}</Badge>
                    {!b.isPublished && <Badge variant="secondary">Draft</Badge>}
                    {expired && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>}
                    {!expired && expiring && <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />Expiring</Badge>}
                  </div>
                  {b.validUntil && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Valid until {b.validUntil.toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {b.verificationUrl && (
                    <a href={b.verificationUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--error)]" onClick={() => setDeleteTarget(b)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Brand Authorization' : 'New Brand Authorization'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Brand Logo *</Label>
                <CloudinaryUpload onUpload={(url) => setValue('brandLogoUrl', url)} folder="uniflex/logos" currentUrl={logoUrl || undefined} label="Upload logo" />
              </div>
              <div className="space-y-1.5">
                <Label>Certificate *</Label>
                <CloudinaryUpload onUpload={(url) => setValue('certificateAssetUrl', url)} folder="uniflex/certificates" accept="image/*,.pdf" currentUrl={certUrl || undefined} label="Upload certificate" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Brand Name *</Label>
              <Input {...register('brandName', { required: true })} placeholder="Apple Inc." />
            </div>
            <div className="space-y-1.5">
              <Label>Authorization Type *</Label>
              <Input {...register('authorizationType', { required: true })} placeholder="Authorized Reseller" />
            </div>
            <div className="space-y-1.5">
              <Label>Verification URL</Label>
              <Input {...register('verificationUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Verification Note</Label>
              <Textarea {...register('verificationNote')} rows={2} placeholder="Internal note about this authorization" />
            </div>
            <div className="space-y-1.5">
              <Label>Display Blurb</Label>
              <Textarea {...register('displayBlurb')} rows={2} placeholder="Short text shown on the authorized-reseller page" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valid From</Label>
                <Input type="date" {...register('validFrom')} />
              </div>
              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input type="date" {...register('validUntil')} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register('sortOrder')} className="w-24" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={isPublished} onCheckedChange={(v) => setValue('isPublished', v)} />
                <Label>Published</Label>
              </div>
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
            <AlertDialogTitle>Delete "{deleteTarget?.brandName}"?</AlertDialogTitle>
            <AlertDialogDescription>This brand authorization record will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return
              startTransition(async () => {
                await deleteBrandAuth(deleteTarget.id)
                setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id))
                toast.success('Deleted')
                setDeleteTarget(null)
              })
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
