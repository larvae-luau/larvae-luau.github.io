'use client'

import { useEffect, useRef } from 'react'
import { createEmbers, type Ember, flicker, stepEmber } from '@/lib/embers'
import useLiteMotion from '@/lib/use-lite-motion'

/**
 * Full viewport canvas of rising embers. Fixed, pointer transparent, and
 * skipped entirely when the user prefers reduced motion.
 */
export default function Embers() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lite = useLiteMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let embers: Ember[] = []
    let raf = 0
    let last = performance.now()
    let elapsed = 0

    const resize = () => {
      // Touch devices pay for every pixel of an additively blended canvas, so
      // they render at 1x and let the browser scale it up.
      const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      embers = createEmbers({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt

      const bounds = { width: window.innerWidth, height: window.innerHeight }
      ctx.clearRect(0, 0, bounds.width, bounds.height)
      // additive blending is what makes overlapping embers read as light
      ctx.globalCompositeOperation = 'lighter'

      for (const ember of embers) {
        stepEmber(ember, dt, bounds, elapsed)
        const alpha = flicker(ember, elapsed)
        // green at rest, acid at the hot end
        const red = Math.round(16 + ember.heat * 150)
        const green = Math.round(230 + ember.heat * 25)
        const blue = Math.round(148 - ember.heat * 61)
        ctx.globalAlpha = Math.max(alpha, 0)
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`
        ctx.beginPath()
        ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [lite])

  return (
    <div
      aria-hidden="true"
      data-testid="embers-overlay"
      className="pointer-events-none fixed inset-0 z-30 select-none"
    >
      <canvas ref={canvasRef} data-testid="embers-canvas" />
    </div>
  )
}
