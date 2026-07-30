'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import useLiteMotion from '@/lib/use-lite-motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function Reveal({
  children,
  delay = 0,
  className,
}: RevealProps) {
  const lite = useLiteMotion()

  return (
    <motion.div
      /* The blur is the expensive half: animating a CSS filter re-rasterizes
         the element every frame, and this wraps nearly every block on the page.
         Touch devices keep the slide and fade, which stay pure compositing. */
      initial={
        lite
          ? { opacity: 0, y: 32 }
          : { opacity: 0, y: 32, filter: 'blur(6px)' }
      }
      whileInView={
        lite ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0px)' }
      }
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', stiffness: 70, damping: 16, delay }}
      className={`motion-blur ${className ?? ''}`}
    >
      {children}
    </motion.div>
  )
}
