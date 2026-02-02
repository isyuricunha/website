import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SqlJokesBackground from '@/components/home/sql-jokes-background'

describe('<SqlJokesBackground />', () => {
  it('should render an aria-hidden background container', () => {
    const { container } = render(<SqlJokesBackground />)

    const root = container.querySelector('[aria-hidden="true"]')
    expect(root).toBeInTheDocument()
  })
})
