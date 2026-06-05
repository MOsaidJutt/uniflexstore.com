import { cache } from 'react'
import { db } from '@/server/db'
import type { BrandAuthorization } from '@prisma/client'

export type BrandAuthRecord = Pick<
  BrandAuthorization,
  | 'id'
  | 'brandName'
  | 'brandLogoUrl'
  | 'authorizationType'
  | 'certificateAssetUrl'
  | 'verificationUrl'
  | 'verificationNote'
  | 'displayBlurb'
  | 'sortOrder'
>

function activeWhere() {
  const now = new Date()
  return {
    isPublished: true,
    OR: [{ validFrom: null }, { validFrom: { lte: now } }],
    AND: [{ OR: [{ validUntil: null }, { validUntil: { gt: now } }] }],
  }
}

const select = {
  id: true,
  brandName: true,
  brandLogoUrl: true,
  authorizationType: true,
  certificateAssetUrl: true,
  verificationUrl: true,
  verificationNote: true,
  displayBlurb: true,
  sortOrder: true,
} as const

export const getActiveAuthorizations = cache(async (): Promise<BrandAuthRecord[]> => {
  return db.brandAuthorization.findMany({
    where: activeWhere(),
    select,
    orderBy: { sortOrder: 'asc' },
  })
})

export const getAuthorizationForProduct = cache(
  async (productName: string): Promise<BrandAuthRecord | null> => {
    const records = await getActiveAuthorizations()
    return (
      records.find((r) =>
        new RegExp(`\\b${r.brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(productName)
      ) ?? null
    )
  }
)
