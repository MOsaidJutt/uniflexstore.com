import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkLogisticsLeadRate } from '@/lib/rate-limit'
import { sendLogisticsLeadEmail } from '@/lib/email'

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(200),
  truckType: z.string().trim().min(1).max(50),
  route: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
})

export async function POST(request: NextRequest) {
  const allowed = await checkLogisticsLeadRate()
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  try {
    await sendLogisticsLeadEmail(parsed.data)
  } catch (err) {
    console.error('Failed to send logistics lead email:', err)
    return NextResponse.json(
      { error: 'Failed to submit request. Please call dispatch directly.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
