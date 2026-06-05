import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'
import { db } from '@/server/db'
import { checkThreadRate } from '@/lib/rate-limit'

const SID_COOKIE = '__chat_sid'
const SID_MAX_AGE = 60 * 60 * 24 * 90 // 90 days
const MAX_PERSISTED_MESSAGES = 200

function isMissingTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('does not exist') || msg.includes('P2021') || msg.includes('relation')
}

// ─── GET — load thread (read-only for guests; never creates a row on page load) ─

export async function GET() {
  const cookieStore = await cookies()
  const session = await auth()
  const userId = session?.user?.id ?? null

  let sid = cookieStore.get(SID_COOKIE)?.value ?? null
  const freshSid = !sid
  if (!sid) sid = randomUUID()

  let messages: unknown[] = []

  try {
    if (userId) {
      let thread = await db.chatThread.findUnique({ where: { userId } })

      if (!thread && sid) {
        // Migrate session thread to userId if one exists
        const sidThread = await db.chatThread.findUnique({ where: { sessionId: sid } })
        if (sidThread) {
          thread = await db.chatThread.update({
            where: { id: sidThread.id },
            data: { userId, sessionId: null },
          })
        }
      }

      if (!thread) {
        // Create thread for authenticated users (they actively signed in)
        thread = await db.chatThread.create({ data: { userId, messages: [] } })
      }

      messages = Array.isArray(thread.messages) ? (thread.messages as unknown[]) : []
    } else if (sid) {
      // Guests: look up only — no creation. Thread is created on first POST (first message sent).
      const thread = await db.chatThread.findUnique({ where: { sessionId: sid } })
      messages = Array.isArray(thread?.messages) ? (thread.messages as unknown[]) : []
    }
  } catch (err) {
    if (isMissingTableError(err)) {
      console.warn('[chat:thread] ChatThread table missing — run: npx prisma migrate dev --name add_chat_thread')
    } else {
      console.error('[chat:thread] GET error:', err)
    }
    // Graceful degradation: return empty thread; app stays functional
  }

  const res = NextResponse.json({ messages })

  if (freshSid) {
    res.cookies.set(SID_COOKIE, sid!, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SID_MAX_AGE,
    })
  }

  return res
}

// ─── POST — save thread ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const allowed = await checkThreadRate()
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const cookieStore = await cookies()
  const session = await auth()
  const userId = session?.user?.id ?? null
  const sid = cookieStore.get(SID_COOKIE)?.value ?? null

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : []
  // Cap at MAX_PERSISTED_MESSAGES to control storage growth; keep the most recent
  const messages = rawMessages.slice(-MAX_PERSISTED_MESSAGES)

  try {
    if (userId) {
      await db.chatThread.upsert({
        where: { userId },
        update: { messages },
        create: { userId, messages },
      })
    } else if (sid) {
      await db.chatThread.upsert({
        where: { sessionId: sid },
        update: { messages },
        create: { sessionId: sid, messages },
      })
    }
  } catch (err) {
    if (isMissingTableError(err)) {
      console.warn('[chat:thread] ChatThread table missing — run: npx prisma migrate dev --name add_chat_thread')
    } else {
      console.error('[chat:thread] POST error:', err)
    }
    // Best-effort save — return ok so the widget doesn't show an error
  }

  return NextResponse.json({ ok: true })
}
