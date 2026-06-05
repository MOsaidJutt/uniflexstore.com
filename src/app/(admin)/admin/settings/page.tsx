import { AdminTopbar } from '@/components/admin/topbar'
import { getStoreSettings, getAISettings } from '@/server/actions/admin/settings'
import { SettingsForm } from './_components/settings-form'

export const dynamic = 'force-dynamic'

function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••'
  return key.slice(0, 12) + '••••••••' + key.slice(-4)
}

export default async function SettingsPage() {
  const [settings, aiSettings] = await Promise.all([getStoreSettings(), getAISettings()])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminTopbar title="Settings" breadcrumbs={[{ label: 'Admin', href: '/admin' }]} />
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <SettingsForm
          initial={settings}
          initialAI={{
            model: aiSettings.model,
            maskedKey: aiSettings.apiKey ? maskApiKey(aiSettings.apiKey) : null,
            hasKey: !!aiSettings.apiKey,
          }}
        />
      </main>
    </div>
  )
}

