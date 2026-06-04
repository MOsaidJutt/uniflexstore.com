'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  startTransition,
  useMemo,
} from 'react'
import type { LocalCartItem, CartState, CartAction, CartContextValue } from '@/types/cart'
import { CART_LS_KEY } from '@/types/cart'
import {
  addToCartDB,
  updateCartItemDB,
  removeFromCartDB,
  clearCartDB,
  mergeCartDB,
} from '@/server/actions/cart'

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return { ...state, isOpen: false }
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen }
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    case 'ADD_ITEM': {
      const idx = state.items.findIndex(
        (i) => i.productId === action.item.productId && i.variantId === action.item.variantId
      )
      if (idx >= 0) {
        const items = [...state.items]
        items[idx] = { ...items[idx], quantity: items[idx].quantity + action.item.quantity }
        return { ...state, items }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.productId === action.productId && i.variantId === action.variantId)
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId && i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.productId === action.productId && i.variantId === action.variantId)
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const noop = () => {}
const emptyState: CartState = { items: [], isOpen: false }
const fallback: CartContextValue = {
  state: emptyState,
  addItem: noop,
  updateQuantity: noop,
  removeItem: noop,
  clearCart: noop,
  openCart: noop,
  closeCart: noop,
  itemCount: 0,
  subtotal: 0,
}

const CartContext = createContext<CartContextValue>(fallback)

export function useCartContext() {
  return useContext(CartContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface CartProviderProps {
  children: React.ReactNode
  userId: string | null
  initialItems: LocalCartItem[]
}

export function CartProvider({ children, userId, initialItems }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, { items: initialItems, isOpen: false })
  const initializedRef = useRef(false)
  const userIdRef = useRef(userId)

  // On mount: for guests load localStorage; for logged-in users merge any guest localStorage
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const raw = localStorage.getItem(CART_LS_KEY)
    if (!raw) return

    let guestItems: LocalCartItem[] = []
    try {
      guestItems = JSON.parse(raw)
    } catch {
      localStorage.removeItem(CART_LS_KEY)
      return
    }

    if (userId) {
      // Merge localStorage into DB, then clear localStorage
      if (guestItems.length > 0) {
        startTransition(async () => {
          await mergeCartDB(userId, guestItems)
          localStorage.removeItem(CART_LS_KEY)
        })
        // Merge optimistically into local state
        for (const item of guestItems) {
          dispatch({ type: 'ADD_ITEM', item })
        }
      } else {
        localStorage.removeItem(CART_LS_KEY)
      }
    } else {
      dispatch({ type: 'SET_ITEMS', items: guestItems })
    }
  }, [userId])

  // Persist to localStorage for guests only
  useEffect(() => {
    if (!initializedRef.current) return
    if (userIdRef.current) return
    localStorage.setItem(CART_LS_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = useCallback(
    (item: LocalCartItem) => {
      dispatch({ type: 'ADD_ITEM', item })
      dispatch({ type: 'OPEN' })
      if (userId) {
        startTransition(async () => {
          await addToCartDB(userId, item.productId, item.variantId, item.quantity)
        })
      }
    },
    [userId]
  )

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', productId, variantId, quantity })
      if (userId) {
        startTransition(async () => {
          await updateCartItemDB(userId, productId, variantId, quantity)
        })
      }
    },
    [userId]
  )

  const removeItem = useCallback(
    (productId: string, variantId: string | null) => {
      dispatch({ type: 'REMOVE_ITEM', productId, variantId })
      if (userId) {
        startTransition(async () => {
          await removeFromCartDB(userId, productId, variantId)
        })
      }
    },
    [userId]
  )

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    if (userId) {
      startTransition(async () => {
        await clearCartDB(userId)
      })
    }
  }, [userId])

  const openCart = useCallback(() => dispatch({ type: 'OPEN' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE' }), [])

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  )

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items]
  )

  const value = useMemo<CartContextValue>(
    () => ({ state, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart, itemCount, subtotal }),
    [state, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart, itemCount, subtotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
