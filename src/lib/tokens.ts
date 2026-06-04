import { randomBytes } from 'crypto'
import { db } from '@/server/db'

function generateToken() {
  return randomBytes(32).toString('hex')
}

// ─── Email Verification ───────────────────────────────────────────────────────

export async function createEmailVerificationToken(email: string) {
  await db.emailVerificationToken.deleteMany({ where: { email } })

  const token = generateToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 h

  await db.emailVerificationToken.create({ data: { email, token, expires } })
  return token
}

export async function verifyEmailToken(token: string) {
  const record = await db.emailVerificationToken.findUnique({ where: { token } })
  if (!record) return { error: 'Invalid token' }
  if (record.expires < new Date()) return { error: 'Token expired' }
  return { email: record.email }
}

export async function consumeEmailVerificationToken(token: string) {
  const { email, error } = await verifyEmailToken(token)
  if (error || !email) return { error: error ?? 'Invalid token' }

  await db.emailVerificationToken.delete({ where: { token } })
  return { email }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function createPasswordResetToken(email: string) {
  await db.passwordResetToken.deleteMany({ where: { email } })

  const token = generateToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 h

  await db.passwordResetToken.create({ data: { email, token, expires } })
  return token
}

export async function consumePasswordResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({ where: { token } })
  if (!record) return { error: 'Invalid or expired reset link' }
  if (record.expires < new Date()) return { error: 'Reset link has expired — request a new one' }

  await db.passwordResetToken.delete({ where: { token } })
  return { email: record.email }
}
