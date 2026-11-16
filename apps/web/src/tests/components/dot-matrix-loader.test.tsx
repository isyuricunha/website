// @vitest-environment happy-dom
import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

import { DotMatrixLoader } from '@isyuricunha/yutheme'

/*
 * The dot matrix loader is the canonical thinking/working indicator: a 3x3
 * ring sweep with role=status and nine aria-hidden dots. These tests pin the
 * accessible contract and the agent variant class using static rendering,
 * because the Testing Library render path hits a React act regression in the
 * full-suite worker environment.
 */

const count = (html: string, token: string) => html.split(token).length - 1

describe('DotMatrixLoader', () => {
  it('renders nine dots with status semantics', async () => {
    const html = await render(<DotMatrixLoader label='Loading' />)

    expect(html).toContain('role="status"')
    expect(html).toContain('aria-label="Loading"')
    expect(count(html, 'data-testid="dot"')).toBe(9)
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('yu-dot-matrix--agent')
  })

  it('applies the agent variant for AI states', async () => {
    const html = await render(<DotMatrixLoader agent label='Thinking' />)

    expect(html).toContain('yu-dot-matrix--agent')
  })
})
