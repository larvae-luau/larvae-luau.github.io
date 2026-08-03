import { describe, expect, it } from 'vitest'
import {
  createEmber,
  createEmbers,
  type Ember,
  emberCountFor,
  flicker,
  stepEmber,
} from '@/lib/embers'

const bounds = { width: 1000, height: 800 }

function seededRng(seed = 1): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

describe('emberCountFor', () => {
  it('scales with viewport area', () => {
    expect(emberCountFor({ width: 1920, height: 1080 })).toBeGreaterThan(
      emberCountFor({ width: 400, height: 600 }),
    )
  })

  it('caps the count', () => {
    expect(emberCountFor({ width: 10000, height: 10000 })).toBe(190)
  })

  it('never returns a negative count', () => {
    expect(emberCountFor({ width: 0, height: 0 })).toBe(0)
  })
})

describe('createEmber', () => {
  it('spawns within bounds', () => {
    const rng = seededRng()
    for (let i = 0; i < 100; i++) {
      const ember = createEmber(bounds, rng)
      expect(ember.x).toBeGreaterThanOrEqual(0)
      expect(ember.x).toBeLessThanOrEqual(bounds.width)
      expect(ember.y).toBeGreaterThanOrEqual(0)
      expect(ember.y).toBeLessThanOrEqual(bounds.height)
    }
  })

  it('spawns just below the viewport when asked, since embers rise', () => {
    const ember = createEmber(bounds, seededRng(), true)
    expect(ember.y).toBeGreaterThan(bounds.height)
  })

  it('produces sane physical properties', () => {
    const ember = createEmber(bounds, seededRng())
    expect(ember.radius).toBeGreaterThan(0)
    expect(ember.speed).toBeGreaterThan(0)
    expect(ember.opacity).toBeGreaterThan(0)
    expect(ember.opacity).toBeLessThanOrEqual(1)
    expect(ember.heat).toBeGreaterThanOrEqual(0)
    expect(ember.heat).toBeLessThanOrEqual(1)
  })

  it('keeps most embers cool, so the acid highlight stays a minority', () => {
    const rng = seededRng(9)
    const embers = Array.from({ length: 400 }, () => createEmber(bounds, rng))
    const hot = embers.filter((e) => e.heat > 0.5).length
    expect(hot).toBeGreaterThan(0)
    expect(hot).toBeLessThan(embers.length / 2)
  })
})

describe('createEmbers', () => {
  it('creates the count that emberCountFor prescribes', () => {
    expect(createEmbers(bounds, seededRng())).toHaveLength(
      emberCountFor(bounds),
    )
  })
})

describe('flicker', () => {
  it('stays within the ember opacity and never goes negative', () => {
    const ember = createEmber(bounds, seededRng())
    for (let t = 0; t < 40; t++) {
      const value = flicker(ember, t * 0.1)
      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThanOrEqual(ember.opacity)
    }
  })

  it('actually varies over time', () => {
    const ember = createEmber(bounds, seededRng())
    const samples = new Set(
      Array.from({ length: 20 }, (_, i) => flicker(ember, i * 0.13).toFixed(4)),
    )
    expect(samples.size).toBeGreaterThan(1)
  })
})

describe('stepEmber', () => {
  it('moves an ember upward over time', () => {
    const ember = createEmber(bounds, seededRng())
    const startY = ember.y
    stepEmber(ember, 0.016, bounds, 0)
    expect(ember.y).toBeLessThan(startY)
  })

  it('wraps around the left edge', () => {
    const ember: Ember = {
      x: -10,
      y: 400,
      radius: 1,
      speed: 0,
      drift: 0,
      phase: 0,
      opacity: 0.5,
      flickerPhase: 0,
      flickerRate: 2,
      heat: 0,
    }
    stepEmber(ember, 0.016, bounds, 0)
    expect(ember.x).toBeGreaterThan(bounds.width)
  })

  it('respawns at the bottom after rising past the top', () => {
    const ember = createEmber(bounds, seededRng())
    ember.y = -100
    stepEmber(ember, 0.016, bounds, 0, seededRng(42))
    expect(ember.y).toBeGreaterThan(bounds.height)
  })

  it('rises proportionally to dt', () => {
    const slow = createEmber(bounds, seededRng(7))
    const fast = { ...slow }
    stepEmber(slow, 0.01, bounds, 0)
    stepEmber(fast, 0.1, bounds, 0)
    expect(fast.y).toBeLessThan(slow.y)
  })
})
