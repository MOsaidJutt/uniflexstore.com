import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { CouponsManager } from './_components/coupons-manager'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  })

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Coupons" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="flex-1 overflow-auto p-6">
        <CouponsManager coupons={coupons} />
      </main>
    </div>
  )
}
