export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface ProductVariantData {
  id: string
  name: string
  value: string
  price: number | null
  stock: number
  sku: string | null
}

export interface ProductCard {
  id: string
  name: string
  slug: string
  price: number
  compareAt: number | null
  images: ProductImage[]
  avgRating: number
  reviewCount: number
  tags: string[]
  variantCount: number
  stock: number
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAt: number | null
  sku: string
  stock: number
  isFeatured: boolean
  attributes: Record<string, unknown> | null
  images: ProductImage[]
  variants: ProductVariantData[]
  categories: Array<{
    category: {
      id: string
      name: string
      slug: string
      parent: { id: string; name: string; slug: string } | null
    }
  }>
  tags: string[]
  avgRating: number
  reviewCount: number
  reviews: ProductReview[]
}

export interface ProductReview {
  id: string
  rating: number
  title: string | null
  body: string | null
  verified: boolean
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export interface CategoryTree {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parent: { id: string; name: string; slug: string } | null
  children: Array<{ id: string; name: string; slug: string; sortOrder: number }>
}

export interface FilterOptions {
  priceRange: { min: number; max: number }
  variants: Record<string, string[]>
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'

export interface ProductQuery {
  q?: string
  categorySlug?: string
  sort?: SortOption
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
  variants?: Record<string, string[]>
  inStock?: boolean
}

export interface ProductListResult {
  products: ProductCard[]
  total: number
  page: number
  pageCount: number
  filterOptions: FilterOptions
}

export interface SearchSuggestion {
  name: string
  href: string
  type: 'product' | 'category'
  image?: string
}
