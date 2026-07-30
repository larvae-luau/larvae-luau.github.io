'use client'

import { useSyncExternalStore } from 'react'

/**
 * Query-string switches for diagnosing rendering cost on a real device.
 *
 * iOS exposes no profiler without a Mac attached, so the page carries its own.
 * `?debug` shows a frame counter and `?off=aurora,snow` drops those effects,
 * which together let a phone bisect what is actually expensive by reloading.
 *
 * Absent from a normal production build. The catch is that `next dev` is the
 * one build too slow to measure, so `npm run build:probe` produces a real
 * production bundle that still carries it. Both values are inlined at build
 * time, which is what lets the bundler drop the overlay entirely.
 */
export const PROBE_AVAILABLE =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_PERF_PROBE === '1'

const EMPTY: ReadonlySet<string> = new Set()

let disabled: ReadonlySet<string> | null = null

/** Cached because useSyncExternalStore needs a stable reference per snapshot. */
function readDisabled(): ReadonlySet<string> {
  if (!PROBE_AVAILABLE) return EMPTY
  if (disabled) return disabled
  const raw = new URLSearchParams(window.location.search).get('off')
  disabled = new Set(
    raw
      ?.split(',')
      .map((name) => name.trim())
      .filter(Boolean) ?? [],
  )
  return disabled
}

function readDebug(): boolean {
  return (
    PROBE_AVAILABLE && new URLSearchParams(window.location.search).has('debug')
  )
}

/** The flags cannot change without a reload, so there is nothing to subscribe to. */
function subscribe(): () => void {
  return () => {}
}

export function useDisabledEffects(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, readDisabled, () => EMPTY)
}

export function useDebugOverlay(): boolean {
  return useSyncExternalStore(subscribe, readDebug, () => false)
}
