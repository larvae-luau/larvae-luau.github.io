'use client'

import { useSyncExternalStore } from 'react'

/**
 * Phones and tablets: no hover, coarse pointer. Deliberately not a width query,
 * so a narrow desktop window keeps the full experience and a big iPad does not.
 */
export const LITE_MOTION_QUERY = '(hover: none) and (pointer: coarse)'

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(LITE_MOTION_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(LITE_MOTION_QUERY).matches
}

/** Prerendered HTML is the desktop build; touch devices swap in after hydration. */
function getServerSnapshot(): boolean {
  return false
}

/**
 * True when the device wants the cheap version of an effect.
 *
 * Mobile Safari pays for compositing in a way desktop does not: backdrop
 * filters, animated CSS filters, and scroll-driven transforms each force a
 * full-viewport repaint per frame. Components read this to drop those and keep
 * the plain transform/opacity animations, which stay on the GPU.
 */
export default function useLiteMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
