export interface Flake {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  phase: number
  opacity: number
}

export interface SnowBounds {
  width: number
  height: number
}

export type Rng = () => number

export const FLAKES_PER_PIXEL = 1 / 14000

export function flakeCountFor(bounds: SnowBounds, max = 220): number {
  const count = Math.round(bounds.width * bounds.height * FLAKES_PER_PIXEL)
  return Math.max(0, Math.min(max, count))
}

export function createFlake(
  bounds: SnowBounds,
  rng: Rng = Math.random,
  spawnAtTop = false,
): Flake {
  const depth = rng()
  return {
    x: rng() * bounds.width,
    y: spawnAtTop ? -6 : rng() * bounds.height,
    radius: 0.6 + depth * 2.2,
    speed: 14 + depth * 46,
    drift: 6 + rng() * 18,
    phase: rng() * Math.PI * 2,
    opacity: 0.25 + depth * 0.55,
  }
}

export function createFlakes(
  bounds: SnowBounds,
  rng: Rng = Math.random,
): Flake[] {
  return Array.from({ length: flakeCountFor(bounds) }, () =>
    createFlake(bounds, rng),
  )
}

/**
 * Advance a flake by dt seconds. Mutates and returns the flake.
 * Wraps horizontally; respawns at the top once it falls past the bottom edge.
 */
export function stepFlake(
  flake: Flake,
  dt: number,
  bounds: SnowBounds,
  time: number,
  rng: Rng = Math.random,
): Flake {
  flake.y += flake.speed * dt
  flake.x += Math.sin(time * 0.6 + flake.phase) * flake.drift * dt

  if (flake.x < -8) flake.x = bounds.width + 8
  else if (flake.x > bounds.width + 8) flake.x = -8

  if (flake.y > bounds.height + 8) {
    const fresh = createFlake(bounds, rng, true)
    Object.assign(flake, fresh)
  }
  return flake
}
