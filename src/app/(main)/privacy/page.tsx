import type { Metadata } from 'next'
import { LegalPage, Section } from '@/components/shared/legal-page'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How UniFlex Global collects, uses, and protects your personal information.',
  alternates: { canonical: `${siteConfig.url}/privacy` },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 2026">
      <Section title="1. Introduction">
        <p>
          UniFlex Global (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates{' '}
          <strong>uniflexstore.com</strong>. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you visit our website or make a purchase.
        </p>
        <p>
          By using our site you agree to this policy. If you do not agree, please discontinue use.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>
          <strong>Account &amp; order data:</strong> name, email address, shipping address,
          payment method details (processed and stored by Stripe — we never store raw card numbers),
          and order history.
        </p>
        <p>
          <strong>Usage data:</strong> IP address, browser type, pages visited, referring URLs,
          and session duration, collected automatically via server logs and analytics.
        </p>
        <p>
          <strong>Communications:</strong> messages you send us, support tickets, and reviews.
        </p>
        <p>
          <strong>Cookies &amp; similar technologies:</strong> see our{' '}
          <a href="/cookies" className="underline-offset-2 hover:underline">
            Cookie Policy
          </a>
          .
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Process and fulfill your orders and send confirmation/shipping emails</li>
          <li>Manage your account and authenticate your identity</li>
          <li>Provide customer support</li>
          <li>Send promotional communications (only with your consent — opt out anytime)</li>
          <li>Prevent fraud and ensure the security of our platform</li>
          <li>Comply with legal obligations</li>
          <li>Improve our products and services through aggregate analytics</li>
        </ul>
      </Section>

      <Section title="4. Sharing Your Information">
        <p>We do <strong>not</strong> sell your personal information. We share data only:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Service providers:</strong> Stripe (payment processing), Resend (transactional
            email), Cloudinary (image hosting), and our hosting infrastructure — each bound by
            data processing agreements.
          </li>
          <li>
            <strong>Legal requirements:</strong> when required by law, subpoena, or to protect our
            rights or users&apos; safety.
          </li>
          <li>
            <strong>Business transfers:</strong> in connection with a merger, acquisition, or sale
            of assets (buyers are bound by this policy or equivalent protections).
          </li>
        </ul>
      </Section>

      <Section title="5. California Privacy Rights (CCPA / CPRA)">
        <p>
          If you are a California resident, you have the right to: (a) know what personal
          information we collect and how it is used; (b) request deletion of your personal
          information; (c) opt out of the &ldquo;sale&rdquo; of personal information (we do not
          sell data, but we disclose this right for completeness); and (d) non-discrimination for
          exercising these rights.
        </p>
        <p>
          To submit a request, email{' '}
          <a href="mailto:privacy@uniflexstore.com" className="underline-offset-2 hover:underline">
            privacy@uniflexstore.com
          </a>{' '}
          with subject line &ldquo;California Privacy Request.&rdquo; We will respond within 45
          days.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain order data for seven (7) years for tax and legal compliance. Account data is
          retained while your account is active. You may request deletion at any time — we will
          delete personal data not required for legal retention.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We implement industry-standard safeguards including HTTPS/TLS encryption, strict
          Content Security Policy headers, server-side session validation, and limited employee
          access to personal data. No transmission over the internet is 100% secure; if you
          believe your data has been compromised, contact us immediately.
        </p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>
          Our site is not directed to children under 13. We do not knowingly collect personal
          information from children under 13. If you believe we have done so, contact us and we
          will delete the data promptly.
        </p>
      </Section>

      <Section title="9. Third-Party Links">
        <p>
          Our site may link to third-party websites. We are not responsible for their privacy
          practices. Please review each site&apos;s policy before providing personal information.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this policy periodically. We will notify you of material changes by email
          or by a prominent notice on our site. The &ldquo;Last updated&rdquo; date at the top of
          this page reflects the most recent revision.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>
          Questions or requests:{' '}
          <a href="mailto:privacy@uniflexstore.com" className="underline-offset-2 hover:underline">
            privacy@uniflexstore.com
          </a>
          <br />
          UniFlex Global — United States
        </p>
      </Section>
    </LegalPage>
  )
}
