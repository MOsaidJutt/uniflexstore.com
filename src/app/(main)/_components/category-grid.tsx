'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { Zap, Shirt, Sparkles, Gamepad2, ArrowRight } from 'lucide-react'
import { revealStagger, revealStaggerItem } from '@/lib/motion'

const cats = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, audio and more',
    icon: Zap,
    accent: 'from-cyan-500/10 to-sky-500/5',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-[var(--brand-accent)]',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, bags',
    icon: Shirt,
    accent: 'from-teal-500/10 to-emerald-500/5',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup, haircare',
    icon: Sparkles,
    accent: 'from-sky-500/10 to-blue-500/5',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    name: 'Toys',
    slug: 'toys',
    description: 'Games, learning, outdoor',
    icon: Gamepad2,
    accent: 'from-indigo-500/10 to-violet-500/5',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
]

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Four departments, thousands of choices.
          </p>
        </div>
        <Link
          href="/products"
          className="group hidden items-center gap-1.5 text-sm font-500 text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)] sm:flex"
        >
          All products
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <m.ul
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        role="list"
      >
        {cats.map(({ name, slug, description, icon: Icon, accent, iconBg, iconColor }) => (
          <m.li key={slug} variants={revealStaggerItem}>
            <Link
              href={`/categories/${slug}`}
              className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${accent} border border-[var(--border-subtle)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-accent)]/40 hover:shadow-lg hover:shadow-[var(--brand-accent)]/8`}
            >
              {/* Icon */}
              <span
                className={`${iconBg} flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-[1.12] group-hover:shadow-sm`}
              >
                <Icon
                  className={`h-5 w-5 ${iconColor}`}
                  aria-hidden="true"
                />
              </span>

              {/* Text */}
              <div>
                <span className="block font-semibold text-[var(--text-primary)]">{name}</span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{description}</span>
              </div>

              {/* Arrow — slides in from left on hover */}
              <div
                aria-hidden="true"
                className="-translate-x-1 absolute bottom-5 right-5 flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
              >
                <ArrowRight className={`h-3.5 w-3.5 ${iconColor}`} />
              </div>
            </Link>
          </m.li>
        ))}
      </m.ul>

      {/* Mobile "all products" link */}
      <div className="mt-6 sm:hidden">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] py-3 text-sm font-500 text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
        >
          Browse all products
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
