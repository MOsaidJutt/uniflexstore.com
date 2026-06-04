export interface CheckoutAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  estimatedDays: string
  price: number
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'USPS Ground Advantage',
    estimatedDays: '5–7 business days',
    price: 5.99,
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    description: 'UPS 2-Day',
    estimatedDays: '2–3 business days',
    price: 12.99,
  },
  {
    id: 'overnight',
    name: 'Overnight',
    description: 'FedEx Priority Overnight',
    estimatedDays: 'Next business day',
    price: 24.99,
  },
]

export const FREE_SHIPPING_THRESHOLD = 75

export type CheckoutStep = 'address' | 'shipping' | 'payment'

export interface CouponValidation {
  valid: boolean
  discountAmount: number
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null
  message: string
}

export type SavedAddress = {
  id: string
  label: string | null
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}
