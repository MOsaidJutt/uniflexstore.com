'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { createCategory, updateCategory, deleteCategory } from '@/server/actions/admin/categories'
import { CloudinaryUpload } from '@/components/admin/cloudinary-upload'
import { slugify } from '@/lib/utils'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  _count: { products: number; children: number }
}

interface FormValues {
  name: string
  slug: string
  description: string
  parentId: string
  sortOrder: number | string
  isActive: boolean
  image: string
}

interface CategoriesManagerProps {
  categories: Category[]
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [pending, startTransition] = useTransition()

  const roots = categories.filter((c) => !c.parentId)
  const children = (parentId: string) => categories.filter((c) => c.parentId === parentId)

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, image: '' },
  })
  const isActive = watch('isActive')
  const imageUrl = watch('image')

  function openNew() { reset({ name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, image: '' }); setEditTarget(null); setShowForm(true) }
  function openEdit(cat: Category) { reset({ name: cat.name, slug: cat.slug, description: cat.description ?? '', parentId: cat.parentId ?? '', sortOrder: cat.sortOrder, isActive: cat.isActive, image: cat.image ?? '' }); setEditTarget(cat); setShowForm(true) }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const payload = { ...data, sortOrder: Number(data.sortOrder), parentId: data.parentId || undefined }
      const result = editTarget ? await updateCategory(editTarget.id, payload) : await createCategory(payload)
      if (result.error) toast.error(result.error)
      else { toast.success(editTarget ? 'Category updated' : 'Category created'); setShowForm(false) }
    })
  }

  function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
    const subs = children(cat.id)
    return (
      <div>
        <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors`} style={{ paddingLeft: depth * 20 + 12 }}>
          <div className="flex items-center gap-3">
            {subs.length > 0 ? <FolderOpen className="h-4 w-4 text-[var(--text-muted)] shrink-0" /> : <Folder className="h-4 w-4 text-[var(--text-muted)] shrink-0" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-[var(--text-primary)]">{cat.name}</span>
                {!cat.isActive && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Draft</Badge>}
              </div>
              <p className="text-xs text-[var(--text-muted)]">/categories/{cat.slug} · {cat._count.products} products</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--error)]" onClick={() => setDeleteTarget(cat)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {subs.map((c) => <CategoryRow key={c.id} cat={c} depth={depth + 1} />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Categories</h1>
          <p className="text-sm text-[var(--text-muted)]">{categories.length} categories</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden bg-[var(--bg-base)]">
        {roots.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">No categories yet.</p>
        ) : (
          roots.map((cat) => <CategoryRow key={cat.id} cat={cat} />)
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" {...register('name', { required: true, onChange: (e) => { if (!editTarget) setValue('slug', slugify(e.target.value)) } })} placeholder="Electronics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" {...register('slug')} placeholder="electronics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-parent">Parent Category</Label>
              <select
                id="cat-parent"
                {...register('parentId')}
                className="flex h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                <option value="">— Top level —</option>
                {categories.filter((c) => c.id !== editTarget?.id && !c.parentId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" {...register('description')} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input id="cat-sort" type="number" {...register('sortOrder')} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="cat-active" checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
                <Label htmlFor="cat-active">Active</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category Image</Label>
              <CloudinaryUpload
                onUpload={(url) => setValue('image', url)}
                folder="uniflex/categories"
                currentUrl={imageUrl || undefined}
                label="Upload category image"
              />
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
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?._count.products ? `This category has ${deleteTarget._count.products} products.` : ''} Sub-categories must be removed first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return
              startTransition(async () => {
                const result = await deleteCategory(deleteTarget.id)
                if (result.error) toast.error(result.error)
                else toast.success('Category deleted')
                setDeleteTarget(null)
              })
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
