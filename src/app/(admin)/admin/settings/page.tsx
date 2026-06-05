import { AdminTopbar } from '@/components/admin/topbar'
import { getStoreSettings } from '@/server/actions/admin/settings'
import { SettingsForm } from './_components/settings-form'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getStoreSettings()
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <AdminTopbar title="Settings" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="flex-1 overflow-auto p-6">
        <SettingsForm initial={settings} />
      </main>
    </div>
  )
}
