'use client'

import { useEffect, useRef } from 'react'
import { createFlakes, type Flake, stepFlake } from '@/lib/snow'

/**
 * Full-viewport canvas snowfall. Fixed, pointer-transparent, and skipped
 * entirely when the user prefers reduced motion.
 */
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    let flakes: Flake[] = []
    let raf = 0
    let last = performance.now()
    let elapsed = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      flakes = createFlakes({
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
      ctx.fillStyle = '#dff6ff'

      for (const flake of flakes) {
        stepFlake(flake, dt, bounds, elapsed)
        ctx.globalAlpha = flake.opacity
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      data-testid="snowfall-overlay"
      className="pointer-events-none fixed inset-0 z-30 select-none"
    >
      <canvas ref={canvasRef} data-testid="snowfall-canvas" />
    </div>
  )
}
