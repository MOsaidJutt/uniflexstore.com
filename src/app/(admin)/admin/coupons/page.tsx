import { AdminTopbar } from '@/components/admin/topbar'
import { db } from '@/server/db'
import { decimalToNumber } from '@/lib/utils'
import { CouponsManager } from './_components/coupons-manager'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  const raw = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  })
  const coupons = raw.map((c) => ({
    ...c,
    value: decimalToNumber(c.value),
    minOrderAmt: c.minOrderAmt ? decimalToNumber(c.minOrderAmt) : null,
  }))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Coupons" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <CouponsManager coupons={coupons} />
      </main>
    </div>
  )
}
