import Image from 'next/image'
import {
  Headset,
  Handshake,
  Truck,
  Route,
  FileText,
  ShieldCheck,
  FileCheck,
  Wallet,
  Quote,
} from 'lucide-react'
import { Reveal } from '@/components/shared/reveal'
import { revealStagger, revealStaggerItem } from '@/lib/motion'
import { logisticsConfig } from '@/config/logistics'

// ─── Stats strip ────────────────────────────────────────────────────────────

export function StatsStrip() {
  return (
    <section className="border-y border-white/10 bg-[#0d1f2d]">
      <Reveal
        as="div"
        variants={revealStagger}
        className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:gap-0 lg:py-14 xl:px-8"
      >
        {logisticsConfig.stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            as="div"
            variants={revealStaggerItem}
            className={`text-center ${i < logisticsConfig.stats.length - 1 ? 'lg:border-r lg:border-white/10' : ''}`}
          >
            <p className="font-mono text-3xl font-700 tabular-nums text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-sm text-white/45">{stat.label}</p>
          </Reveal>
        ))}
      </Reveal>
    </section>
  )
}

// ─── Services (bento) ───────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Headset,
    title: 'Dedicated dispatch',
    body: 'One dispatcher who knows your truck, your lanes, and your rate floor. No call queue.',
    variant: 'gradient' as const,
  },
  {
    icon: Handshake,
    title: 'Load booking & rate negotiation',
    body: "We work the boards and the broker relationships so you don't take the first number offered.",
    variant: 'plain' as const,
  },
  {
    icon: Truck,
    title: 'Dry van, reefer & flatbed',
    body: 'Freight matched to your trailer type and your equipment limits, every time.',
    variant: 'image' as const,
  },
  {
    icon: Route,
    title: 'OTR & regional lanes',
    body: 'Long-haul when you want the miles, regional loops when you want to be home.',
    variant: 'plain' as const,
  },
  {
    icon: FileText,
    title: 'Paperwork & invoicing',
    body: 'Rate confirmations, BOLs, and factoring-ready invoices handled same day.',
    variant: 'plain' as const,
  },
  {
    icon: ShieldCheck,
    title: 'Owner-operator support',
    body: 'Straight talk on rates, no hidden dispatch fees buried in the numbers.',
    variant: 'pattern' as const,
  },
]

export function ServicesGrid() {
  return (
    <section id="services" className="bg-[#0a1520] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 xl:px-8">
        <Reveal as="div" className="max-w-lg">
          <p className="text-xs font-700 uppercase tracking-[0.12em] text-[#29c4d9]">
            What we handle
          </p>
          <h2 className="mt-3 font-sans text-3xl font-800 tracking-tight text-white sm:text-4xl">
            Everything except the driving
          </h2>
        </Reveal>

        <Reveal
          as="div"
          variants={revealStagger}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <Reveal key={service.title} as="div" variants={revealStaggerItem}>
              <ServiceCard {...service} />
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function ServiceCard({
  icon: Icon,
  title,
  body,
  variant,
}: (typeof SERVICES)[number]) {
  if (variant === 'image') {
    return (
      <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-6">
        {/* PLACEHOLDER photography — swap for a real trailer/fleet photo */}
        <Image
          src="https://picsum.photos/seed/uniflex-trailer-yard/700/700"
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/70 to-[#0a1520]/10" />
        <div className="relative">
          <Icon className="h-6 w-6 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
          <p className="mt-3 text-lg font-700 text-white">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">{body}</p>
        </div>
      </div>
    )
  }

  const bgClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-[#0f3a44] to-[#0d1f2d]'
      : variant === 'pattern'
        ? 'bg-[#0d1f2d] [background-image:radial-gradient(circle_at_85%_15%,rgba(41,196,217,0.14),transparent_55%)]'
        : 'bg-[#0d1f2d]'

  return (
    <div
      className={`flex min-h-[220px] flex-col justify-end rounded-2xl border border-white/10 p-6 ${bgClass}`}
    >
      <Icon className="h-6 w-6 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
      <p className="mt-3 text-lg font-700 text-white">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{body}</p>
    </div>
  )
}

// ─── How it works (step flow) ───────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Tell us your truck & lanes', body: 'Equipment type, home base, and the lanes you want to run.' },
  { n: '02', title: 'We find & book the load', body: 'We work the boards and brokers, then confirm the rate with you before it’s booked.' },
  { n: '03', title: 'You haul, we handle the calls', body: 'Check calls, detention, and reschedules run through dispatch, not you.' },
  { n: '04', title: 'Get paid, fast', body: 'Invoice goes out same day, factoring-ready if you use it.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#0d1f2d] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 xl:px-8">
        <Reveal as="div" className="max-w-lg">
          <p className="text-xs font-700 uppercase tracking-[0.12em] text-[#29c4d9]">
            The process
          </p>
          <h2 className="mt-3 font-sans text-3xl font-800 tracking-tight text-white sm:text-4xl">
            From first call to first load, same week
          </h2>
        </Reveal>

        <Reveal
          as="div"
          variants={revealStagger}
          className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {STEPS.map((step, i) => (
            <Reveal key={step.n} as="div" variants={revealStaggerItem} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute top-6 left-[calc(100%+0.75rem)] hidden h-px w-[calc(100%-1.5rem)] bg-white/10 lg:block" />
              )}
              <p className="font-mono text-sm font-700 text-[#29c4d9]">{step.n}</p>
              <p className="mt-3 text-lg font-700 text-white">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{step.body}</p>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

// ─── Why choose us ───────────────────────────────────────────────────────────

const DIFFERENTIATORS = [
  { icon: ShieldCheck, title: 'No hidden dispatch fees', body: 'Our fee is disclosed up front, never buried in the rate you’re quoted.' },
  { icon: Headset, title: 'A named contact, not a queue', body: 'The person who books your load is the person who answers when you call.' },
  { icon: FileCheck, title: 'Same-day paperwork', body: 'Rate cons and BOLs turned around the day they’re needed, not the day after.' },
  { icon: Wallet, title: 'Factoring-friendly invoicing', body: 'Clean, fast invoices built to move through your factoring company without delay.' },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-[#0a1520] py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 xl:px-8">
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-800 tracking-tight text-white sm:text-4xl">
            Built by people who&apos;ve run freight, not a call center
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55">
            Dispatching owner-operators and small fleets across the Lower 48 since{' '}
            {logisticsConfig.foundedYear}. We know what a bad load feels like from the driver&apos;s seat.
          </p>
        </Reveal>

        <Reveal
          as="div"
          variants={revealStagger}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2"
        >
          {DIFFERENTIATORS.map(({ icon: Icon, title, body }) => (
            <Reveal key={title} as="div" variants={revealStaggerItem} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1daabc]/10">
                <Icon className="h-5 w-5 text-[#29c4d9]" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-700 text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{body}</p>
              </div>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
// PLACEHOLDER quote — replace with a real customer testimonial before launch.

export function Testimonial() {
  return (
    <section className="bg-[#0d1f2d] py-20 sm:py-28">
      <Reveal as="div" className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Quote className="mx-auto h-8 w-8 text-[#1daabc]/50" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-6 font-sans text-2xl font-500 leading-snug tracking-tight text-white sm:text-[1.75rem]">
          Uniflex found me backhauls I would&apos;ve deadheaded on. My weekly gross is up and
          I make one call, not ten.
        </p>
        <p className="mt-6 text-sm font-600 text-white/50">
          Marcus Webb <span className="text-white/30">·</span> Owner-Operator, Dry Van, Atlanta GA
        </p>
      </Reveal>
    </section>
  )
}
