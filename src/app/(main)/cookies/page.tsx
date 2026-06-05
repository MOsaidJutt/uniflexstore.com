import type { Metadata } from 'next'
import { LegalPage, Section } from '@/components/shared/legal-page'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How UniFlex Global uses cookies and similar tracking technologies.',
  alternates: { canonical: `${siteConfig.url}/cookies` },
}

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="June 2026">
      <Section title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They allow
          the site to remember your preferences and improve your experience across visits.
        </p>
      </Section>

      <Section title="Cookies We Use">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="py-2 pr-4 font-700 text-[var(--text-primary)]">Cookie</th>
                <th className="py-2 pr-4 font-700 text-[var(--text-primary)]">Purpose</th>
                <th className="py-2 pr-4 font-700 text-[var(--text-primary)]">Type</th>
                <th className="py-2 font-700 text-[var(--text-primary)]">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['next-auth.session-token', 'Authenticates your account session', 'Strictly necessary', '1–30 days'],
                ['next-auth.csrf-token', 'CSRF attack prevention', 'Strictly necessary', 'Session'],
                ['__cart_guest', 'Stores guest cart items', 'Functional', '7 days'],
                ['__chat_sid', 'Identifies your chat session for conversation history', 'Functional', '90 days'],
                ['__chat_ctx', 'Tracks current page for the AI assistant context', 'Functional', 'Session'],
                ['__cookie_consent', 'Remembers your cookie preferences', 'Strictly necessary', '1 year'],
              ].map(([name, purpose, type, expiry]) => (
                <tr key={name} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2.5 pr-4 font-mono text-xs">{name}</td>
                  <td className="py-2.5 pr-4">{purpose}</td>
                  <td className="py-2.5 pr-4">{type}</td>
                  <td className="py-2.5">{expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2">
          We do <strong>not</strong> currently use advertising or tracking pixels. If we add
          analytics in the future, we will update this policy and require fresh consent.
        </p>
      </Section>

      <Section title="Third-Party Cookies">
        <p>
          <strong>Stripe</strong> (payment processing) sets cookies to detect fraud and improve
          payment security. These are strictly necessary for checkout. Stripe&apos;s privacy
          policy governs those cookies.
        </p>
      </Section>

      <Section title="Managing Your Cookie Preferences">
        <p>
          You can manage cookies at any time via the <strong>Cookie Preferences</strong> link in
          the footer, or by adjusting your browser settings. Note that disabling strictly
          necessary cookies may prevent features like login and cart from working correctly.
        </p>
        <p>
          Most browsers allow you to refuse cookies, delete existing cookies, or be notified when
          a cookie is set. Refer to your browser&apos;s help documentation for instructions.
        </p>
      </Section>

      <Section title="California Residents (CCPA)">
        <p>
          Cookies that identify you personally are subject to the California Consumer Privacy
          Act. You have the right to opt out of certain data processing. See our{' '}
          <a href="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </a>{' '}
          for full CCPA rights and how to exercise them.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about our use of cookies:{' '}
          <a href="mailto:privacy@uniflexstore.com" className="underline-offset-2 hover:underline">
            privacy@uniflexstore.com
          </a>
        </p>
      </Section>
    </LegalPage>
  )
}
