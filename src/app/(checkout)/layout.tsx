import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { getSession } from '@/lib/dal'
import { getCartDB } from '@/server/actions/cart'

export default async function CheckoutGroupLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  const userId = session?.user?.id ?? null
  const initialItems = userId ? await getCartDB(userId) : []

  return (
    <CartProvider userId={userId} initialItems={initialItems}>
      <div className="flex min-h-dvh flex-col bg-[var(--bg-base)]">
        <header className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" aria-label="UniFlex Global — Home">
              <span className="flex h-9 items-center rounded-xl bg-white px-2 shadow-sm transition-opacity hover:opacity-90">
                <Image
                  src="/logo.png"
                  alt="UniFlex Global"
                  width={100}
                  height={32}
                  priority
                  className="h-7 w-auto object-contain"
                />
              </span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Continue shopping
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <CartDrawer />
    </CartProvider>
  )
}
