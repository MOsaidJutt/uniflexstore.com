'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Ticket,
  Image,
  Award,
  BarChart3,
  Settings,
  Store,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Brand Auths', href: '/admin/brand-authorizations', icon: Award },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[var(--border-default)] bg-[var(--bg-base)]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--border-default)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
          <Store className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">UniFlex Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 mb-0.5',
                active
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-150',
                  active ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-default)] px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Store className="h-3.5 w-3.5" />
          View storefront
        </Link>
      </div>
    </aside>
  )
}
