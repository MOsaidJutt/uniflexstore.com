'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardPen } from 'lucide-react'

// Dev-only utility: triple right-click fills every visible input/textarea
// with its placeholder text (including React-controlled inputs).
// Remove this component before going to production.

const SELECTORS = 'input[placeholder]:not([disabled]), textarea[placeholder]:not([disabled])'

// Native value setters — required to trigger React's synthetic onChange
const inputSetter  = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,  'value')?.set
const textAreaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set

function fillPlaceholders(): number {
  const fields = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(SELECTORS))
  let filled = 0

  for (const el of fields) {
    const placeholder = el.placeholder
    if (!placeholder) continue

    // Skip password fields — placeholder is usually unhelpful
    if ((el as HTMLInputElement).type === 'password') continue

    const setter = el instanceof HTMLTextAreaElement ? textAreaSetter : inputSetter
    setter?.call(el, placeholder)
    el.dispatchEvent(new Event('input',  { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    filled++
  }

  return filled
}

export function PlaceholderFill() {
  const [toast, setToast] = useState<{ count: number } | null>(null)

  useEffect(() => {
    let clicks = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    function handleContextMenu(e: MouseEvent) {
      clicks++

      if (timer) clearTimeout(timer)
      // Reset click count if no further right-click within 500ms
      timer = setTimeout(() => { clicks = 0 }, 500)

      if (clicks >= 3) {
        e.preventDefault()  // suppress the browser context menu on the 3rd hit
        clicks = 0
        if (timer) clearTimeout(timer)

        const filled = fillPlaceholders()
        if (filled > 0) {
          setToast({ count: filled })
          setTimeout(() => setToast(null), 2000)
        }
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (typeof window === 'undefined' || !toast) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[--z-toast] flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-600 text-white shadow-xl"
      style={{ animation: 'fill-toast 2s ease-out forwards' }}
    >
      <ClipboardPen className="h-4 w-4 text-[var(--brand-accent)]" aria-hidden="true" />
      Filled {toast.count} field{toast.count !== 1 ? 's' : ''} with placeholder text
    </div>,
    document.body
  )
}
