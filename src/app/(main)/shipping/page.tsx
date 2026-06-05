import type { Metadata } from 'next'
import { LegalPage, Section } from '@/components/shared/legal-page'
import { siteConfig } from '@/config/site'
import { JsonLd } from '@/components/shared/json-ld'

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description:
    'Free shipping on orders $49+. Free 30-day returns. Learn about UniFlex Global shipping methods, delivery times, and return policy.',
  alternates: { canonical: `${siteConfig.url}/shipping` },
}

export default function ShippingPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does shipping cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard shipping is free on orders $49 or more. Orders under $49 ship for $5.99. Expedited (2–3 days) is $9.99 and Overnight is $24.99.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does delivery take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard shipping takes 5–7 business days. Expedited takes 2–3 business days. Overnight arrives the next business day when ordered before 2 PM ET.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your return policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept returns within 30 days of delivery. Items must be in original, unused condition with original packaging. Electronics must be unopened or defective. Return shipping is free.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I start a return?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Log in to your account, go to Orders, select the order, and click Return Request. Or email support@uniflexstore.com with your order number.',
        },
      },
    ],
  }

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <LegalPage title="Shipping & Returns" lastUpdated="June 2026">
        <Section title="Shipping Methods &amp; Costs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="py-2 pr-4 font-700 text-[var(--text-primary)]">Method</th>
                  <th className="py-2 pr-4 font-700 text-[var(--text-primary)]">Delivery time</th>
                  <th className="py-2 font-700 text-[var(--text-primary)]">Cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Standard (USPS)', '5–7 business days', 'Free on orders $49+ / $5.99 under $49'],
                  ['Expedited (UPS 2-Day)', '2–3 business days', '$9.99'],
                  ['Overnight (FedEx)', 'Next business day', '$24.99 (order by 2 PM ET)'],
                ].map(([method, time, cost]) => (
                  <tr key={method} className="border-b border-[var(--border-subtle)]">
                    <td className="py-2.5 pr-4">{method}</td>
                    <td className="py-2.5 pr-4">{time}</td>
                    <td className="py-2.5">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            We ship within the <strong>contiguous United States</strong>. Alaska and Hawaii orders
            may incur additional charges and longer delivery windows — you&apos;ll see the exact
            cost at checkout. We do not currently ship internationally or to US territories.
          </p>
          <p>
            Orders placed <strong>before 2 PM ET on business days</strong> typically ship same day.
            Orders placed after 2 PM or on weekends/holidays ship the next business day.
          </p>
        </Section>

        <Section title="Order Tracking">
          <p>
            Once your order ships you&apos;ll receive a confirmation email with your tracking
            number. Track your package via the carrier&apos;s website or from the{' '}
            <a href="/orders" className="underline-offset-2 hover:underline">
              Orders
            </a>{' '}
            page in your account.
          </p>
        </Section>

        <Section title="Returns &amp; Exchanges">
          <p>
            We offer <strong>free 30-day returns</strong> on most items, no questions asked.
          </p>
          <p>
            <strong>Eligibility:</strong>
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Item must be returned within 30 days of the delivery date</li>
            <li>Item must be in original, unused condition with all original packaging</li>
            <li>Electronics must be <strong>unopened</strong> or <strong>defective</strong></li>
            <li>Beauty products must be <strong>unopened</strong> for hygiene reasons</li>
            <li>Items marked &ldquo;Final Sale&rdquo; are not eligible for return</li>
          </ul>
          <p>
            <strong>Non-returnable items:</strong> hazardous materials, perishables, digital
            downloads, personalized items, and gift cards.
          </p>
        </Section>

        <Section title="How to Start a Return">
          <ol className="ml-4 list-decimal space-y-2">
            <li>
              Log in and go to{' '}
              <a href="/orders" className="underline-offset-2 hover:underline">
                My Orders
              </a>
              .
            </li>
            <li>Select the order and click <strong>Return Request</strong>.</li>
            <li>Choose the item(s) and select a return reason.</li>
            <li>
              We&apos;ll email you a prepaid return shipping label within 1 business day.
            </li>
            <li>Pack the item securely and drop it off at the carrier location on the label.</li>
          </ol>
          <p>
            Alternatively, email{' '}
            <a href="mailto:support@uniflexstore.com" className="underline-offset-2 hover:underline">
              support@uniflexstore.com
            </a>{' '}
            with your order number and reason.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            Once we receive and inspect your return (usually 2–5 business days after arrival),
            we&apos;ll issue a refund to your original payment method. Refunds typically appear
            within <strong>5–10 business days</strong> depending on your bank.
          </p>
          <p>
            <strong>Original shipping costs</strong> are refunded only if the return is due to
            our error (wrong item, defective product). Standard shipping is free on qualifying
            orders, so this is rarely applicable.
          </p>
        </Section>

        <Section title="Damaged or Defective Items">
          <p>
            If your item arrives damaged or defective, email us within <strong>7 days</strong> of
            delivery at{' '}
            <a href="mailto:support@uniflexstore.com" className="underline-offset-2 hover:underline">
              support@uniflexstore.com
            </a>{' '}
            with a photo. We&apos;ll arrange a replacement or full refund at no cost to you.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about your shipment or return? We&apos;re here to help.
            <br />
            Email:{' '}
            <a href="mailto:support@uniflexstore.com" className="underline-offset-2 hover:underline">
              support@uniflexstore.com
            </a>
            <br />
            Response time: within 1 business day (Mon–Fri, 9 AM–6 PM ET)
          </p>
        </Section>
      </LegalPage>
    </>
  )
}
