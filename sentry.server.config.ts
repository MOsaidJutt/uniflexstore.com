// Server-side Sentry config (Node.js runtime) — disabled until @sentry/nextjs is installed.
// To enable: npm install @sentry/nextjs, then restore the code below.
//
// import * as Sentry from '@sentry/nextjs'
// Sentry.init({
//   dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
//   enabled: process.env.NODE_ENV === 'production',
//   tracesSampleRate: 0.1,
//   beforeSend(event: Sentry.Event) {
//     if (event.request?.url?.includes('/api/stripe/webhook')) {
//       event.tags = { ...event.tags, critical: 'true', subsystem: 'stripe-webhook' }
//     }
//     return event
//   },
// })

export {}
