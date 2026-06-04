import { NextRequest, NextResponse } from 'next/server'
import { getSearchSuggestions } from '@/server/actions/catalog'
import { checkSearchRate } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const allowed = await checkSearchRate()
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const q = request.nextUrl.searchParams.get('q') ?? ''
  const suggestions = await getSearchSuggestions(q)
  return NextResponse.json(suggestions)
}
