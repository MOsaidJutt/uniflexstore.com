import { requireAdmin } from '@/lib/dal'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg-subtle)]">
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <Toaster />
    </div>
  )
}
