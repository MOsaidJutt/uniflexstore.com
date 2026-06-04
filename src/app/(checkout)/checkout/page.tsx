import type { Metadata } from 'next'
import { getSession } from '@/lib/dal'
import { CheckoutShell } from './_components/checkout-shell'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const session = await getSession()
  const userId = session?.user?.id ?? null
  return <CheckoutShell userId={userId} />
}
