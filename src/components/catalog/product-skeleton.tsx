function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded bg-[var(--bg-muted)] ${className ?? ''}`}
    >
      {/* Shimmer sweep */}
      <span
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--bg-base) 60%, transparent) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <Bone className="aspect-square rounded-2xl" />
      <div className="mt-3 space-y-2">
        <Bone className="h-3.5 w-3/4" />
        <Bone className="h-3 w-1/3" />
        <Bone className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-3">
          <Bone className="aspect-square rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Bone className="h-9 w-2/3 rounded-xl" />
          <Bone className="h-4 w-1/4 rounded-md" />
          <Bone className="h-7 w-1/3 rounded-lg" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="h-3.5 rounded-md" />
            ))}
          </div>
          <Bone className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
