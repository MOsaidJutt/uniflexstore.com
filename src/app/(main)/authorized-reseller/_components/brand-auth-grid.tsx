'use client'

import { m } from 'motion/react'
import { revealStagger, revealStaggerItem } from '@/lib/motion'
import type { BrandAuthRecord } from '@/server/queries/brand-authorizations'
import { BrandAuthCard } from './brand-auth-card'

interface Props {
  authorizations: BrandAuthRecord[]
}

export function BrandAuthGrid({ authorizations }: Props) {
  return (
    <m.div
      variants={revealStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '-64px' }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {authorizations.map((auth) => (
        <m.div key={auth.id} variants={revealStaggerItem}>
          <BrandAuthCard auth={auth} />
        </m.div>
      ))}
    </m.div>
  )
}
