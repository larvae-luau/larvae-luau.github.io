import { describe, expect, it } from 'vitest'
import {
  createFlake,
  createFlakes,
  type Flake,
  flakeCountFor,
  stepFlake,
} from '@/lib/snow'

const bounds = { width: 1000, height: 800 }

function seededRng(seed = 1): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

describe('flakeCountFor', () => {
  it('scales with viewport area', () => {
    const small = flakeCountFor({ width: 400, height: 600 })
    const large = flakeCountFor({ width: 1920, height: 1080 })
    expect(large).toBeGreaterThan(small)
  })

  it('caps the flake count', () => {
    expect(flakeCountFor({ width: 10000, height: 10000 })).toBe(220)
  })

  it('never returns a negative count', () => {
    expect(flakeCountFor({ width: 0, height: 0 })).toBe(0)
  })
})

describe('createFlake', () => {
  it('spawns within horizontal bounds', () => {
    const rng = seededRng()
    for (let i = 0; i < 100; i++) {
      const flake = createFlake(bounds, rng)
      expect(flake.x).toBeGreaterThanOrEqual(0)
      expect(flake.x).toBeLessThanOrEqual(bounds.width)
      expect(flake.y).toBeGreaterThanOrEqual(0)
      expect(flake.y).toBeLessThanOrEqual(bounds.height)
    }
  })

  it('spawns just above the viewport when spawnAtTop is set', () => {
    const flake = createFlake(bounds, seededRng(), true)
    expect(flake.y).toBeLessThan(0)
  })

  it('produces sane physical properties', () => {
    const flake = createFlake(bounds, seededRng())
    expect(flake.radius).toBeGreaterThan(0)
    expect(flake.speed).toBeGreaterThan(0)
    expect(flake.opacity).toBeGreaterThan(0)
    expect(flake.opacity).toBeLessThanOrEqual(1)
  })
})

describe('createFlakes', () => {
  it('creates the count that flakeCountFor prescribes', () => {
    const flakes = createFlakes(bounds, seededRng())
    expect(flakes).toHaveLength(flakeCountFor(bounds))
  })
})

describe('stepFlake', () => {
  it('moves a flake downward over time', () => {
    const flake = createFlake(bounds, seededRng())
    const startY = flake.y
    stepFlake(flake, 0.016, bounds, 0)
    expect(flake.y).toBeGreaterThan(startY)
  })

  it('wraps around the left edge', () => {
    const flake: Flake = {
      x: -10,
      y: 100,
      radius: 1,
      speed: 0,
      drift: 0,
      phase: 0,
      opacity: 0.5,
    }
    stepFlake(flake, 0.016, bounds, 0)
    expect(flake.x).toBeGreaterThan(bounds.width)
  })

  it('wraps around the right edge', () => {
    const flake: Flake = {
      x: bounds.width + 10,
      y: 100,
      radius: 1,
      speed: 0,
      drift: 0,
      phase: 0,
      opacity: 0.5,
    }
    stepFlake(flake, 0.016, bounds, 0)
    expect(flake.x).toBeLessThan(0)
  })

  it('respawns at the top after falling past the bottom', () => {
    const flake = createFlake(bounds, seededRng())
    flake.y = bounds.height + 100
    stepFlake(flake, 0.016, bounds, 0, seededRng(42))
    expect(flake.y).toBeLessThan(0)
  })

  it('falls proportionally to dt', () => {
    const slow = createFlake(bounds, seededRng(7))
    const fast = { ...slow }
    stepFlake(slow, 0.01, bounds, 0)
    stepFlake(fast, 0.1, bounds, 0)
    expect(fast.y - slow.y).toBeGreaterThan(0)
  })
})
