'use client'

import { useEffect, useRef } from 'react'
import { createFlakes, type Flake, stepFlake } from '@/lib/snow'
import { LITE_MOTION_QUERY } from '@/lib/use-lite-motion'

/** Mobile Safari fires resize every time its URL bar slides. Ignore that much. */
const URL_BAR_SLACK = 160

/**
 * Full-viewport canvas snowfall. Fixed, pointer-transparent, and skipped
 * entirely when the user prefers reduced motion.
 *
 * On touch devices the field is drawn at 1x into a 30fps loop. The flakes are
 * soft 1-3px dots, so neither is visible, but the layer is fixed and covers the
 * whole viewport: every frame it paints costs iOS a full-screen composite on
 * top of whatever the page is already scrolling.
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

    const lite = window.matchMedia(LITE_MOTION_QUERY).matches
    const maxDpr = lite ? 1 : 2
    const minFrameMs = lite ? 1000 / 30 : 0
    const slack = lite ? URL_BAR_SLACK : 0

    let flakes: Flake[] = []
    let raf = 0
    let last = performance.now()
    let elapsed = 0
    let width = 0
    let height = 0

    /**
     * Touch devices get a canvas one URL bar taller than the viewport, and then
     * ignore height changes that fit inside that margin. Reallocating the
     * backing store and reseeding the field on every bar slide is a stutter you
     * can feel; the overshoot costs nothing, because the fixed parent clips it.
     */
    const resize = () => {
      const nextWidth = window.innerWidth
      const nextHeight = window.innerHeight + slack
      if (nextWidth === width && Math.abs(nextHeight - height) <= slack) return

      width = nextWidth
      height = nextHeight
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      flakes = createFlakes({ width, height })
    }

    const orient = () => {
      // A rotation is a real layout change, so let the field rebuild from zero.
      width = 0
      height = 0
      resize()
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      // Skipping the draw without touching `last` lets dt absorb the gap, so
      // the flakes fall at the same speed however many frames we drop.
      if (now - last < minFrameMs) return

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt

      const bounds = { width, height }
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#dff6ff'

      for (const flake of flakes) {
        stepFlake(flake, dt, bounds, elapsed)
        ctx.globalAlpha = flake.opacity
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const start = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // A backgrounded tab keeps the compositor awake on iOS otherwise.
    const visibility = () => {
      if (document.hidden) stop()
      else start()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', orient)
    document.addEventListener('visibilitychange', visibility)
    start()

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', orient)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      data-testid="snowfall-overlay"
      className="pointer-events-none fixed inset-0 z-30 select-none overflow-hidden"
    >
      <canvas ref={canvasRef} data-testid="snowfall-canvas" />
    </div>
  )
}
