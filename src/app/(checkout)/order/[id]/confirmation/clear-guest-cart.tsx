'use client'

import { useEffect } from 'react'
import { CART_LS_KEY } from '@/types/cart'

export function ClearGuestCart() {
  useEffect(() => {
    localStorage.removeItem(CART_LS_KEY)
  }, [])
  return null
}
