export interface Ember {
  x: number
  y: number
  radius: number
  /** Upward speed in pixels per second. Embers rise, they do not fall. */
  speed: number
  drift: number
  phase: number
  opacity: number
  /** Drives the flicker, so no two embers pulse together. */
  flickerPhase: number
  flickerRate: number
  /** 0 is brand green, 1 is the acid spore highlight. */
  heat: number
}

export interface EmberBounds {
  width: number
  height: number
}

export type Rng = () => number

export const EMBERS_PER_PIXEL = 1 / 16000

export function emberCountFor(bounds: EmberBounds, max = 190): number {
  const count = Math.round(bounds.width * bounds.height * EMBERS_PER_PIXEL)
  return Math.max(0, Math.min(max, count))
}

export function createEmber(
  bounds: EmberBounds,
  rng: Rng = Math.random,
  spawnAtBottom = false,
): Ember {
  const depth = rng()
  return {
    x: rng() * bounds.width,
    y: spawnAtBottom ? bounds.height + 6 : rng() * bounds.height,
    radius: 0.5 + depth * 1.9,
    speed: 12 + depth * 40,
    drift: 5 + rng() * 20,
    phase: rng() * Math.PI * 2,
    opacity: 0.2 + depth * 0.55,
    flickerPhase: rng() * Math.PI * 2,
    flickerRate: 1.6 + rng() * 3.2,
    // most stay green, a minority burn hotter toward the acid highlight
    heat: rng() < 0.22 ? 0.55 + rng() * 0.45 : rng() * 0.3,
  }
}

export function createEmbers(
  bounds: EmberBounds,
  rng: Rng = Math.random,
): Ember[] {
  return Array.from({ length: emberCountFor(bounds) }, () =>
    createEmber(bounds, rng),
  )
}

/**
 * Brightness at a moment in time, between 0.35 and 1 of the ember's own
 * opacity. Kept separate from stepEmber so it can be tested on its own.
 */
export function flicker(ember: Ember, time: number): number {
  const wave = Math.sin(time * ember.flickerRate + ember.flickerPhase)
  return ember.opacity * (0.675 + wave * 0.325)
}

/**
 * Advance an ember by dt seconds. Mutates and returns it.
 * Wraps horizontally, respawns at the bottom once it rises past the top edge.
 */
export function stepEmber(
  ember: Ember,
  dt: number,
  bounds: EmberBounds,
  time: number,
  rng: Rng = Math.random,
): Ember {
  ember.y -= ember.speed * dt
  ember.x += Math.sin(time * 0.5 + ember.phase) * ember.drift * dt

  if (ember.x < -8) ember.x = bounds.width + 8
  else if (ember.x > bounds.width + 8) ember.x = -8

  if (ember.y < -8) {
    Object.assign(ember, createEmber(bounds, rng, true))
  }
  return ember
}
