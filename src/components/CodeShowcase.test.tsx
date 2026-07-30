import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CodeShowcase from '@/components/CodeShowcase'

describe('CodeShowcase', () => {
  it('shows the source snippet with alias requires by default', () => {
    render(<CodeShowcase />)
    expect(screen.getByText(/@pkg\/signal/)).toBeInTheDocument()
  })

  it('switches to the rewritten output on tab click', async () => {
    render(<CodeShowcase />)
    fireEvent.click(screen.getByRole('button', { name: 'dist/main.luau' }))
    expect(
      await screen.findByText(
        /@game\/ReplicatedStorage\/Packages\/signal/,
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
  })

  it('always displays the coldluau.toml alias config', () => {
    render(<CodeShowcase />)
    expect(screen.getByText(/\[aliases\]/)).toBeInTheDocument()
  })
})
