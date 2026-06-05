'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createBanner, updateBanner, deleteBanner } from '@/server/actions/admin/banners'
import { CloudinaryUpload } from '@/components/admin/cloudinary-upload'

type Banner = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  linkLabel: string | null
  isActive: boolean
  sortOrder: number
  startsAt: Date | null
  endsAt: Date | null
}

interface FormValues {
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  linkLabel: string
  isActive: boolean
  sortOrder: number | string
  startsAt: string
  endsAt: string
}

export function BannersManager({ banners }: { banners: Banner[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Banner | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { title: '', subtitle: '', imageUrl: '', linkUrl: '', linkLabel: '', isActive: true, sortOrder: 0, startsAt: '', endsAt: '' },
  })
  const isActive = watch('isActive')
  const imageUrl = watch('imageUrl')

  function openNew() { reset({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkLabel: '', isActive: true, sortOrder: banners.length, startsAt: '', endsAt: '' }); setEditTarget(null); setShowForm(true) }
  function openEdit(b: Banner) {
    reset({
      title: b.title, subtitle: b.subtitle ?? '', imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? '', linkLabel: b.linkLabel ?? '',
      isActive: b.isActive, sortOrder: b.sortOrder,
      startsAt: b.startsAt ? b.startsAt.toISOString().slice(0, 16) : '',
      endsAt: b.endsAt ? b.endsAt.toISOString().slice(0, 16) : '',
    })
    setEditTarget(b); setShowForm(true)
  }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const payload = { ...data, sortOrder: Number(data.sortOrder) }
      const result = editTarget ? await updateBanner(editTarget.id, payload) : await createBanner(payload)
      if (result.error) toast.error(result.error)
      else { toast.success(editTarget ? 'Banner updated' : 'Banner created'); setShowForm(false) }
    })
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Banners</h1>
          <p className="text-sm text-[var(--text-muted)]">{banners.length} banners</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Add Banner</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-[var(--border-default)] py-16 text-center text-sm text-[var(--text-muted)]">
            No banners yet. Add one to show on your homepage.
          </div>
        ) : (
          banners.map((b) => {
            const scheduled = b.startsAt && b.startsAt > now
            const expired = b.endsAt && b.endsAt < now
            return (
              <div key={b.id} className="group rounded-xl border border-[var(--border-default)] overflow-hidden bg-[var(--bg-base)]">
                <div className="relative aspect-video bg-[var(--bg-subtle)]">
                  <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-l from-black/40">
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-white/90" onClick={() => openEdit(b)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(b)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">{b.title}</p>
                      {b.subtitle && <p className="text-xs text-[var(--text-muted)]">{b.subtitle}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!b.isActive && <Badge variant="secondary">Inactive</Badge>}
                      {scheduled && <Badge variant="info">Scheduled</Badge>}
                      {expired && <Badge variant="destructive">Expired</Badge>}
                      {b.isActive && !scheduled && !expired && <Badge variant="success">Live</Badge>}
                    </div>
                  </div>
                  {(b.startsAt || b.endsAt) && (
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                      {b.startsAt && `From ${b.startsAt.toLocaleDateString()}`}
                      {b.startsAt && b.endsAt && ' · '}
                      {b.endsAt && `Until ${b.endsAt.toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Image *</Label>
              <CloudinaryUpload onUpload={(url) => setValue('imageUrl', url)} folder="uniflex/banners" currentUrl={imageUrl || undefined} label="Upload banner image (1920×800 recommended)" />
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input {...register('title', { required: true })} placeholder="Summer Sale" />
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input {...register('subtitle')} placeholder="Up to 50% off" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Link URL</Label>
                <Input {...register('linkUrl')} placeholder="/products" />
              </div>
              <div className="space-y-1.5">
                <Label>Button Label</Label>
                <Input {...register('linkLabel')} placeholder="Shop Now" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="datetime-local" {...register('startsAt')} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="datetime-local" {...register('endsAt')} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register('sortOrder')} className="w-24" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
                <Label>Active</Label>
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
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This banner will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return
              startTransition(async () => {
                await deleteBanner(deleteTarget.id)
                toast.success('Banner deleted')
                setDeleteTarget(null)
              })
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
