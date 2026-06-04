import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserButton } from '@/components/layout/user-button'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header userButton={<UserButton />} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
