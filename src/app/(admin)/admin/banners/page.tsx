import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { BannersManager } from './_components/banners-manager'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Banners" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <BannersManager banners={banners} />
      </main>
    </div>
  )
}

