'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { COLOR_MAP, COLOR_VARIANT_NAMES } from '@/lib/color-map'
import type { ProductVariantData } from '@/types/catalog'

interface VariantSelectorProps {
  variants: ProductVariantData[]
  basePrice: number
  onChange?: (
    selected: Record<string, string>,
    variantId: string | null,
    priceAdjust: number | null
  ) => void
}

export function VariantSelector({ variants, basePrice, onChange }: VariantSelectorProps) {
  const groups = variants.reduce<Record<string, ProductVariantData[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name].push(v)
    return acc
  }, {})

  const groupNames = Object.keys(groups)

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    groupNames.reduce<Record<string, string>>((acc, name) => {
      acc[name] = groups[name][0]?.value ?? ''
      return acc
    }, {})
  )

  const getMatchingVariant = useCallback(
    (sel: Record<string, string>): ProductVariantData | null => {
      if (groupNames.length === 1) {
        const [name] = groupNames
        return groups[name]?.find((v) => v.value === sel[name]) ?? null
      }
      return (
        variants.find((v) =>
          groupNames.every((name) => (v.name !== name ? true : v.value === sel[name]))
        ) ?? null
      )
    },
    [variants, groups, groupNames]
  )

  function handleSelect(groupName: string, value: string) {
    const next = { ...selected, [groupName]: value }
    setSelected(next)
    const match = getMatchingVariant(next)
    onChange?.(next, match?.id ?? null, match?.price ?? null)
  }

  const matchedVariant = getMatchingVariant(selected)
  const stockForVariant = matchedVariant?.stock ?? 0

  return (
    <div className="space-y-4">
      {groupNames.map((name) => {
        const options = groups[name]
        const isColor = COLOR_VARIANT_NAMES.has(name)
        const selectedVal = selected[name]

        return (
          <div key={name}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-sm font-600 text-[var(--text-primary)]">{name}</span>
              <span className="text-sm text-[var(--text-muted)]">{selectedVal}</span>
            </div>

            {isColor ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Choose ${name}`}>
                {options.map((v) => {
                  const hex = COLOR_MAP[v.value]
                  const isSelected = v.value === selectedVal
                  const oos = v.stock === 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(name, v.value)}
                      disabled={oos}
                      aria-label={`${v.value}${oos ? ' (out of stock)' : ''}${isSelected ? ' (selected)' : ''}`}
                      aria-pressed={isSelected}
                      title={v.value + (oos ? ' — Out of stock' : '')}
                      className={cn(
                        // h-10 w-10 = 40px — meets WCAG 2.2 SC 2.5.8 minimum
                        'h-10 w-10 rounded-full border-2 transition-all duration-150',
                        isSelected
                          ? 'border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)] ring-offset-2'
                          : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                        oos && 'cursor-not-allowed opacity-40'
                      )}
                      style={{ backgroundColor: hex ?? '#ccc' }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Choose ${name}`}>
                {options.map((v) => {
                  const isSelected = v.value === selectedVal
                  const oos = v.stock === 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(name, v.value)}
                      disabled={oos}
                      aria-pressed={isSelected}
                      className={cn(
                        'relative min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm font-500 transition-all duration-150',
                        isSelected
                          ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                          : oos
                            ? 'cursor-not-allowed border-[var(--border-default)] text-[var(--text-muted)] opacity-50'
                            : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      {v.value}
                      {oos && (
                        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute h-px w-full rotate-45 bg-current opacity-40" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Price note for variant-level overrides */}
      {matchedVariant?.price != null && matchedVariant.price !== basePrice && (
        <p className="text-xs text-[var(--text-muted)]">
          Price updated for selected {groupNames[0]?.toLowerCase() ?? 'option'}
        </p>
      )}

      {/* Low stock on selected variant */}
      {stockForVariant > 0 && stockForVariant <= 5 && (
        <p className="text-xs font-500 text-amber-600">
          Only {stockForVariant} left in stock
        </p>
      )}
    </div>
  )
}
