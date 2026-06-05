'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { m, AnimatePresence } from 'motion/react'

export interface BannerData {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  linkLabel: string | null
}

interface Props {
  banners: BannerData[]
}

export function BannerStrip({ banners }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setCurrent((c) => (c + dir + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => go(1), 5000)
    return () => clearInterval(id)
  }, [banners.length, go])

  if (banners.length === 0) return null

  const banner = banners[current]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section
      aria-label="Promotional banners"
      className="relative overflow-hidden bg-[var(--brand-primary)]"
      style={{ height: 'clamp(200px, 30vw, 400px)' }}
    >
      <AnimatePresence custom={direction} mode="popLayout">
        <m.div
          key={banner.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority={current === 0}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          {/* Copy */}
          <div className="relative flex h-full items-center px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg">
              <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl lg:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mt-2 text-sm text-white/80 sm:text-base">{banner.subtitle}</p>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="mt-4 inline-flex items-center rounded-xl bg-[var(--brand-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-accent-hover)] active:scale-[0.97]"
                >
                  {banner.linkLabel ?? 'Shop Now'}
                </Link>
              )}
            </div>
          </div>
        </m.div>
      </AnimatePresence>

      {/* Navigation — only shown when multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {/* Dot indicators */}
          <div role="tablist" aria-label="Banner slides" className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to banner ${i + 1}: ${b.title}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
