// Browser-side Sentry config — disabled until @sentry/nextjs is installed.
// To enable: npm install @sentry/nextjs, then restore the code below.
//
// import * as Sentry from '@sentry/nextjs'
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   enabled: process.env.NODE_ENV === 'production',
//   tracesSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0.02,
//   integrations: [
//     Sentry.replayIntegration({ maskAllText: true, blockAllMedia: false }),
//   ],
//   denyUrls: [/localhost/, /127\.0\.0\.1/],
//   ignoreErrors: [
//     'ResizeObserver loop limit exceeded',
//     'Non-Error promise rejection captured',
//     /^(ChunkLoadError|Network request failed)/,
//   ],
// })

export {}
