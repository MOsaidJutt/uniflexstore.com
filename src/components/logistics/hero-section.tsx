'use client'

import Image from 'next/image'
import { ArrowRight, Phone, Radio } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { heroContainer, heroLine, heroMedia } from '@/lib/motion'
import { logisticsConfig } from '@/config/logistics'

export function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#0a1520]">
      {/* Subtle route-line texture — CSS only, no illustration asset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 49.5%, #29c4d9 49.5%, #29c4d9 50.5%, transparent 50.5%)',
          backgroundSize: '120px 100%',
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-20 lg:pb-24 xl:px-8">
        <m.div
          initial={reduce ? false : 'hidden'}
          animate="visible"
          variants={heroContainer}
        >
          <m.h1
            variants={heroLine}
            className="max-w-xl font-sans text-4xl font-800 leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Freight booked. Rates negotiated. You keep driving.
          </m.h1>

          <m.p
            variants={heroLine}
            className="mt-6 max-w-md text-lg leading-relaxed text-white/60"
          >
            Uniflex Logistics handles load boards, broker calls, and paperwork so your
            truck stays loaded and moving, coast to coast.
          </m.p>

          <m.div variants={heroLine} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#1daabc] px-7 py-3.5 text-base font-700 text-[#0a1520] transition-transform hover:-translate-y-0.5 hover:bg-[#29c4d9] active:translate-y-0"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </a>
            <a
              href={`tel:${logisticsConfig.phone.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-600 text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <Phone className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Call Dispatch
            </a>
          </m.div>
        </m.div>

        <m.div
          initial={reduce ? false : 'hidden'}
          animate="visible"
          variants={heroMedia}
          className="relative"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]">
            {/* PLACEHOLDER photography — swap for real fleet/truck photos before launch */}
            <Image
              src="https://picsum.photos/seed/uniflex-freight-highway/900/1125"
              alt="Freight truck on an interstate highway at dusk"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/10 to-transparent" />
            <div className="absolute inset-0 bg-[#0d2635]/25" />
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1520]/80 px-5 py-4 backdrop-blur-md sm:left-6 sm:right-auto sm:min-w-[240px]">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-600 uppercase tracking-[0.08em] text-white/50">
                <Radio className="h-3 w-3 text-[#4ade80]" strokeWidth={2.5} aria-hidden="true" />
                Dispatch desk
              </p>
              <p className="mt-1 text-lg font-700 text-white">{logisticsConfig.hours}</p>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
