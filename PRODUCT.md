# UniFlex Store — Product Context

> Used by the impeccable skill (`node .claude/skills/impeccable/scripts/context.mjs`) to inform design decisions.

## What this is

**UniFlex Store** is a premium multi-category US e-commerce storefront.

- **URL:** uniflexstore.com
- **Market:** United States — English, USD pricing
- **Categories:** Electronics, Fashion, Beauty, Toys (extensible)
- **Register:** Brand-facing storefront (consumers shop here) — use `brand.md` register for landing/category/PDP surfaces; use `product.md` register for admin and account surfaces.

## Design intention

The design bar is a "million-dollar retail flagship" — the layout precision of Apple, the typographic restraint of Aesop, and the accessibility-first approach of a trusted US retailer.

**Not:** a SaaS dashboard. Not a generic Shopify template. Not Inter + gray on everything.

## Brand

- **Logotype:** PNG at `/public/logo.png` — white pill container on all backgrounds.
- **Palette:** Deep teal-navy primary, bright teal accent. Cool-neutral surfaces with teal tint.
- **Feeling:** Premium but approachable. Cool-teal precision, not cold grays. Trust-first, not hype-first.
- **Voice:** Direct, specific, confident. No marketing buzzwords (no "curated", "seamless", "world-class").

## Palette

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--brand-primary` | `#1a3a4a` | `#1a3a4a` | Primary buttons, logo area, footer bg |
| `--brand-secondary` | `#2d5468` | `#2d5468` | Hover state for primary buttons |
| `--brand-accent` | `#1daabc` | `#29c4d9` | CTAs, links, active states, badges |
| `--brand-accent-hover` | `#1590a2` | `#1daabc` | Hover state for accent |
| `--brand-teal-light` | `#e0f5f8` | `#0f2e38` | Subtle teal backgrounds (selected states, banners) |
| `--bg-base` | `#f8fafb` | `#0a1520` | Page background |
| `--bg-subtle` | `#eef3f6` | `#0f2030` | Card backgrounds, form inputs |
| `--bg-muted` | `#dce8ed` | `#1a3040` | Disabled states, progress bars |
| `--text-primary` | `#0d1f2d` | `#e8f4f8` | Headings, body (17:1 on bg-base) |
| `--text-secondary` | `#37586f` | `#a8cad5` | Supporting text (7.1:1) |
| `--text-muted` | `#5d7d8e` | `#7aa0ae` | Captions (4.6:1 verified) |
| `--border-subtle` | `#dce8ed` | `#0f2030` | Dividers, card borders |
| `--border-default` | `#c8d8df` | `#1a3040` | Input borders |
| `--success` | `#059669` | `#059669` | Success states |
| `--error` | `#dc2626` | `#dc2626` | Error states |

## Typography

- **Display / headings (h1–h3):** Playfair Display — weight 600, tracking -0.02em, `text-wrap: balance`
- **Body / UI:** Inter — weight 400/500, tracking normal
- **Mono:** system monospace (code, order IDs)

## Motion

- **Philosophy:** Purposeful, not decorative. Ease-out on enter, ease-in on exit.
- **Reduced motion:** `MotionConfig reducedMotion="user"` applied globally via MotionProvider.
- **Key tokens:** fast 100ms · normal 200ms · slow 350ms · smooth `cubic-bezier(0.16,1,0.3,1)`

## Phase map

| Phase | Status | Surfaces |
|-------|--------|---------|
| 0 — Foundation | ✅ Done | Shell, header, footer, design tokens, Prisma schema |
| 1 — Auth | ✅ Done | Login, register, OAuth, password reset, account page |
| 2 — Catalog | ✅ Done | Homepage hero, PLP, PDP, search, filters, quick view |
| 3 — Cart + Checkout | ✅ Done | Cart drawer, address/shipping/payment steps, Stripe Payment Element, webhook, order confirmation |
| 4 — Orders | Pending | Order history, detail, tracking |
| 5 — Admin | Pending | /admin/* surfaces |
| 6 — Chatbot | Pending | Floating Claude-powered widget |
| 7 — Polish | Pending | impeccable polish pass on all surfaces |
| 8 — SEO + Perf | Pending | sitemap, robots, Core Web Vitals |
