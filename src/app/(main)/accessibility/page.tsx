import type { Metadata } from 'next'
import { LegalPage, Section } from '@/components/shared/legal-page'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'UniFlex Global is committed to WCAG 2.2 AA accessibility for all users, including those using assistive technologies.',
  alternates: { canonical: `${siteConfig.url}/accessibility` },
}

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" lastUpdated="June 2026">
      <Section title="Our Commitment">
        <p>
          UniFlex Global is committed to ensuring digital accessibility for people with
          disabilities. We continually improve the user experience for everyone and apply relevant
          accessibility standards — including <strong>WCAG 2.2 Level AA</strong> — as our target.
        </p>
        <p>
          As a US e-commerce business we take our obligations under the Americans with
          Disabilities Act (ADA) seriously. Accessibility is a business requirement, not an
          afterthought.
        </p>
      </Section>

      <Section title="Measures We Take">
        <ul className="ml-4 list-disc space-y-1">
          <li>All images include descriptive <code>alt</code> text</li>
          <li>Full keyboard navigation — every interactive element is reachable via Tab</li>
          <li>Visible focus indicators on all focusable elements (WCAG 2.4.11)</li>
          <li>Skip-to-main-content link at the top of every page</li>
          <li>Color contrast ratios of at least 4.5:1 for body text and 3:1 for UI components</li>
          <li>Semantic HTML with proper heading hierarchy</li>
          <li>ARIA roles, labels, and live regions on dynamic UI (cart, modals, alerts)</li>
          <li>Tested with keyboard-only navigation and screen readers (NVDA, VoiceOver)</li>
          <li>
            Respects <code>prefers-reduced-motion</code> — animations are disabled for users who
            prefer reduced motion
          </li>
          <li>Responsive layout down to 320 px viewport width</li>
        </ul>
      </Section>

      <Section title="Known Limitations">
        <p>
          While we strive for full WCAG 2.2 AA compliance, some areas are still being improved:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            PDF certificates on the authorized-reseller page are third-party documents and may
            not be fully accessible. Contact us for an accessible version.
          </li>
          <li>
            The AI shopping assistant is tested for keyboard access but may have limitations with
            some screen reader flows — we are actively improving this.
          </li>
        </ul>
      </Section>

      <Section title="Technical Specifications">
        <p>Accessibility of this site relies on:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>HTML5 and ARIA as defined by W3C specifications</li>
          <li>CSS that respects user preferences (color scheme, reduced motion, forced colors)</li>
          <li>JavaScript for progressive enhancement — core purchasing path works without JS</li>
        </ul>
      </Section>

      <Section title="Feedback &amp; Contact">
        <p>
          We welcome feedback on our accessibility. If you encounter a barrier or need assistance,
          please contact us:
        </p>
        <p>
          Email:{' '}
          <a href="mailto:accessibility@uniflexstore.com" className="underline-offset-2 hover:underline">
            accessibility@uniflexstore.com
          </a>
          <br />
          Response time: within 2 business days
        </p>
        <p>
          If you are not satisfied with our response, you may contact the{' '}
          <a
            href="https://www.ada.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            ADA National Network
          </a>{' '}
          for further assistance.
        </p>
      </Section>

      <Section title="Formal Complaints">
        <p>
          We are committed to resolving accessibility complaints. If you wish to file a formal
          complaint, contact us at the address above. We aim to respond within 5 business days
          with a proposed resolution.
        </p>
      </Section>
    </LegalPage>
  )
}
