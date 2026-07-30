import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Without vitest globals, testing-library's auto-cleanup never registers.
afterEach(() => {
  cleanup()
})

// jsdom has no matchMedia; motion and Snowfall both query it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// motion's whileInView needs IntersectionObserver.
class IntersectionObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverStub,
})

// jsdom's canvas has no 2d context; Snowfall bails out gracefully on null.
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
})
