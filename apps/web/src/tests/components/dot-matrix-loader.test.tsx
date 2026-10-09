import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DotMatrixLoader } from '@isyuricunha/yutheme'

/*
 * The dot matrix loader is the canonical thinking/working indicator: a 3x3
 * ring sweep with role=status and nine aria-hidden dots. These tests pin the
 * accessible contract and the agent variant class.
 */

describe('DotMatrixLoader', () => {
  it('renders nine dots with status semantics', () => {
    render(<DotMatrixLoader label='Loading' />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading')
    expect(screen.getAllByTestId('dot')).toHaveLength(9)
    expect(status.className).not.toContain('yu-dot-matrix--agent')
  })

  it('applies the agent variant for AI states', () => {
    render(<DotMatrixLoader agent label='Thinking' />)

    expect(screen.getByRole('status').className).toContain('yu-dot-matrix--agent')
  })
})
