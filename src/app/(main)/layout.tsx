import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserButton } from '@/components/layout/user-button'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { getSession } from '@/lib/dal'
import { getCartDB } from '@/server/actions/cart'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const userId = session?.user?.id ?? null
  const initialItems = userId ? await getCartDB(userId) : []
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <CartProvider userId={userId} initialItems={initialItems}>
      <Header userButton={<UserButton />} isAdmin={isAdmin} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
