import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { auth } from '@/auth'
import { MobileSidebarTrigger } from './mobile-sidebar-trigger'

interface TopbarProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export async function AdminTopbar({ title, breadcrumbs }: TopbarProps) {
  const session = await auth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-base)] px-6">
      <div className="flex items-center gap-3">
        <MobileSidebarTrigger />
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          {breadcrumbs?.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--text-muted)]">{crumb.label}</span>
              )}
              {i < (breadcrumbs?.length ?? 0) - 1 && <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>}
            </span>
          ))}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
            </>
          )}
          <h1 className="font-semibold text-[var(--text-primary)]" aria-current="page">{title}</h1>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Search"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="ml-2 flex items-center gap-2 border-l border-[var(--border-default)] pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-accent)] text-xs font-semibold text-white">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="hidden text-xs font-medium text-[var(--text-secondary)] sm:block">
            {session?.user?.name ?? session?.user?.email}
          </span>
        </div>
      </div>
    </header>
  )
}
