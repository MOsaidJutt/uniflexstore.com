import type { Metadata } from 'next'
import { JsonLd } from '@/components/shared/json-ld'
import { siteConfig } from '@/config/site'
import { logisticsConfig } from '@/config/logistics'
import { SiteHeader } from '@/components/logistics/site-header'
import { SiteFooter } from '@/components/logistics/site-footer'
import { HeroSection } from '@/components/logistics/hero-section'
import {
  StatsStrip,
  ServicesGrid,
  HowItWorks,
  WhyChooseUs,
  Testimonial,
} from '@/components/logistics/logistics-sections'
import { QuoteForm } from '@/components/logistics/quote-form'

const PAGE_URL = `${siteConfig.url.replace(/\/$/, '')}/logistics`

export const metadata: Metadata = {
  title: `${logisticsConfig.companyName} — Truck Dispatch Services`,
  description:
    'Dedicated truck dispatch for owner-operators and small fleets. We book the loads, negotiate the rates, and handle the paperwork so you keep driving.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    title: `${logisticsConfig.companyName} — Truck Dispatch Services`,
    description:
      'Dedicated truck dispatch for owner-operators and small fleets across the Lower 48.',
    siteName: logisticsConfig.companyName,
  },
  keywords: [
    'truck dispatch service',
    'owner operator dispatch',
    'freight dispatcher',
    'dry van dispatch',
    'reefer dispatch',
    'flatbed dispatch',
    'load booking',
    'trucking dispatch company',
  ],
}

export default function LogisticsPage() {
  const { address } = logisticsConfig

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: logisticsConfig.companyName,
    description:
      'Truck dispatch service for owner-operators and small fleets, handling load booking, rate negotiation, and paperwork.',
    url: PAGE_URL,
    telephone: logisticsConfig.phone,
    email: logisticsConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.line1,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: 'US',
    },
    areaServed: logisticsConfig.serviceArea,
    priceRange: '$$',
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a1520]">
      <JsonLd data={localBusinessJsonLd} />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <HeroSection />
        <StatsStrip />
        <ServicesGrid />
        <HowItWorks />
        <WhyChooseUs />
        <Testimonial />
        <QuoteForm />
      </main>
      <SiteFooter />
    </div>
  )
}
