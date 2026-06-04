'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { signIn, signOut, auth } from '@/auth'
import { db } from '@/server/db'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'
import {
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  createPasswordResetToken,
  consumePasswordResetToken,
} from '@/lib/tokens'
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
} from '@/lib/validations/auth'
import {
  checkLoginRate,
  checkRegisterRate,
  checkPasswordResetRate,
} from '@/lib/rate-limit'
import { AuthError } from 'next-auth'

export type ActionState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string>
} | undefined

/** Ensures callbackUrl is a safe internal relative path. */
function sanitizeCallbackUrl(raw: FormDataEntryValue | null): string {
  const url = typeof raw === 'string' ? raw : null
  if (url && url.startsWith('/') && !url.startsWith('//')) return url
  return '/account'
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await checkRegisterRate())) {
    return { error: 'Too many requests. Please wait a moment and try again.' }
  }

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const fieldErrors: Record<string, string> = {}
    for (const [field, errs] of Object.entries(flat.fieldErrors)) {
      if (errs?.[0]) fieldErrors[field] = errs[0]
    }
    if (flat.formErrors[0]) fieldErrors._form = flat.formErrors[0]
    return { fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { fieldErrors: { email: 'An account with this email already exists' } }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, passwordHash } })

  try {
    const token = await createEmailVerificationToken(email)
    await sendVerificationEmail(email, token)
  } catch {
    return {
      success:
        'Account created! We had trouble sending the verification email — contact support if needed.',
    }
  }

  return { success: 'Account created! Check your email to verify your address.' }
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmailAction(token: string): Promise<ActionState> {
  const { email, error } = await consumeEmailVerificationToken(token)
  if (error || !email) return { error: error ?? 'Invalid token' }

  await db.user.update({ where: { email }, data: { emailVerified: new Date() } })
  return { success: 'Email verified! You can now sign in.' }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await checkLoginRate())) {
    return { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' }
  }

  const callbackUrl = sanitizeCallbackUrl(formData.get('callbackUrl'))
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe')

  try {
    await signIn('credentials', {
      email,
      password,
      rememberMe: rememberMe ? 'true' : 'false',
      redirect: false,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.message?.includes('EMAIL_NOT_VERIFIED')) {
        return { error: 'Please verify your email before signing in. Check your inbox.' }
      }
      return { error: 'Invalid email or password' }
    }
    throw err
  }

  redirect(callbackUrl)
}

// ─── OAuth Sign In ─────────────────────────────────────────────────────────────

export async function oauthSignIn(provider: 'google' | 'github' | 'facebook') {
  await signIn(provider, { redirectTo: '/account' })
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { fieldErrors: { email: 'Enter a valid email address' } }
  }

  const { email } = parsed.data

  if (!(await checkPasswordResetRate(email))) {
    return { success: 'If an account exists for that email, a reset link is on its way.' }
  }

  // Always return success — prevent email enumeration
  const user = await db.user.findUnique({ where: { email } })
  if (user) {
    try {
      const token = await createPasswordResetToken(email)
      await sendPasswordResetEmail(email, token)
    } catch {
      // Silent — don't leak whether email exists
    }
  }

  return { success: 'If an account exists for that email, a reset link is on its way.' }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    token: formData.get('token'),
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const fieldErrors: Record<string, string> = {}
    for (const [field, errs] of Object.entries(flat.fieldErrors)) {
      if (errs?.[0]) fieldErrors[field] = errs[0]
    }
    if (flat.formErrors[0]) fieldErrors._form = flat.formErrors[0]
    return { fieldErrors }
  }

  const { token, password } = parsed.data
  const { email, error } = await consumePasswordResetToken(token)
  if (error || !email) return { error: error ?? 'Invalid reset link' }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { error: 'Account not found' }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.update({ where: { email }, data: { passwordHash } })

  return { success: 'Password updated! You can now sign in with your new password.' }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfileAction(
  userId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Verify the caller owns this account
  const session = await auth()
  if (!session?.user?.id || session.user.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const fieldErrors: Record<string, string> = {}
    for (const [field, errs] of Object.entries(flat.fieldErrors)) {
      if (errs?.[0]) fieldErrors[field] = errs[0]
    }
    return { fieldErrors }
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  })

  revalidatePath('/account')
  return { success: 'Profile updated' }
}
