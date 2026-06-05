import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/dal'
import { CheckoutShell } from './_components/checkout-shell'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()])
  const userId = session?.user?.id ?? null
  const initialCouponCode = cookieStore.get('__chat_coupon')?.value ?? ''
  return <CheckoutShell userId={userId} initialCouponCode={initialCouponCode} />
}
