import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserButton } from '@/components/layout/user-button'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header userButton={<UserButton />} />
      <main className="flex-1 bg-[var(--bg-subtle)]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
