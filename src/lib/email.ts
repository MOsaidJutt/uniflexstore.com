import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@uniflexstore.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your UniFlex Store account',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
        <p style="font-size:24px;font-weight:600;color:#1c1917;margin:0 0 8px">Verify your email</p>
        <p style="color:#78716c;margin:0 0 32px">Click the button below to confirm your email address and activate your account. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:500">Verify email address</a>
        <p style="color:#a8a29e;font-size:12px;margin:32px 0 0">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your UniFlex Store password',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
        <p style="font-size:24px;font-weight:600;color:#1c1917;margin:0 0 8px">Reset your password</p>
        <p style="color:#78716c;margin:0 0 32px">We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:500">Reset password</a>
        <p style="color:#a8a29e;font-size:12px;margin:32px 0 0">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}
