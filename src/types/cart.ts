export interface LocalCartItem {
  productId: string
  variantId: string | null
  quantity: number
  name: string
  slug: string
  image: string
  price: number
  compareAt: number | null
  variantName: string | null
  variantValue: string | null
  stock: number
}

export interface CartState {
  items: LocalCartItem[]
  isOpen: boolean
}

export type CartAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' }
  | { type: 'SET_ITEMS'; items: LocalCartItem[] }
  | { type: 'ADD_ITEM'; item: LocalCartItem }
  | { type: 'UPDATE_QUANTITY'; productId: string; variantId: string | null; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string; variantId: string | null }
  | { type: 'CLEAR' }

export const CART_LS_KEY = 'uf_cart'

export interface CartContextValue {
  state: CartState
  addItem: (item: LocalCartItem) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  removeItem: (productId: string, variantId: string | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  itemCount: number
  subtotal: number
}
