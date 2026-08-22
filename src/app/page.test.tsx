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
    expect(heading).toHaveTextContent('Format')
    expect(heading).toHaveTextContent('lint')
    expect(heading).toHaveTextContent('ship')
    expect(heading).toHaveTextContent('Luau')
  })

  it('shows the install commands for lpm, lpx, and cargo', () => {
    render(<Home />)
    const quickStart = document.getElementById('quick-start')
    expect(quickStart?.textContent).toContain('lpm tool add larvae')
    expect(quickStart?.textContent).toContain('lpx larvae')
    expect(quickStart?.textContent).toContain('cargo install larvae')
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
    expect(chip.textContent).toContain('lpm tool add larvae')
    fireEvent.click(screen.getByRole('button', { name: 'cargo' }))
    await waitFor(
      () => expect(chip.textContent).toContain('cargo install larvae'),
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
    expect(docs.className).toContain('bg-hive')
    expect(within(nav).getByText('GitHub')).toHaveAttribute(
      'href',
      'https://github.com/larvae-luau/larvae',
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
    expect(screen.getByAltText(/larvae logo/i)).toBeInTheDocument()
  })

  it('shows every benchmark workload with its speedup', () => {
    render(<Home />)
    // each workload appears twice, once head to head and once incremental
    for (const label of ['3,000 files', '5,000 files', '1 large file']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    // 3,000 and 5,000 files both land on 14.0x
    expect(screen.getAllByText('14.0x faster')).toHaveLength(2)
    expect(screen.getByText('10.3x faster')).toBeInTheDocument()
  })

  it('defines each workload and states the caveats', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    for (const term of ['same rules', 'parse only', 'darklua default']) {
      expect(benchmarks?.textContent).toContain(term)
    }
    // the run conditions, so a reader can judge the numbers
    expect(benchmarks?.textContent).toContain('7 runs per cell')
    expect(benchmarks?.textContent).toContain('darklua 0.19.0')
    // the narrowest win is called out rather than buried
    expect(benchmarks?.textContent).toContain(
      'the workload larvae wins by the smallest margin',
    )
  })

  it('leads with the matched comparison, not the flattering one', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    // the badge quotes same-rules, the defensible apples to apples figure
    expect(screen.getAllByText('same rules, both cold')).toHaveLength(3)
    expect(benchmarks?.textContent).toContain(
      'both tools run 10 matching rules',
    )
    // the flattering parse-only figure is still shown, just not as the headline
    expect(benchmarks?.textContent).toContain('17.9x')
    expect(benchmarks?.textContent).toContain('75.3x')
  })

  it('refuses to claim a speedup against darklua default', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    expect(benchmarks?.textContent).toContain('571 ms')
    expect(benchmarks?.textContent).toContain('No speedup is claimed')
  })

  it('shows the linter benchmark against selene with its caveats', () => {
    render(<Home />)
    const benchmarks = document.getElementById('benchmarks')
    const table = screen.getByTestId('lint-table')
    expect(table.textContent).toContain('matched')
    expect(table.textContent).toContain('5.9x')
    expect(benchmarks?.textContent).toContain(
      '63 lints for larvae, 33 for selene',
    )
    // the flattering single-file figure is framed as throughput, not headline
    expect(benchmarks?.textContent).toContain('279x')
    expect(benchmarks?.textContent).toContain('floor on the gap')
  })

  it('shows the incremental columns as larvae only', () => {
    render(<Home />)
    const table = screen.getByTestId('incremental-table')
    for (const mode of ['cold', 'warm', 'one edit', 'check']) {
      expect(table.textContent).toContain(mode)
    }
    expect(document.getElementById('benchmarks')?.textContent).toContain(
      'darklua has no cache',
    )
  })

  it('mounts the snowfall canvas as decorative', () => {
    render(<Home />)
    const overlay = screen.getByTestId('embers-overlay')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay.className).toContain('pointer-events-none')
    expect(screen.getByTestId('embers-canvas')).toBeInTheDocument()
  })
})
