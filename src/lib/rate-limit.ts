import { headers } from 'next/headers'

type Entry = { count: number; resetAt: number }

// In-memory store — works for single-instance deployments.
// Replace with Upstash Redis for multi-instance / serverless.
const store = new Map<string, Entry>()

function check(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

async function getIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  )
}

/** 5 login attempts per 15 minutes per IP */
export async function checkLoginRate(): Promise<boolean> {
  const ip = await getIp()
  return check(`login:${ip}`, 5, 15 * 60 * 1000)
}

/** 3 password reset requests per hour per email */
export async function checkPasswordResetRate(email: string): Promise<boolean> {
  return check(`reset:${email}`, 3, 60 * 60 * 1000)
}

/** 10 register attempts per hour per IP */
export async function checkRegisterRate(): Promise<boolean> {
  const ip = await getIp()
  return check(`register:${ip}`, 10, 60 * 60 * 1000)
}

/** 60 search suggestion requests per minute per IP */
export async function checkSearchRate(): Promise<boolean> {
  const ip = await getIp()
  return check(`search:${ip}`, 60, 60 * 1000)
}
