'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import useLiteMotion from '@/lib/use-lite-motion'

interface TiltProps {
  children: ReactNode
  className?: string
  /** Maximum tilt in degrees. */
  max?: number
}

/**
 * Pointer-tracking 3D tilt: the card rotates toward the cursor with a
 * spring, and settles back flat when the pointer leaves.
 *
 * A finger has no hover, so on touch this only ever fires mid-drag. It drops to
 * a plain wrapper there rather than leaving a preserve-3d layer and a permanent
 * will-change hint on every button and card for an effect nobody can trigger.
 */
export default function Tilt({ children, className, max = 8 }: TiltProps) {
  const lite = useLiteMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 160, damping: 18, mass: 0.4 }
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring)

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  const onPointerLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  if (lite) return <div className={className}>{children}</div>

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
