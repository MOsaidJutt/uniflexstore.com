# UniFlex Store — Design System

> Generated via UI UX Pro Max (v2.5) + impeccable.  
> Stack: Next.js 16 · Tailwind CSS v4 · Framer Motion · Playfair Display + Inter

---

## Brand Concept

**"Premium American Retail Flagship"** — the warmth of a tactile boutique, the precision of a tech flagship, the confidence of an established American brand. Think Apple's layout control × Aesop's typographic restraint × Glossier's approachability.

---

## Color System

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#FAFAF9` | Page background (warm white) |
| `--bg-subtle` | `#F5F5F4` | Card backgrounds, input backgrounds |
| `--bg-muted` | `#E7E5E4` | Dividers, disabled states |
| `--text-primary` | `#0C0A09` | Headings, body text |
| `--text-secondary` | `#44403C` | Supporting text |
| `--text-muted` | `#78716C` | Captions, placeholders |
| `--brand-primary` | `#1C1917` | Nav, footer, key UI elements |
| `--brand-accent` | `#B45309` | CTAs, links, active states |
| `--brand-gold` | `#CA8A04` | Price highlights, badges, stars |
| `--border-default` | `#D6D3D1` | Default borders |

### Dark Mode

| Token | Value | Note |
|-------|-------|------|
| `--bg-base` | `#0C0A09` | Deep warm black |
| `--bg-subtle` | `#1C1917` | Elevated surfaces |
| `--bg-muted` | `#292524` | Highest elevation |
| `--brand-accent` | `#D97706` | Slightly lighter amber |

---

## Typography

**Heading font:** Playfair Display (400, 500, 600, 700 + italic)  
**Body font:** Inter (300, 400, 500, 600, 700)

### Type Scale

| Name | Size | Usage |
|------|------|-------|
| `xs` | 0.75rem / 12px | Labels, tags |
| `sm` | 0.875rem / 14px | Secondary text, captions |
| `base` | 1rem / 16px | Body copy |
| `lg` | 1.125rem / 18px | Lead text |
| `xl` | 1.25rem / 20px | Card titles |
| `2xl` | 1.5rem / 24px | Section sub-headings |
| `3xl` | 1.875rem / 30px | Section headings |
| `4xl` | 2.25rem / 36px | Page titles |
| `5xl` | 3rem / 48px | Hero text mobile |
| `6xl` | 3.75rem / 60px | Hero text desktop |
| `7xl` | 4.5rem / 72px | Display / campaign |

---

## Spacing (base-4 grid)

`4px · 8px · 12px · 16px · 20px · 24px · 32px · 40px · 48px · 64px · 80px · 96px · 128px`

---

## Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 2px | Badges, tags |
| `sm` | 4px | Inputs, small elements |
| `md` | 6px | Buttons |
| `lg` | 8px | Cards |
| `xl` | 12px | Modals |
| `2xl` | 16px | Feature cards |
| `3xl` | 24px | Large cards, panels |
| `full` | 9999px | Pills, avatars |

---

## Shadows

`xs · sm · md · lg · xl · 2xl` — all use warm-toned black with opacity, heavier in dark mode.

---

## Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--motion-fast` | 100ms | Micro-interactions (hover, focus) |
| `--motion-normal` | 200ms | UI state changes |
| `--motion-slow` | 350ms | Panel open/close, reveals |
| `--motion-page` | 500ms | Page transitions |
| `--ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | General purpose |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bouncy |
| `--ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | Expressive reveals |

### Framer Motion Presets (in `/lib/motion.ts`)

- `fadeIn` — opacity 0→1, translateY 8px→0
- `fadeInUp` — opacity 0→1, translateY 24px→0  
- `fadeInScale` — opacity 0→1, scale 0.95→1
- `staggerContainer` — stagger children 0.1s
- `slideInRight` — translateX 20px→0
- `spring` — `{ type: "spring", stiffness: 400, damping: 30 }`

---

## Component Conventions

- **Buttons**: `md` radius, 200ms transition, no outline on hover (focus-visible only)
- **Cards**: `lg` radius, `shadow-sm` default, `shadow-md` on hover with 200ms
- **Inputs**: `sm` radius, 1px border, amber focus ring
- **Header**: `sticky top-0`, `z-[200]`, backdrop-blur on scroll
- **Mega-menu**: `z-[100]`, 350ms ease-smooth open, subtle shadow-xl
