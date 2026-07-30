'use client'

import { useEffect, useRef, useState } from 'react'
import { useDebugOverlay, useDisabledEffects } from '@/lib/debug-flags'
import useLiteMotion from '@/lib/use-lite-motion'

/** Long enough to be readable, short enough to react while you scroll. */
const WINDOW_MS = 500

interface Reading {
  fps: number
  worst: number
}

/**
 * On-screen frame counter, shown only with `?debug` in the URL.
 *
 * `worst` is the number that matters: an idle phone holds 60 almost anywhere,
 * and the stutter only shows up in the window where you are actually flicking
 * the page. It resets on tap so each bisect run starts clean.
 */
export default function PerfProbe() {
  const enabled = useDebugOverlay()
  const disabled = useDisabledEffects()
  const lite = useLiteMotion()
  const [reading, setReading] = useState<Reading>({ fps: 0, worst: 0 })
  const resetAt = useRef(0)

  useEffect(() => {
    if (!enabled) return

    let raf = 0
    let frames = 0
    let since = performance.now()
    let worst = Number.POSITIVE_INFINITY

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      frames++
      const span = now - since
      if (span < WINDOW_MS) return

      const fps = Math.round((frames * 1000) / span)
      frames = 0
      since = now
      // A window that straddles a reset would report a stale low.
      if (resetAt.current > now - span) worst = Number.POSITIVE_INFINITY
      worst = Math.min(worst, fps)
      setReading({
        fps,
        worst: worst === Number.POSITIVE_INFINITY ? fps : worst,
      })
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  if (!enabled) return null

  const off = disabled.size ? [...disabled].join(',') : 'none'

  return (
    <button
      type="button"
      onClick={() => {
        resetAt.current = performance.now()
        setReading((prev) => ({ fps: prev.fps, worst: prev.fps }))
      }}
      className="fixed bottom-3 left-3 z-50 rounded-lg border border-ice/30 bg-black/85 px-3 py-2 text-left font-mono text-[11px] leading-tight text-ice tabular-nums"
    >
      <div className="text-base font-bold">
        {reading.fps} fps
        <span className="ml-2 text-muted">low {reading.worst}</span>
      </div>
      <div className="text-muted">
        {lite ? 'lite' : 'full'} · dpr {window.devicePixelRatio} ·{' '}
        {window.innerWidth}×{window.innerHeight}
      </div>
      <div className="text-muted">off: {off}</div>
    </button>
  )
}
