'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Tilt from '@/components/Tilt'

const MotionLink = motion.create(Link)

type Variant = 'primary' | 'ghost'
type Size = 'md' | 'sm'

/* Layered edge shadows give each button a physical depth that collapses on press. */
const EDGES: Record<Variant, { rest: string; hover: string; pressed: string }> =
  {
    primary: {
      rest: '0 5px 0 #3fa9b0, 0 12px 30px rgba(16,230,148,0.22)',
      hover: '0 7px 0 #3fa9b0, 0 16px 40px rgba(16,230,148,0.3)',
      pressed: '0 1px 0 #3fa9b0, 0 4px 12px rgba(16,230,148,0.18)',
    },
    ghost: {
      rest: '0 5px 0 rgba(16,230,148,0.14), 0 12px 30px rgba(2,5,10,0.6)',
      hover: '0 7px 0 rgba(16,230,148,0.2), 0 16px 36px rgba(2,5,10,0.7)',
      pressed: '0 1px 0 rgba(16,230,148,0.14), 0 4px 10px rgba(2,5,10,0.5)',
    },
  }

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-hive text-background hover:bg-white',
  ghost: 'hive-card text-foreground hover:border-hive/40',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'rounded-xl px-7 py-3 font-semibold',
  sm: 'rounded-lg px-3.5 py-1.5 text-sm font-medium',
}

interface IceButtonProps {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  external?: boolean
}

export default function GlowButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
}: IceButtonProps) {
  const edge = EDGES[variant]
  // route changes go through Link so navigation stays client side
  const isRoute = href.startsWith('/')
  const Component = isRoute ? MotionLink : motion.a

  return (
    <Tilt max={10} className="inline-block">
      <Component
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        style={{ boxShadow: edge.rest }}
        whileHover={{ y: -2, boxShadow: edge.hover }}
        whileTap={{ y: 4, boxShadow: edge.pressed }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className={`inline-block select-none transition-colors ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]}`}
      >
        {children}
      </Component>
    </Tilt>
  )
}
