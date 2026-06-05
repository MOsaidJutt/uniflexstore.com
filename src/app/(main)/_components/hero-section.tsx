'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import { ArrowRight, Zap, Users, Truck } from 'lucide-react'
import { heroContainer, heroLine } from '@/lib/motion'

export interface HeroImage {
  src: string
  alt: string
}

// Fallback images (verified from seed data — good Unsplash IDs)
const FALLBACK: HeroImage[] = [
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Running sneakers' },
  { src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', alt: 'Laptop' },
  { src: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', alt: 'Skincare serum' },
  { src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', alt: 'Smartphone' },
  { src: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', alt: 'Earbuds' },
  { src: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', alt: 'Field jacket' },
  { src: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400', alt: 'Building bricks' },
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Smartwatch' },
]

// How often one orbit slot swaps to the next product (ms)
const CYCLE_INTERVAL = 3600
// Full orbit revolution duration (seconds)
const ORBIT_DURATION = 20

interface Props {
  orbitImages?: HeroImage[]
}

// ─── Orbit ───────────────────────────────────────────────────────────────────

function ProductOrbit({ pool }: { pool: HeroImage[] }) {
  // Three card slots — each independently cycles through the pool
  const [slots, setSlots] = useState<HeroImage[]>(() => {
    const src = pool.length >= 3 ? pool : FALLBACK
    return [src[0], src[1], src[2]]
  })

  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const src = pool.length >= 3 ? pool : FALLBACK
    let nextIdx = 3

    const id = setInterval(() => {
      const slot = Math.floor(Math.random() * 3)
      const next = src[nextIdx % src.length]
      setSlots((prev) => {
        const updated = [...prev]
        updated[slot] = next
        return updated
      })
      nextIdx++
    }, CYCLE_INTERVAL)

    return () => clearInterval(id)
  }, [pool, reducedMotion])

  return (
    // 400×400 container; orbit radius 130px; cards 140×140 → margin -70px centres them
    <div
      className="relative h-[400px] w-[400px]"
      style={{ '--orbit-duration': `${ORBIT_DURATION}s` } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Outer decorative ring */}
      <div className="absolute inset-0 rounded-full border border-[var(--brand-accent)]/12" />
      {/* Inner ring */}
      <div className="absolute inset-12 rounded-full border border-[var(--brand-accent)]/8" />

      {/* Central teal glow */}
      <div
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl"
        style={{ background: 'var(--brand-accent)' }}
      />

      {/* Central brand mark */}
      <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/30">
        <span className="font-serif text-lg font-700 text-white">UF</span>
      </div>

      {/* Orbit anchor — all cards positioned relative to this centre point */}
      <div
        className="orbit-center"
        style={{ '--orbit-r': '130px' } as React.CSSProperties}
      >
        {slots.map((img, i) => (
          <div key={i} className="orbit-card">
            <AnimatePresence mode="wait">
              <m.div
                key={img.src}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-2xl shadow-xl ring-2 ring-white/10"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={140}
                  height={140}
                  priority={i === 0}
                  className="h-[140px] w-[140px] object-cover"
                />
              </m.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────────

export function HeroSection({ orbitImages = [] }: Props) {
  const pool = orbitImages.length >= 3 ? orbitImages : FALLBACK
  const reducedMotion = useReducedMotion()

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-base)]"
    >
      {/* Atmospheric blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-1/4 -top-1/4 h-[700px] w-[700px] rounded-full opacity-[0.14] dark:opacity-[0.09]"
          style={{ background: 'radial-gradient(circle at 40% 40%, var(--brand-accent) 0%, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-1/3 -left-1/4 h-[600px] w-[600px] rounded-full opacity-[0.08] dark:opacity-[0.06]"
          style={{ background: 'radial-gradient(circle at 60% 60%, var(--brand-accent) 0%, transparent 65%)' }}
        />
        {/* Fine grid texture — adds depth at low opacity */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">

          {/* Copy */}
          <m.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <m.div variants={heroLine}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/8 px-3.5 py-1.5 text-xs font-600 text-[var(--brand-accent)]">
                <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--brand-accent)]" />
                New Season — Summer 2026
              </span>
            </m.div>

            <m.h1
              variants={heroLine}
              className="mt-5 font-serif text-5xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              The{' '}
              <em className="not-italic text-[var(--brand-accent)]">best</em>{' '}
              of everything,{' '}
              <br className="hidden sm:block" />
              delivered fast.
            </m.h1>

            <m.p
              variants={heroLine}
              className="mt-5 max-w-[42ch] text-lg leading-relaxed text-[var(--text-secondary)]"
            >
              Electronics, fashion, beauty, toys — selected for quality and shipped anywhere in the US.
            </m.p>

            <m.div variants={heroLine} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-600 text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-secondary)] hover:shadow-md active:scale-[0.97]"
              >
                Shop Now
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--border-default)] px-6 py-3.5 text-sm font-600 text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] active:scale-[0.97]"
              >
                <Zap aria-hidden="true" className="h-4 w-4 text-[var(--brand-accent)]" />
                Today&apos;s Deals
              </Link>
            </m.div>

            <m.div
              variants={heroLine}
              className="mt-10 border-t border-[var(--border-subtle)] pt-6"
            >
              <dl className="flex flex-wrap items-center gap-x-0 gap-y-3">
                {[
                  { icon: Users,  value: '50K+',  label: 'customers' },
                  { icon: null,   value: '4.9★',  label: 'avg rating' },
                  { icon: Truck,  value: 'Free',  label: 'shipping $49+' },
                ].map(({ icon: Icon, value, label }, i) => (
                  <div key={label} className="flex items-center">
                    {i > 0 && (
                      <div aria-hidden="true" className="mx-5 h-7 w-px bg-[var(--border-subtle)]" />
                    )}
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <dt className="font-serif text-lg font-600 text-[var(--text-primary)]">{value}</dt>
                        <dd className="text-xs text-[var(--text-muted)]">{label}</dd>
                      </div>
                    </div>
                  </div>
                ))}
              </dl>
            </m.div>
          </m.div>

          {/* Orbital product showcase */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="hidden lg:block"
          >
            <ProductOrbit pool={pool} />
          </m.div>
        </div>
      </div>

      {/* Scroll cue — hidden for reduced-motion: repeat:Infinity would strobe */}
      {!reducedMotion && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <m.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: [0.45, 0, 0.55, 1] }}
            className="flex flex-col items-center gap-1"
          >
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-[var(--brand-accent)]/40 to-[var(--brand-accent)]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]" />
          </m.div>
        </m.div>
      )}
    </section>
  )
}
