import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@uniflexstore.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Shared helpers ───────────────────────────────────────────────────

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>UniFlex Store</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f7;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f4f7">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:#1a3a4a;border-radius:16px 16px 0 0;padding:28px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">
                      UniFlex<span style="color:#1daabc">·</span>Store
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-weight:600;color:#7eafc2;letter-spacing:1px;text-transform:uppercase">
                      Order Update
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f4f7;border-radius:0 0 16px 16px;padding:20px 32px">
              <p style="margin:0;font-size:11px;color:#7e9aaa;text-align:center;line-height:1.6">
                UniFlex Store · Orders available at
                <a href="${APP_URL}/orders" style="color:#1daabc;text-decoration:none"> ${APP_URL}/orders</a>
                <br />
                You're receiving this because you placed an order. Questions?
                <a href="mailto:support@uniflexstore.com" style="color:#1daabc;text-decoration:none"> support@uniflexstore.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

type OrderItem = {
  product: { name: string; images: { url: string }[] }
  variant: { name: string; value: string } | null
  quantity: number
  price: number | string | { toNumber(): number }
}

type OrderLike = {
  id: string
  subtotal: number | string | { toNumber(): number }
  shippingCost: number | string | { toNumber(): number }
  tax: number | string | { toNumber(): number }
  discount: number | string | { toNumber(): number }
  total: number | string | { toNumber(): number }
  shippingMethod: string | null
  couponCode: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  address: {
    line1: string; line2?: string | null
    city: string; state: string; postalCode: string
  } | null
  shippingAddress?: unknown
  items: OrderItem[]
}

function n(v: number | string | { toNumber(): number }): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return parseFloat(v)
  return v.toNumber()
}

function addrLines(order: OrderLike): string {
  const a = order.address ?? (order.shippingAddress as Record<string, string> | null)
  if (!a) return ''
  const r = a as Record<string, string>
  const name = (r.firstName && r.lastName) ? `<strong>${r.firstName} ${r.lastName}</strong><br />` : ''
  const l2 = r.line2 ? `${r.line2}<br />` : ''
  return `${name}${r.line1}<br />${l2}${r.city}, ${r.state} ${r.postalCode}<br />United States`
}

const SHIPPING_LABEL: Record<string, string> = {
  standard:  'USPS Standard (3–5 business days)',
  expedited: 'UPS 2-Day',
  overnight: 'FedEx Overnight',
}

function itemsTable(items: OrderItem[]): string {
  const rows = items.map((item) => {
    const imgUrl = item.product.images[0]?.url
    const imgCell = imgUrl
      ? `<td style="width:56px;padding:12px 12px 12px 0;border-bottom:1px solid #eef3f6;vertical-align:top">
           <img src="${imgUrl}" width="48" height="48" alt="${item.product.name}"
                style="width:48px;height:48px;object-fit:cover;border-radius:8px;display:block" />
         </td>`
      : `<td style="width:56px;padding:12px 12px 12px 0;border-bottom:1px solid #eef3f6;vertical-align:top">
           <div style="width:48px;height:48px;background:#eef3f6;border-radius:8px"></div>
         </td>`

    return `
    <tr>
      ${imgCell}
      <td style="padding:12px 0;border-bottom:1px solid #eef3f6;vertical-align:top">
        <p style="margin:0;font-size:14px;font-weight:600;color:#0d1f2d">${item.product.name}</p>
        ${item.variant ? `<p style="margin:2px 0 0;font-size:12px;color:#5d7d8e">${item.variant.name}: ${item.variant.value}</p>` : ''}
        <p style="margin:2px 0 0;font-size:12px;color:#5d7d8e">Qty: ${item.quantity}</p>
      </td>
      <td style="padding:12px 0 12px 16px;border-bottom:1px solid #eef3f6;vertical-align:top;text-align:right;white-space:nowrap">
        <span style="font-size:14px;font-weight:700;color:#0d1f2d;font-variant-numeric:tabular-nums">
          ${formatUSD(n(item.price) * item.quantity)}
        </span>
      </td>
    </tr>`
  }).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #eef3f6">
      ${rows}
    </table>`
}

function totalsBlock(order: OrderLike): string {
  const discountRow = n(order.discount) > 0
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#059669">
          Discount${order.couponCode ? ` (${order.couponCode})` : ''}
        </td>
        <td style="padding:4px 0;font-size:13px;color:#059669;text-align:right;font-variant-numeric:tabular-nums">
          −${formatUSD(n(order.discount))}
        </td>
       </tr>`
    : ''

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#f8fafb;border-radius:10px;padding:16px;margin-top:20px">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#37586f">Subtotal</td>
        <td style="padding:4px 0;font-size:13px;color:#37586f;text-align:right;font-variant-numeric:tabular-nums">${formatUSD(n(order.subtotal))}</td>
      </tr>
      ${discountRow}
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#37586f">Shipping</td>
        <td style="padding:4px 0;font-size:13px;color:#37586f;text-align:right;font-variant-numeric:tabular-nums">
          ${n(order.shippingCost) === 0 ? 'Free' : formatUSD(n(order.shippingCost))}
        </td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#37586f">Tax</td>
        <td style="padding:4px 0;font-size:13px;color:#37586f;text-align:right;font-variant-numeric:tabular-nums">${formatUSD(n(order.tax))}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0d1f2d;border-top:1px solid #dce8ed">Total</td>
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0d1f2d;border-top:1px solid #dce8ed;text-align:right;font-variant-numeric:tabular-nums">${formatUSD(n(order.total))}</td>
      </tr>
    </table>`
}

function ctaButton(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1daabc;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.1px">${label}</a>`
}

