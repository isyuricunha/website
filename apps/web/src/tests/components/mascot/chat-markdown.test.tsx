import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatMarkdown } from '@/components/mascot/components/chat-markdown'

describe('Nery Markdown', () => {
  it('renders safe public links and never loads remote images or private links', () => {
    render(
      <ChatMarkdown>
        {
          '[Public](/blog/hello) [Private](/admin) [External](https://example.invalid) ![Tracking](https://example.invalid/pixel.png)'
        }
      </ChatMarkdown>
    )
    expect(screen.getByRole('link', { name: 'Public' })).toHaveAttribute('href', '/blog/hello')
    expect(screen.queryByRole('link', { name: 'Private' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'External' })).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })
  it('only links grounded sources in a fresh assistant message', () => {
    render(
      <ChatMarkdown allowedHrefs={['/blog/hello']}>
        {'[Known](/blog/hello) [Unknown](/blog/invented)'}
      </ChatMarkdown>
    )
    expect(screen.getByRole('link', { name: 'Known' })).toHaveAttribute('href', '/blog/hello')
    expect(screen.queryByRole('link', { name: 'Unknown' })).toBeNull()
  })
  it('renders Markdown tables without allowing raw HTML', () => {
    render(
      <ChatMarkdown>
        {'| A | B |\n| --- | --- |\n| one | two |\n\n<img src="https://example.invalid/pixel">'}
      </ChatMarkdown>
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })
})
