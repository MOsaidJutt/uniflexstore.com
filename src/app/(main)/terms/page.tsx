import type { Metadata } from 'next'
import { LegalPage, Section } from '@/components/shared/legal-page'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing your use of UniFlex Global.',
  alternates: { canonical: `${siteConfig.url}/terms` },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="June 2026">
      <Section title="1. Agreement to Terms">
        <p>
          By accessing or using uniflexstore.com (&ldquo;Site&rdquo;) you agree to be bound by
          these Terms of Service and our{' '}
          <a href="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </a>
          . If you do not agree, do not use the Site.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction) and
          legally capable of entering into contracts to use this Site. By using the Site you
          represent that you meet these requirements.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <p>
          When you create an account you agree to: provide accurate, current, and complete
          information; maintain the security of your password; notify us immediately of any
          unauthorized account use; and accept responsibility for all activities occurring under
          your account.
        </p>
      </Section>

      <Section title="4. Products and Pricing">
        <p>
          We reserve the right to modify or discontinue products without notice. Prices are in US
          dollars and subject to change. We are not liable if a product is unavailable after you
          place an order — in that case we will issue a full refund.
        </p>
        <p>
          Typographical errors in price or product description do not constitute binding offers.
          We reserve the right to cancel orders placed based on erroneous pricing and will notify
          you promptly.
        </p>
      </Section>

      <Section title="5. Orders and Payment">
        <p>
          Your order constitutes an offer to purchase. We may accept or reject it. Acceptance
          occurs when we send an order confirmation email. Payment is processed via Stripe; by
          placing an order you authorize the charge to your selected payment method.
        </p>
        <p>
          Sales tax is calculated and collected based on your shipping destination and applicable
          US state laws.
        </p>
      </Section>

      <Section title="6. Shipping and Delivery">
        <p>
          See our{' '}
          <a href="/shipping" className="underline-offset-2 hover:underline">
            Shipping &amp; Returns Policy
          </a>{' '}
          for full details. Title and risk of loss pass to you upon delivery to the carrier.
          Delivery times are estimates only.
        </p>
      </Section>

      <Section title="7. Returns and Refunds">
        <p>
          See our{' '}
          <a href="/shipping" className="underline-offset-2 hover:underline">
            Shipping &amp; Returns Policy
          </a>
          . All returns must comply with that policy to receive a refund or exchange.
        </p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>
          All Site content — text, graphics, logos, images, and software — is the property of
          UniFlex Global or its licensors and is protected by applicable intellectual property
          laws. You may not reproduce, distribute, modify, or create derivative works without our
          prior written consent.
        </p>
      </Section>

      <Section title="9. Authorized Reseller Status">
        <p>
          We represent only authorizations that are current and verifiable. Manufacturer
          authorizations are subject to change. Displaying a brand&apos;s authorization on this
          site does not imply endorsement by that brand of our specific products or
          representations beyond the scope of the authorization letter.
        </p>
      </Section>

      <Section title="10. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Violate applicable laws or regulations</li>
          <li>Attempt unauthorized access to our systems</li>
          <li>Scrape, crawl, or harvest data without permission</li>
          <li>Submit false reviews, fraudulent orders, or chargebacks in bad faith</li>
          <li>Use our AI assistant to attempt prompt injection or extract system data</li>
          <li>Impersonate another person or entity</li>
        </ul>
      </Section>

      <Section title="11. Disclaimer of Warranties">
        <p>
          THE SITE AND PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.
        </p>
      </Section>

      <Section title="12. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, UNIFLEX GLOBAL SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE
          SITE OR PRODUCTS. OUR AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE
          APPLICABLE ORDER.
        </p>
      </Section>

      <Section title="13. Governing Law &amp; Disputes">
        <p>
          These Terms are governed by the laws of the United States and the state in which
          UniFlex Global is registered, without regard to conflict of law provisions. Disputes
          shall be resolved through binding arbitration in accordance with the American
          Arbitration Association rules, except that either party may seek injunctive relief in
          court for intellectual property violations.
        </p>
      </Section>

      <Section title="14. Changes to Terms">
        <p>
          We may modify these Terms at any time. Material changes will be communicated via email
          or a prominent site notice. Continued use after the effective date constitutes
          acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions:{' '}
          <a href="mailto:legal@uniflexstore.com" className="underline-offset-2 hover:underline">
            legal@uniflexstore.com
          </a>
        </p>
      </Section>
    </LegalPage>
  )
}
