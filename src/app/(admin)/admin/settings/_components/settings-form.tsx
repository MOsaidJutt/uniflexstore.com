'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateStoreSettings, type StoreSettings } from '@/server/actions/admin/settings'

export function SettingsForm({ initial }: { initial: StoreSettings }) {
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit } = useForm<StoreSettings>({ defaultValues: initial })

  const onSubmit = (data: StoreSettings) => {
    startTransition(async () => {
      const result = await updateStoreSettings(data)
      if (result.error) toast.error(result.error)
      else toast.success('Settings saved')
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Store Settings</h1>
          <p className="text-sm text-[var(--text-muted)]">Configure your store preferences</p>
        </div>
        <Button type="submit" loading={pending}>Save Settings</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tax">Tax & Shipping</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Store Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Store Name</Label>
                <Input {...register('storeName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input {...register('currency')} placeholder="USD" />
              </div>
              <div className="space-y-1.5">
                <Label>Support Email</Label>
                <Input {...register('supportEmail')} type="email" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Tax Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Default Tax Rate (%)</Label>
                <Input {...register('taxRate')} type="number" step="0.001" min="0" max="100" placeholder="8.875" />
                <p className="text-xs text-[var(--text-muted)]">e.g. 8.875 for 8.875% (NYC rate)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Shipping Rates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Free Shipping Threshold ($)</Label>
                  <Input {...register('freeShippingThreshold')} type="number" step="0.01" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Standard Shipping ($)</Label>
                  <Input {...register('standardShippingRate')} type="number" step="0.01" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Express Shipping ($)</Label>
                  <Input {...register('expressShippingRate')} type="number" step="0.01" min="0" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Email Subject Lines</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Order Confirmation Subject</Label>
                <Input {...register('orderConfirmationSubject')} />
              </div>
              <div className="space-y-1.5">
                <Label>Shipping Update Subject</Label>
                <Input {...register('shippingUpdateSubject')} />
              </div>
              <Separator />
              <p className="text-xs text-[var(--text-muted)]">
                Email templates are defined in <code className="rounded bg-[var(--bg-subtle)] px-1 py-0.5">src/lib/email.ts</code>. Edit that file to customize the full template HTML.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
