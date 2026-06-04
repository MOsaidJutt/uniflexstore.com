import type { Variants, Transition } from 'motion/react'

// ─── Base transitions ─────────────────────────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

// Expo-out: decisive, confident — the house curve
export const easeExpo: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
}

export const easeSmooth: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
}

export const easeNormal: Transition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
}

export const easeOut: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
}

// ─── Fade variants ────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeNormal },
  exit: { opacity: 0, transition: easeNormal },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeSmooth },
  exit: { opacity: 0, y: 12, transition: easeNormal },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: easeSmooth },
  exit: { opacity: 0, y: -8, transition: easeNormal },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: easeSmooth },
  exit: { opacity: 0, scale: 0.98, transition: easeNormal },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: easeSmooth },
  exit: { opacity: 0, x: 10, transition: easeNormal },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: easeSmooth },
  exit: { opacity: 0, x: -10, transition: easeNormal },
}

// ─── Stagger ──────────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeSmooth },
}

// ─── Scroll-reveal (whileInView) ─────────────────────────────────────────────

// Base reveal — for individual elements
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: easeExpo },
}

export const revealFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: easeExpo },
}

// Container that staggers its children on scroll-reveal
export const revealStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

// Child used inside revealStagger container
export const revealStaggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeExpo },
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

// Cascading text reveal for hero copy
export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const heroLine: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export const heroMedia: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
  },
}

// ─── Header / Navigation ──────────────────────────────────────────────────────

export const megaMenuPanel: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    clipPath: 'inset(0 0 100% 0)',
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    clipPath: 'inset(0 0 100% 0)',
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const mobileMenuDrawer: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
}

// ─── Product card grid ────────────────────────────────────────────────────────

export const gridReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0,
    },
  },
}

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

export const cartDrawer: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 32 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
}

// ─── Checkout step transition ─────────────────────────────────────────────────

export const stepForward: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: easeSmooth },
  exit: { opacity: 0, x: -20, transition: easeNormal },
}

export const stepBackward: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: easeSmooth },
  exit: { opacity: 0, x: 20, transition: easeNormal },
}
