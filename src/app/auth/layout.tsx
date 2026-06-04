import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12 bg-[var(--bg-base)]">

      {/* Layered atmospheric background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Teal radial glow — top right */}
        <div
          className="absolute -right-48 -top-48 h-96 w-96 rounded-full opacity-[0.14] dark:opacity-[0.1]"
          style={{
            background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Teal radial glow — bottom left */}
        <div
          className="absolute -bottom-48 -left-48 h-80 w-80 rounded-full opacity-[0.08] dark:opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--border-default) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage:
              'radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)',
          }}
        />
      </div>

      {/* Logo */}
      <Link
        href="/"
        aria-label="UniFlex Global — Home"
        className="relative z-10 mb-8 block"
      >
        <span className="inline-flex h-10 items-center rounded-xl bg-white px-3 shadow-sm transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="UniFlex Global"
            width={110}
            height={34}
            priority
            className="h-8 w-auto object-contain"
          />
        </span>
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-xl shadow-[var(--brand-accent)]/5 ring-1 ring-[var(--brand-accent)]/8">
          {children}
        </div>
      </div>
    </div>
  )
}
