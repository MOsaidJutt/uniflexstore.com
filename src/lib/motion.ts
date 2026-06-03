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

export const easeSmooth: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
}

export const easeNormal: Transition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
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
