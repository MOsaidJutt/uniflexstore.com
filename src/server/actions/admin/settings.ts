'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireAdmin } from '@/lib/dal'
import { SUPPORTED_MODELS, type AISettings } from '@/lib/ai-models'

// ─── AI Settings ───────────────────────────────────────────────────────────────

const AI_KEY = 'ai'

export async function getAISettings(): Promise<AISettings> {
  const row = await db.storeSetting.findUnique({ where: { key: AI_KEY } })
  if (!row) return { model: process.env.AI_MODEL ?? 'gpt-4o-mini', apiKey: null }
  try {
    const data = JSON.parse(row.value) as Record<string, string>
    return {
      model: data.model ?? process.env.AI_MODEL ?? 'gpt-4o-mini',
      apiKey: data.apiKey ?? null,
    }
  } catch {
    return { model: process.env.AI_MODEL ?? 'gpt-4o-mini', apiKey: null }
  }
}

export async function updateAISettings(data: {
  model: string
  apiKey?: string
}): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()

  const modelOk = SUPPORTED_MODELS.some((m) => m.value === data.model)
  if (!modelOk) return { error: 'Unsupported model' }

  const current = await getAISettings()

  // Keep existing key if no new one provided
  const apiKey =
    data.apiKey && data.apiKey.trim() !== '' ? data.apiKey.trim() : (current.apiKey ?? null)

  await db.storeSetting.upsert({
    where: { key: AI_KEY },
    update: { value: JSON.stringify({ model: data.model, apiKey }) },
    create: { key: AI_KEY, value: JSON.stringify({ model: data.model, apiKey }) },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function deleteAIApiKey(): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin()
  const current = await getAISettings()

  await db.storeSetting.upsert({
    where: { key: AI_KEY },
    update: { value: JSON.stringify({ model: current.model, apiKey: null }) },
    create: { key: AI_KEY, value: JSON.stringify({ model: current.model, apiKey: null }) },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}

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
