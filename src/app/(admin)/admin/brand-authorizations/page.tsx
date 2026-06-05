import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { BrandAuthsManager } from './_components/brand-auths-manager'

export const dynamic = 'force-dynamic'

export default async function BrandAuthsPage() {
  const brands = await db.brandAuthorization.findMany({ orderBy: { sortOrder: 'asc' } })
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() + 30)

  const alerts = brands.filter((b) => b.validUntil && b.validUntil < cutoff)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Brand Authorizations" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <BrandAuthsManager brands={brands} alerts={alerts.map((a) => a.id)} />
      </main>
    </div>
  )
}

