import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserButton } from '@/components/layout/user-button'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { ChatWidget } from '@/components/chat/chat-widget'
import { getSession } from '@/lib/dal'
import { getCartDB } from '@/server/actions/cart'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const userId = session?.user?.id ?? null
  const initialItems = userId ? await getCartDB(userId) : []

  return (
    <CartProvider userId={userId} initialItems={initialItems}>
      <Header userButton={<UserButton />} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget userId={userId} />
    </CartProvider>
  )
}
