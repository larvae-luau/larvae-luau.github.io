import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Hero from '@/components/Hero'
import Tilt from '@/components/Tilt'
import { LITE_MOTION_QUERY } from '@/lib/use-lite-motion'

const desktopMatchMedia = window.matchMedia

/** Answers only the coarse-pointer query, so the rest keeps its setup default. */
function useTouchDevice() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query === LITE_MOTION_QUERY,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: desktopMatchMedia,
  })
})

describe('Tilt on a coarse pointer', () => {
  it('keeps the 3D layer for a mouse', () => {
    render(
      <Tilt>
        <span data-testid="tilted" />
      </Tilt>,
    )
    const wrapper = screen.getByTestId('tilted').parentElement
    expect(wrapper?.style.transformStyle).toBe('preserve-3d')
  })

  it('drops to a plain wrapper for a finger', () => {
    useTouchDevice()
    render(
      <Tilt>
        <span data-testid="tilted" />
      </Tilt>,
    )
    // No hover means the tilt can never fire, so the compositing hints that
    // come with it are pure cost on exactly the devices that can least afford
    // them — every button and feature card wraps one.
    const wrapper = screen.getByTestId('tilted').parentElement
    expect(wrapper?.style.transformStyle).toBe('')
    expect(wrapper?.style.willChange).toBe('')
  })
})

describe('Hero on a coarse pointer', () => {
  it('still renders the headline, logo, and install chip', () => {
    useTouchDevice()
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'sub-zero',
    )
    expect(screen.getByAltText(/coldluau logo/i)).toBeInTheDocument()
    expect(screen.getByTestId('install-command').textContent).toContain(
      'lpm tool add coldluau',
    )
  })

  it('shows the scroll cue for a mouse', () => {
    render(<Hero />)
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('hides the scroll cue, which the taller hero pushes off screen', () => {
    useTouchDevice()
    render(<Hero />)
    expect(screen.queryByText('↓')).not.toBeInTheDocument()
  })
})
