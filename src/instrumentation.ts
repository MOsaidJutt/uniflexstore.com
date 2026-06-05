// Next.js instrumentation hook — runs once per runtime on cold start.
// Sentry is opt-in: install @sentry/nextjs, then uncomment the lines below.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Once @sentry/nextjs is installed, add this to capture React render errors:
// export { onRequestError } from '@sentry/nextjs'
