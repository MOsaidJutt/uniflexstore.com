import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'UniFlex Store — Premium US E-Commerce'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fafaf9',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '480px',
            height: '630px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fafaf9 100%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '32px',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#1c1917' }}>
            Uni
            <span style={{ color: '#b45309' }}>Flex</span>
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#78716c',
            }}
          >
            Store
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 600,
            color: '#0c0a09',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 24px',
            maxWidth: '640px',
            position: 'relative',
          }}
        >
          Premium shopping for every part of your life
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '22px',
            color: '#44403c',
            margin: '0 0 48px',
            lineHeight: 1.5,
            position: 'relative',
          }}
        >
          Electronics · Fashion · Beauty · Toys
        </p>

        {/* CTA pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1c1917',
            color: '#fafaf9',
            padding: '14px 28px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 500,
            position: 'relative',
          }}
        >
          uniflexstore.com
        </div>
      </div>
    ),
    { ...size }
  )
}
