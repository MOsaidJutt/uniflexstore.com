'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'

const SettingsSchema = z.object({
  storeName: z.string().min(1),
  currency: z.string().default('USD'),
  taxRate: z.coerce.number().min(0).max(100).default(8.875),
  freeShippingThreshold: z.coerce.number().min(0).default(50),
  standardShippingRate: z.coerce.number().min(0).default(5.99),
  expressShippingRate: z.coerce.number().min(0).default(14.99),
  supportEmail: z.string().default('support@uniflexstore.com'),
  orderConfirmationSubject: z.string().default('Your UniFlex Store order is confirmed'),
  shippingUpdateSubject: z.string().default('Your order has shipped'),
  zones: z.array(z.object({ state: z.string(), rate: z.coerce.number() })).default([]),
})

export type StoreSettings = z.infer<typeof SettingsSchema>

const SETTINGS_KEY = 'store'

const DEFAULTS: StoreSettings = {
  storeName: 'UniFlex Store',
  currency: 'USD',
  taxRate: 8.875,
  freeShippingThreshold: 50,
  standardShippingRate: 5.99,
  expressShippingRate: 14.99,
  supportEmail: 'support@uniflexstore.com',
  orderConfirmationSubject: 'Your UniFlex Store order is confirmed',
  shippingUpdateSubject: 'Your order has shipped',
  zones: [],
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await db.storeSetting.findUnique({ where: { key: SETTINGS_KEY } })
  if (!row) return DEFAULTS
  try {
    const parsed = SettingsSchema.safeParse(JSON.parse(row.value))
    return parsed.success ? parsed.data : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export async function updateStoreSettings(data: Partial<StoreSettings>) {
  await requireAdmin()
  const current = await getStoreSettings()
  const merged = { ...current, ...data }
  const parsed = SettingsSchema.safeParse(merged)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  await db.storeSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(parsed.data) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(parsed.data) },
  })
  revalidatePath('/admin/settings')
  return { success: true, settings: parsed.data }
}
