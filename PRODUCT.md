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

- **Logotype:** "UniFlex Store" — Playfair Display italic for "Uni", then "Flex" in amber accent.
- **Feeling:** Premium but approachable. Warm neutrals, not cold grays. Trust-first, not hype-first.
- **Voice:** Direct, specific, confident. No marketing buzzwords (no "curated", "seamless", "world-class").

## Palette

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--brand-primary` | `#1c1917` | `#1c1917` | Logo, footer bg, primary buttons |
| `--brand-accent` | `#b45309` | `#d97706` | CTAs, links, active states, price highlights |
| `--bg-base` | `#fafaf9` | `#0c0a09` | Page background |
| `--text-primary` | `#0c0a09` | `#fafaf9` | Headings, body |
| `--text-muted` | `#6b6360` | `#a8a29e` | Captions (all ≥4.5:1 verified) |

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
| 1 — Auth | Pending | Login, register, OAuth, password reset |
| 2 — Catalog | Pending | Homepage hero, PLP, PDP, search |
| 3 — Cart + Checkout | Pending | Cart drawer, Stripe checkout |
| 4 — Orders | Pending | Order history, detail, tracking |
| 5 — Admin | Pending | /admin/* surfaces |
| 6 — Chatbot | Pending | Floating Claude-powered widget |
| 7 — Polish | Pending | impeccable polish pass on all surfaces |
| 8 — SEO + Perf | Pending | sitemap, robots, Core Web Vitals |
