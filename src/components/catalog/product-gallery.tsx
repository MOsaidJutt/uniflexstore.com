'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/catalog'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  slug: string
}

export function ProductGallery({ images, productName, slug }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const current = images[active]

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--bg-subtle)]">
        <span className="text-sm text-[var(--text-muted)]">No images</span>
      </div>
    )
  }

  function prev() {
    setActive((a) => (a === 0 ? images.length - 1 : a - 1))
  }
  function next() {
    setActive((a) => (a === images.length - 1 ? 0 : a + 1))
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="group relative overflow-hidden rounded-2xl bg-[var(--bg-subtle)]"
          style={{ viewTransitionName: `product-image-${slug}` }}
        >
          <div className="relative aspect-square">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={current.url}
                  alt={current.alt ?? productName}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </m.div>
            </AnimatePresence>
          </div>

          {/* Prev / next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-base)]/80 shadow opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-base)]/80 shadow opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            onClick={() => setLightbox(true)}
            aria-label="Zoom image"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-base)]/80 shadow opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          {/* Dot indicators (mobile) */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="hidden grid-cols-4 gap-2 sm:grid">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative overflow-hidden rounded-lg transition-all duration-150',
                  i === active
                    ? 'ring-2 ring-[var(--brand-accent)] ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${productName} thumbnail ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(false)}
              className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm"
              aria-hidden="true"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-4 z-[600] flex items-center justify-center sm:inset-8 lg:inset-16"
            >
              <div className="relative h-full w-full max-w-4xl">
                <Image
                  src={current.url}
                  alt={current.alt ?? productName}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <button
                onClick={() => setLightbox(false)}
                aria-label="Close zoom"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
