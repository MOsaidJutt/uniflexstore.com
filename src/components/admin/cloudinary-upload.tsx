'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CloudinaryUploadProps {
  onUpload: (url: string) => void
  folder?: string
  accept?: string
  label?: string
  currentUrl?: string
  className?: string
}

export function CloudinaryUpload({ onUpload, folder = 'uniflex', accept = 'image/*', label = 'Upload image', currentUrl, className }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPDF = accept.includes('pdf') || (preview?.endsWith('.pdf'))

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    if (!accept.includes('pdf') && !file.type.startsWith('image/')) {
      setError('Please select an image file')
      setUploading(false)
      return
    }

    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Upload failed')
      setPreview(data.url)
      onUpload(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {preview ? (
        <div className="relative group">
          {isPDF ? (
            <div className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-sm text-[var(--text-secondary)]">
              <FileText className="h-5 w-5" />
              Certificate uploaded
            </div>
          ) : (
            <img src={preview} alt="Preview" className="h-24 w-full rounded-lg border border-[var(--border-default)] object-cover" />
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); onUpload('') }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-6 text-sm text-[var(--text-muted)] transition-all hover:border-[var(--brand-accent)] hover:bg-[var(--brand-teal-light)] hover:text-[var(--brand-accent)]',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          {uploading ? (
            <div className="h-5 w-5 motion-safe:animate-spin rounded-full border-2 border-[var(--brand-accent)] border-t-transparent" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          <span>{uploading ? 'Uploading…' : label}</span>
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
}

// Multi-image upload for product images
interface MultiImageUploadProps {
  images: { url: string; alt?: string; sortOrder: number }[]
  onChange: (images: { url: string; alt?: string; sortOrder: number }[]) => void
}

export function MultiImageUpload({ images, onChange }: MultiImageUploadProps) {
  function handleAdd(url: string) {
    if (!url) return
    onChange([...images, { url, sortOrder: images.length }])
  }
  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })))
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
      {images.map((img, i) => (
        <div key={i} className="group relative aspect-square">
          <img src={img.url} alt={img.alt ?? `Image ${i + 1}`} className="h-full w-full rounded-lg border border-[var(--border-default)] object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--error)] text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
          {i === 0 && (
            <span className="absolute bottom-1 left-1 rounded px-1 py-0.5 bg-black/60 text-white text-[10px]">Main</span>
          )}
        </div>
      ))}
      <CloudinaryUpload
        onUpload={handleAdd}
        folder="uniflex/products"
        label="Add image"
        className="aspect-square"
      />
    </div>
  )
}
