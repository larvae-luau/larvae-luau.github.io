import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders the hero headline', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Preprocess')
    expect(heading).toHaveTextContent('Luau')
    expect(heading).toHaveTextContent('sub-zero')
  })

  it('shows the install commands for lpm, lpx, and cargo', () => {
    render(<Home />)
    const quickStart = document.getElementById('quick-start')
    expect(quickStart?.textContent).toContain('lpm tool add coldluau')
    expect(quickStart?.textContent).toContain('lpx coldluau')
    expect(quickStart?.textContent).toContain('cargo install --path .')
  })

  it('presents the install commands as alternatives, not a sequence', () => {
    render(<Home />)
    const quickStart = document.getElementById('quick-start')
    expect(screen.getByText('pick one')).toBeInTheDocument()
    expect(quickStart?.textContent).toContain('# or')
    expect(quickStart?.textContent).toContain('not commands to run in order')
  })

  it('defaults the hero install command to lpm and switches on click', async () => {
    render(<Home />)
    const chip = screen.getByTestId('install-command')
    expect(chip.textContent).toContain('lpm tool add coldluau')
    fireEvent.click(screen.getByRole('button', { name: 'cargo' }))
    await waitFor(
      () => expect(chip.textContent).toContain('cargo install --path .'),
      { timeout: 3000 },
    )
  })

  it('renders the navbar with section links', () => {
    render(<Home />)
    const nav = screen.getByRole('navigation')
    expect(within(nav).getByText('Features')).toHaveAttribute(
      'href',
      '#features',
    )
    expect(within(nav).getByText('vs darklua')).toHaveAttribute(
      'href',
      '#comparison',
    )
    expect(within(nav).getByText('Quick start')).toHaveAttribute(
      'href',
      '#quick-start',
    )
  })

  it('gives Docs and GitHub button treatment, unlike the scroll links', () => {
    render(<Home />)
    const nav = screen.getByRole('navigation')
    const docs = within(nav).getByText('Docs')
    expect(docs).toHaveAttribute('href', '/docs')
    // the filled primary style marks it as the standout destination
    expect(docs.className).toContain('bg-ice')
    expect(within(nav).getByText('GitHub')).toHaveAttribute(
      'href',
      'https://github.com/coldluau/cli',
    )
  })

  it('renders all major sections', () => {
    render(<Home />)
    for (const id of [
      'features',
      'showcase',
      'comparison',
      'benchmarks',
      'quick-start',
    ]) {
      expect(document.getElementById(id)).toBeInTheDocument()
    }
  })

  it('renders the logo image', () => {
    render(<Home />)
    expect(screen.getByAltText(/coldluau logo/i)).toBeInTheDocument()
  })

  it('shows every benchmark workload with its speedup', () => {
    render(<Home />)
    for (const label of ['3,000 files', '5,000 files', '1 large file']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    for (const speedup of ['16.3x faster', '15.3x faster', '79.7x faster']) {
      expect(screen.getByText(speedup)).toBeInTheDocument()
    }
  })

  it('explains every benchmark column and the speedup basis', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    expect(screen.getByText('first build, empty cache')).toBeInTheDocument()
    expect(screen.getByText('rebuild with nothing changed')).toBeInTheDocument()
    expect(benchmarks?.textContent).toContain('rebuild after touching a single')
    expect(benchmarks?.textContent).toContain(
      'whole-project require validation',
    )
    expect(screen.getAllByText('cold vs darklua')).toHaveLength(3)
    // the one figure that reads as surprising is annotated in place
    expect(benchmarks?.textContent).toContain(
      'check is the only column that costs more than a cold build',
    )
  })

  it('shows cold, darklua, and incremental timings', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    // cold builds and the darklua baseline
    expect(screen.getByText('27 ms')).toBeInTheDocument()
    expect(screen.getByText('441 ms')).toBeInTheDocument()
    expect(screen.getByText('1356 ms')).toBeInTheDocument()
    // coldluau-only incremental columns
    for (const mode of ['warm', 'one edit', 'check']) {
      expect(benchmarks?.textContent).toContain(mode)
    }
    expect(screen.getByText('79 ms')).toBeInTheDocument()
  })

  it('mounts the snowfall canvas as decorative', () => {
    render(<Home />)
    const overlay = screen.getByTestId('snowfall-overlay')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay.className).toContain('pointer-events-none')
    expect(screen.getByTestId('snowfall-canvas')).toBeInTheDocument()
  })
})
