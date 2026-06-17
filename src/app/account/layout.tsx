import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserButton } from '@/components/layout/user-button'
import { getSession } from '@/lib/dal'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <>
      <Header userButton={<UserButton />} isAdmin={isAdmin} />
      <main className="flex-1 bg-[var(--bg-subtle)]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
