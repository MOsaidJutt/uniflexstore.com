// Shared TypeScript types for UniFlex Store.
// Domain types are generated from the Prisma schema via @prisma/client.
// Add hand-written utility types here that don't belong in the schema.

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** Paginated API response wrapper */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/** Generic API error shape */
export interface ApiError {
  message: string
  code?: string
  field?: string
}

/** Minimal product shape for listing surfaces (PLP, search results) */
export interface ProductCard {
  id: string
  name: string
  slug: string
  price: number      // cents — always convert from Prisma Decimal before passing to client
  compareAt?: number // cents
  image: string
  rating?: number
  reviewCount?: number
  badge?: 'new' | 'sale' | 'hot'
}