// ─── Auth emails ──────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/verify-email?token=${token}`
  await resend.emails.send({
    from: FROM, to: email,
    subject: 'Verify your UniFlex Store account',
    html: emailWrapper(`
      <p style="font-size:24px;font-weight:700;color:#0d1f2d;margin:0 0 8px">Verify your email</p>
      <p style="color:#5d7d8e;margin:0 0 32px;font-size:15px;line-height:1.6">
        Click the button below to confirm your email address and activate your account.
        This link expires in 24 hours.
      </p>
      ${ctaButton('Verify email address', url)}
      <p style="color:#a0b8c4;font-size:12px;margin:32px 0 0">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/reset-password?token=${token}`
  await resend.emails.send({
    from: FROM, to: email,
    subject: 'Reset your UniFlex Store password',
    html: emailWrapper(`
      <p style="font-size:24px;font-weight:700;color:#0d1f2d;margin:0 0 8px">Reset your password</p>
      <p style="color:#5d7d8e;margin:0 0 32px;font-size:15px;line-height:1.6">
        We received a request to reset your password. Click the button below to choose a new one.
        This link expires in 1 hour.
      </p>
      ${ctaButton('Reset password', url)}
      <p style="color:#a0b8c4;font-size:12px;margin:32px 0 0">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    `),
  })
}

// ─── Order confirmation ───────────────────────────────────────────────

interface OrderConfirmationParams {
  to: string
  customerName?: string
  order: OrderLike
}

export async function sendOrderConfirmationEmail({ to, customerName, order }: OrderConfirmationParams) {
  const orderUrl  = `${APP_URL}/orders/${order.id}`
  const shortId   = order.id.slice(-8).toUpperCase()
  const greeting  = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hi there,'
  const carrier   = order.shippingMethod ? (SHIPPING_LABEL[order.shippingMethod] ?? order.shippingMethod) : 'Standard'
  const addrHtml  = addrLines(order)

  await resend.emails.send({
    from: FROM, to,
    subject: `Order confirmed — #${shortId}`,
    html: emailWrapper(`
      <!-- Status pill -->
      <div style="display:inline-block;background:#e0f9f4;border-radius:20px;padding:5px 14px;margin-bottom:20px">
        <span style="font-size:12px;font-weight:700;color:#059669;letter-spacing:0.5px;text-transform:uppercase">
          Order confirmed
        </span>
      </div>

      <p style="font-size:26px;font-weight:700;color:#0d1f2d;margin:0 0 6px;line-height:1.2">
        Thanks for your order!
      </p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 6px">${greeting}</p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 28px;line-height:1.6">
        We've received order <strong style="color:#0d1f2d">#${shortId}</strong> and
        we're getting it ready. You'll receive another email when it ships.
      </p>

      <!-- Items -->
      <p style="font-size:13px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 4px">
        Items ordered
      </p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}

      <!-- Shipping -->
      ${addrHtml ? `
      <div style="margin-top:24px;padding:16px;background:#f8fafb;border-radius:10px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px">
          Shipping to
        </p>
        <p style="margin:0;font-size:14px;color:#37586f;line-height:1.7">${addrHtml}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#7eafc2">via ${carrier}</p>
      </div>` : ''}

      <div style="margin-top:28px">
        ${ctaButton('View order', orderUrl)}
      </div>
    `),
  })
}

// ─── Shipping update ──────────────────────────────────────────────────

interface ShippingUpdateParams {
  to: string
  customerName?: string
  order: OrderLike
  trackingNumber?: string
  trackingUrl?: string
}

export async function sendShippingUpdateEmail({
  to, customerName, order, trackingNumber, trackingUrl,
}: ShippingUpdateParams) {
  const shortId  = order.id.slice(-8).toUpperCase()
  const orderUrl = `${APP_URL}/orders/${order.id}`
  const greeting = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hi there,'
  const carrier  = order.shippingMethod ? (SHIPPING_LABEL[order.shippingMethod] ?? order.shippingMethod) : 'Standard'

  // Prefer explicit params; fall back to values stored on the order row
  const tn  = trackingNumber ?? order.trackingNumber ?? null
  const tu  = trackingUrl    ?? order.trackingUrl    ?? null
  const trackingBlock = tn
    ? `<div style="margin-top:20px;padding:16px;background:#e8f8fa;border-radius:10px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px">
          Tracking number
        </p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1daabc;font-family:monospace">${tn}</p>
        ${tu ? `<p style="margin:8px 0 0"><a href="${tu}" style="font-size:13px;color:#1daabc;text-decoration:none">Track your package →</a></p>` : ''}
      </div>`
    : ''

  await resend.emails.send({
    from: FROM, to,
    subject: `Your order has shipped — #${shortId}`,
    html: emailWrapper(`
      <!-- Status pill -->
      <div style="display:inline-block;background:#ede9fe;border-radius:20px;padding:5px 14px;margin-bottom:20px">
        <span style="font-size:12px;font-weight:700;color:#7c3aed;letter-spacing:0.5px;text-transform:uppercase">
          Order shipped
        </span>
      </div>

      <p style="font-size:26px;font-weight:700;color:#0d1f2d;margin:0 0 6px;line-height:1.2">
        Your order is on its way!
      </p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 6px">${greeting}</p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 20px;line-height:1.6">
        Order <strong style="color:#0d1f2d">#${shortId}</strong> has been handed off to
        <strong style="color:#0d1f2d">${carrier}</strong> and is heading your way.
      </p>

      ${trackingBlock}

      <!-- Items recap -->
      <p style="font-size:13px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px;margin:24px 0 4px">
        What's in the box
      </p>
      ${itemsTable(order.items)}

      <div style="margin-top:28px">
        ${ctaButton('Track order', orderUrl)}
      </div>
    `),
  })
}

// ─── Cancellation ─────────────────────────────────────────────────────

interface CancellationParams {
  to: string
  customerName?: string
  order: OrderLike
}

export async function sendCancellationEmail({ to, customerName, order }: CancellationParams) {
  const shortId  = order.id.slice(-8).toUpperCase()
  const shopUrl  = `${APP_URL}/products`
  const greeting = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hi there,'

  await resend.emails.send({
    from: FROM, to,
    subject: `Order cancelled — #${shortId}`,
    html: emailWrapper(`
      <!-- Status pill -->
      <div style="display:inline-block;background:#fee2e2;border-radius:20px;padding:5px 14px;margin-bottom:20px">
        <span style="font-size:12px;font-weight:700;color:#dc2626;letter-spacing:0.5px;text-transform:uppercase">
          Order cancelled
        </span>
      </div>

      <p style="font-size:26px;font-weight:700;color:#0d1f2d;margin:0 0 6px;line-height:1.2">
        Your order has been cancelled
      </p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 6px">${greeting}</p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 20px;line-height:1.6">
        Order <strong style="color:#0d1f2d">#${shortId}</strong> has been successfully cancelled.
        If a charge was made, it will be refunded to your original payment method within
        5–10 business days.
      </p>

      <!-- Items recap -->
      <p style="font-size:13px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 4px">
        Cancelled items
      </p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}

      <p style="font-size:13px;color:#5d7d8e;margin:24px 0 20px;line-height:1.6">
        Changed your mind? We'd love to have you back.
      </p>
      ${ctaButton('Continue shopping', shopUrl)}
    `),
  })
}

// ─── Refund confirmation ──────────────────────────────────────────────

interface RefundParams {
  to: string
  customerName?: string
  order: OrderLike
  refundAmount?: number
}

export async function sendRefundEmail({ to, customerName, order, refundAmount }: RefundParams) {
  const shortId  = order.id.slice(-8).toUpperCase()
  const orderUrl = `${APP_URL}/orders/${order.id}`
  const greeting = customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hi there,'
  const amount   = refundAmount ?? n(order.total)

  await resend.emails.send({
    from: FROM, to,
    subject: `Refund processed — #${shortId}`,
    html: emailWrapper(`
      <!-- Status pill -->
      <div style="display:inline-block;background:#f3f4f6;border-radius:20px;padding:5px 14px;margin-bottom:20px">
        <span style="font-size:12px;font-weight:700;color:#374151;letter-spacing:0.5px;text-transform:uppercase">
          Refund issued
        </span>
      </div>

      <p style="font-size:26px;font-weight:700;color:#0d1f2d;margin:0 0 6px;line-height:1.2">
        Your refund is on its way
      </p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 6px">${greeting}</p>
      <p style="font-size:15px;color:#5d7d8e;margin:0 0 20px;line-height:1.6">
        We've processed a refund of
        <strong style="color:#0d1f2d">${formatUSD(amount)}</strong> for order
        <strong style="color:#0d1f2d">#${shortId}</strong>. Please allow 5–10 business
        days for the funds to appear on your statement, depending on your bank.
      </p>

      <!-- Refund amount callout -->
      <div style="padding:20px 24px;background:#f8fafb;border-radius:12px;border-left:4px solid #1daabc;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#37586f;text-transform:uppercase;letter-spacing:0.8px">
          Refund amount
        </p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#0d1f2d;font-variant-numeric:tabular-nums">
          ${formatUSD(amount)}
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#7eafc2">
          Returned to your original payment method
        </p>
      </div>

      <p style="font-size:13px;color:#5d7d8e;margin:0 0 20px;line-height:1.6">
        Questions about your refund?
        <a href="mailto:support@uniflexstore.com" style="color:#1daabc">Contact our support team</a>.
      </p>
      ${ctaButton('View order', orderUrl)}
    `),
  })
}

// ─── Logistics lead notification ───────────────────────────────────────

interface LogisticsLeadParams {
  name: string
  phone: string
  email: string
  truckType: string
  route?: string
  message?: string
}

// PLACEHOLDER recipient — set LOGISTICS_LEAD_EMAIL in env before launch
const LOGISTICS_LEAD_TO = process.env.LOGISTICS_LEAD_EMAIL ?? 'dispatch@uniflexlogistics.com'

export async function sendLogisticsLeadEmail(lead: LogisticsLeadParams) {
  const name = escapeHtml(lead.name)
  const phone = escapeHtml(lead.phone)
  const email = escapeHtml(lead.email)
  const truckType = escapeHtml(lead.truckType)
  const route = lead.route ? escapeHtml(lead.route) : undefined
  const message = lead.message ? escapeHtml(lead.message) : undefined

  await resend.emails.send({
    from: FROM,
    to: LOGISTICS_LEAD_TO,
    replyTo: lead.email,
    subject: `New quote request — ${name} (${truckType})`,
    html: emailWrapper(`
      <p style="font-size:24px;font-weight:700;color:#0d1f2d;margin:0 0 20px">New logistics lead</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#f8fafb;border-radius:10px;padding:4px 20px">
        <tr><td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:13px;color:#5d7d8e;width:120px">Name</td>
            <td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:#0d1f2d">${name}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:13px;color:#5d7d8e">Phone</td>
            <td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:#0d1f2d">${phone}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:13px;color:#5d7d8e">Email</td>
            <td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:#0d1f2d">${email}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:13px;color:#5d7d8e">Truck type</td>
            <td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:#0d1f2d">${truckType}</td></tr>
        ${route ? `
        <tr><td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:13px;color:#5d7d8e">Home base / lanes</td>
            <td style="padding:12px 0;border-bottom:1px solid #eef3f6;font-size:14px;font-weight:600;color:#0d1f2d">${route}</td></tr>` : ''}
        ${message ? `
        <tr><td style="padding:12px 0;font-size:13px;color:#5d7d8e;vertical-align:top">Message</td>
            <td style="padding:12px 0;font-size:14px;color:#0d1f2d">${message}</td></tr>` : ''}
      </table>
      <p style="color:#a0b8c4;font-size:12px;margin:24px 0 0">
        Submitted via uniflexstore.com/logistics — reply directly to this email to respond to ${name}.
      </p>
    `),
  })
}
