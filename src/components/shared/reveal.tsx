'use client'

import { m } from 'motion/react'
import type { HTMLMotionProps, Variants, TargetAndTransition } from 'motion/react'
import { revealUp } from '@/lib/motion'

interface RevealProps extends HTMLMotionProps<'div'> {
  variants?: Variants
  threshold?: number
  margin?: string
  delay?: number
  once?: boolean
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

export function Reveal({
  variants = revealUp,
  threshold = 0.15,
  margin = '-64px',
  delay,
  once = true,
  as = 'div',
  children,
  ...rest
}: RevealProps) {
  const Component = m[as] as typeof m.div

  // If delay is supplied, patch the visible variant's transition
  let resolvedVariants = variants
  if (delay != null && variants.visible) {
    const baseVisible = variants.visible as TargetAndTransition
    resolvedVariants = {
      ...variants,
      visible: {
        ...baseVisible,
        transition: {
          ...(baseVisible.transition as object | undefined),
          delay,
        },
      },
    }
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold, margin }}
      variants={resolvedVariants}
      {...rest}
    >
      {children}
    </Component>
  )
}
