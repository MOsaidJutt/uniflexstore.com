export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--bg-base)]"
    >
      {/* Logo with breathing pulse */}
      <div className="relative flex items-center justify-center">
        {/* Soft radial glow */}
        <span
          className="absolute h-44 w-44 rounded-full bg-[var(--brand-accent)] opacity-[0.08] blur-2xl"
          aria-hidden="true"
        />
        {/* Pulse ring */}
        <span
          className="absolute h-32 w-32 animate-ping rounded-full bg-[var(--brand-accent)] opacity-[0.07]"
          style={{ animationDuration: '1.8s' }}
          aria-hidden="true"
        />
        {/* Logo image — transparent PNG, no white container */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="UniFlex Global"
          width={128}
          height={128}
          className="relative h-32 w-32 object-contain drop-shadow-sm"
          style={{ animation: 'logo-breathe 2.4s ease-in-out infinite' }}
        />
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]"
            style={{
              animation: 'dots-bounce 1s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
