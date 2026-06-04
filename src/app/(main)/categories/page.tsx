import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, Shirt, Sparkles, Gamepad2, ArrowRight } from 'lucide-react'
import { getAllCategories } from '@/server/actions/catalog'
import { Reveal } from '@/components/shared/reveal'

export const metadata: Metadata = {
  title: 'All Categories — UniFlex Global',
  description: 'Browse all product categories at UniFlex Global.',
}

const topLevelIcons: Record<string, React.ElementType> = {
  electronics: Zap,
  fashion: Shirt,
  beauty: Sparkles,
  toys: Gamepad2,
}

const topLevelColors: Record<string, string> = {
  electronics: 'text-[#1daabc] dark:text-[#29c4d9]',
  fashion: 'text-teal-600 dark:text-teal-400',
  beauty: 'text-sky-600 dark:text-sky-400',
  toys: 'text-indigo-600 dark:text-indigo-400',
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          All Categories
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Browse everything we carry across four departments.
        </p>
      </Reveal>

      <div className="mt-10 space-y-12">
        {categories.map((cat) => {
          const Icon = topLevelIcons[cat.slug] ?? Zap
          const iconColor = topLevelColors[cat.slug] ?? 'text-[var(--brand-accent)]'

          return (
            <Reveal key={cat.id} as="section" aria-labelledby={`cat-${cat.slug}`}>
              <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                <h2
                  id={`cat-${cat.slug}`}
                  className="font-serif text-xl font-600 text-[var(--text-primary)]"
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="transition-colors hover:text-[var(--brand-accent)]"
                  >
                    {cat.name}
                  </Link>
                </h2>
                <Link
                  href={`/categories/${cat.slug}`}
                  aria-label={`Shop all ${cat.name}`}
                  className="group ml-auto flex items-center gap-1 text-sm text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
                >
                  Shop all
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <ul
                role="list"
                className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
              >
                {cat.children.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/categories/${sub.slug}`}
                      className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--brand-accent)]/40 hover:bg-[var(--brand-accent)]/5 hover:text-[var(--brand-accent)]"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
