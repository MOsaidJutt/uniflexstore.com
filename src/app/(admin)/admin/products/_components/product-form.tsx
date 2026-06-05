'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiImageUpload } from '@/components/admin/cloudinary-upload'
import { createProduct, updateProduct } from '@/server/actions/admin/products'
import { slugify } from '@/lib/utils'

interface Category { id: string; name: string }

interface ProductFormValues {
  name: string
  slug: string
  description: string
  price: number | string
  compareAt: number | string
  sku: string
  stock: number | string
  isActive: boolean
  isFeatured: boolean
  categoryIds: string[]
  images: { url: string; alt?: string; sortOrder: number }[]
  variants: { id?: string; name: string; value: string; price?: number | string; stock: number | string; sku?: string }[]
}

interface ProductFormProps {
  categories: Category[]
  initial?: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    compareAt: number | null
    sku: string
    stock: number
    isActive: boolean
    isFeatured: boolean
    categoryIds: string[]
    images: { url: string; alt?: string | null; sortOrder: number }[]
    variants: { id: string; name: string; value: string; price: number | null; stock: number; sku: string | null }[]
  }
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isEdit = !!initial

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<ProductFormValues>({
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? '',
      compareAt: initial?.compareAt ?? '',
      sku: initial?.sku ?? '',
      stock: initial?.stock ?? 0,
      isActive: initial?.isActive ?? true,
      isFeatured: initial?.isFeatured ?? false,
      categoryIds: initial?.categoryIds ?? [],
      images: initial?.images.map((i) => ({ url: i.url, alt: i.alt ?? '', sortOrder: i.sortOrder })) ?? [],
      variants: initial?.variants.map((v) => ({ id: v.id, name: v.name, value: v.value, price: v.price ?? '', stock: v.stock, sku: v.sku ?? '' })) ?? [],
    },
  })

  const { fields: variantFields, append, remove } = useFieldArray({ control, name: 'variants' })

  const images = watch('images')
  const categoryIds = watch('categoryIds')
  const isActive = watch('isActive')
  const isFeatured = watch('isFeatured')

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const payload = {
        ...data,
        price: Number(data.price),
        compareAt: data.compareAt ? Number(data.compareAt) : undefined,
        stock: Number(data.stock),
        variants: data.variants.map((v) => ({ ...v, price: v.price ? Number(v.price) : undefined, stock: Number(v.stock) })),
      }

      const result = isEdit
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? 'Product updated' : 'Product created')
        router.push('/admin/products')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  {...register('name', { required: 'Name is required', onChange: (e) => { if (!isEdit) setValue('slug', slugify(e.target.value)) } })}
                  placeholder="Product name"
                />
                {errors.name && <p role="alert" className="text-xs text-[var(--error)]">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register('slug')} placeholder="product-slug" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Product description…" rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" step="0.01" min="0" aria-invalid={!!errors.price} {...register('price', { required: 'Price is required' })} placeholder="0.00" />
                {errors.price && <p role="alert" className="text-xs text-[var(--error)]">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compareAt">Compare At</Label>
                <Input id="compareAt" type="number" step="0.01" min="0" {...register('compareAt')} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" aria-invalid={!!errors.sku} {...register('sku', { required: 'SKU is required' })} placeholder="SKU-001" />
                {errors.sku && <p role="alert" className="text-xs text-[var(--error)]">{errors.sku.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-w-[200px]">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" min="0" {...register('stock')} />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <MultiImageUpload
                images={images}
                onChange={(imgs) => setValue('images', imgs)}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variants</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', value: '', price: '', stock: 0, sku: '' })}>
                <Plus className="h-3.5 w-3.5" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {variantFields.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No variants. Product uses base stock quantity above.</p>
              )}
              {variantFields.map((field, i) => (
                <div key={field.id} className="grid gap-2 rounded-lg border border-[var(--border-default)] p-3 sm:grid-cols-5">
                  <Input placeholder="Type (e.g. Color)" {...register(`variants.${i}.name`)} />
                  <Input placeholder="Value (e.g. Red)" {...register(`variants.${i}.value`)} />
                  <Input placeholder="Price override" type="number" step="0.01" {...register(`variants.${i}.price`)} />
                  <Input placeholder="Stock" type="number" min="0" {...register(`variants.${i}.stock`)} />
                  <div className="flex items-center gap-2">
                    <Input placeholder="SKU" {...register(`variants.${i}.sku`)} />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-[var(--error)]" onClick={() => remove(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch id="isActive" checked={isActive} onCheckedChange={(v) => setValue('isActive', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={(v) => setValue('isFeatured', v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={categoryIds.includes(cat.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setValue('categoryIds', [...categoryIds, cat.id])
                      else setValue('categoryIds', categoryIds.filter((id) => id !== cat.id))
                    }}
                  />
                  <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">{cat.name}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={pending}>
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
