'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, m } from 'motion/react'
import { Menu, X, Phone } from 'lucide-react'
import { easeSmooth } from '@/lib/motion'
import { logisticsConfig } from '@/config/logistics'

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-us', label: 'Why us' },
  { href: '#contact', label: 'Contact' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-[200] border-b border-white/10 bg-[#0a1520]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/logistics" className="flex items-baseline gap-1.5" onClick={() => setOpen(false)}>
          <span className="font-sans text-xl font-800 tracking-tight text-white">Uniflex</span>
          <span className="font-sans text-xl font-300 tracking-tight text-[#29c4d9]">Logistics</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-500 text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${logisticsConfig.phone.replace(/[^+\d]/g, '')}`}
            className="flex items-center gap-2 text-sm font-600 text-white/85 transition-colors hover:text-white"
          >
            <Phone className="h-4 w-4 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
            {logisticsConfig.phoneDisplay}
          </a>
          <a
            href="#contact"
            className="rounded-full bg-[#1daabc] px-5 py-2.5 text-sm font-700 text-[#0a1520] transition-transform hover:-translate-y-0.5 hover:bg-[#29c4d9] active:translate-y-0"
          >
            Get a Quote
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={easeSmooth}
            className="overflow-hidden border-t border-white/10 bg-[#0a1520] lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-500 text-white/80 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`tel:${logisticsConfig.phone.replace(/[^+\d]/g, '')}`}
                className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-base font-600 text-white/85"
              >
                <Phone className="h-4 w-4 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
                {logisticsConfig.phoneDisplay}
              </a>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-[#1daabc] px-5 py-3 text-center text-base font-700 text-[#0a1520]"
              >
                Get a Quote
              </a>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
