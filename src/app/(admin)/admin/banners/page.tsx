import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { BannersManager } from './_components/banners-manager'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Banners" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="flex-1 overflow-auto p-6">
        <BannersManager banners={banners} />
      </main>
    </div>
  )
}
