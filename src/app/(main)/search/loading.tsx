import { ProductGridSkeleton } from '@/components/catalog/product-skeleton'

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <div className="relative h-9 w-56 overflow-hidden rounded-xl bg-[var(--bg-muted)]">
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[var(--bg-base)]/60 to-transparent" />
        </div>
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
