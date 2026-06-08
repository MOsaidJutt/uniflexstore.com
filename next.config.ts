// To enable Sentry, uncomment the import and withSentryConfig wrapper below.
// Requires: npm install @sentry/nextjs
// import { withSentryConfig } from '@sentry/nextjs'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // OAuth provider avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      // Brand authorization logos (seed / dev — production will use Cloudinary)
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'www.fanvil.com' },
      { protocol: 'https', hostname: 'www.yealink.com' },
      // Certificate placeholders (dev only)
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },

  async redirects() {
    return [
      { source: '/deals', destination: '/products', permanent: false },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // OAuth avatar hostnames + Stripe receipt images
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://platform-lookaside.fbsbx.com https://q.stripe.com https://upload.wikimedia.org https://www.fanvil.com https://www.yealink.com https://placehold.co",
              "connect-src 'self' https://api.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

// Wrap with Sentry once @sentry/nextjs is installed:
// export default withSentryConfig(nextConfig, {
//   org: 'your-sentry-org',
//   project: 'uniflexstore',
//   silent: true,
//   widenClientFileUpload: true,
//   hideSourceMaps: true,
//   disableLogger: true,
// })

export default nextConfig
